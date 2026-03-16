import Anthropic from '@anthropic-ai/sdk';
import type { FoodItem, MealType } from '../types';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  loggedEntries?: LoggedMealEntry[];
}

export interface LoggedMealEntry {
  foodName: string;
  mealType: MealType;
  amountGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  wasCustomFood: boolean;
}

export interface LogMealToolCall {
  entries: Array<{
    food_name: string;
    meal_type: MealType;
    amount_grams: number;
    matched_food_id?: string;
    estimated_nutrition?: {
      calories_per_100g: number;
      protein_per_100g: number;
      carbs_per_100g: number;
      fat_per_100g: number;
    };
  }>;
}

const LOG_MEAL_TOOL: Anthropic.Tool = {
  name: 'log_meal_entries',
  description:
    "Log one or more food entries to the user's meal tracker. Call this once you have enough information about what the user ate. You can log multiple foods in a single call.",
  input_schema: {
    type: 'object',
    properties: {
      entries: {
        type: 'array',
        description: 'Array of food entries to log',
        items: {
          type: 'object',
          properties: {
            food_name: {
              type: 'string',
              description: 'Common name of the food (e.g., "Brown Rice", "Scrambled Eggs")',
            },
            meal_type: {
              type: 'string',
              enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
              description: 'Which meal this food belongs to',
            },
            amount_grams: {
              type: 'number',
              description: 'Total weight of this food in grams',
            },
            matched_food_id: {
              type: 'string',
              description:
                'If this food matches an entry in the food database, provide its id (e.g., "f15" for Brown Rice). Omit if not matched.',
            },
            estimated_nutrition: {
              type: 'object',
              description:
                'Required only if matched_food_id is NOT provided. Estimated nutrition per 100g.',
              properties: {
                calories_per_100g: { type: 'number' },
                protein_per_100g: { type: 'number' },
                carbs_per_100g: { type: 'number' },
                fat_per_100g: { type: 'number' },
              },
              required: [
                'calories_per_100g',
                'protein_per_100g',
                'carbs_per_100g',
                'fat_per_100g',
              ],
            },
          },
          required: ['food_name', 'meal_type', 'amount_grams'],
        },
      },
    },
    required: ['entries'],
  },
};

function buildFoodContext(allFoods: FoodItem[]): string {
  return allFoods
    .map(f => {
      const n = f.nutrition;
      return `- ${f.name} (${f.id}): ${f.servingGrams}g per serving (${f.servingSize}) | ${n.calories} cal, ${n.protein}g protein, ${n.carbs}g carbs, ${n.fat}g fat`;
    })
    .join('\n');
}

function buildSystemPrompt(allFoods: FoodItem[], selectedDate: string): string {
  const today = new Date().toISOString().split('T')[0];
  const foodContext = buildFoodContext(allFoods);

  return `You are Nourish, a warm and knowledgeable nutrition assistant built into a food tracking app.

Today's date is ${today}. The user is currently tracking meals for: ${selectedDate}.

Your role is to help users log their meals through natural conversation. When a user tells you what they ate:
1. If quantities are vague or missing, ask ONE focused follow-up question to clarify amounts — not multiple questions at once.
2. Once you have enough information, use the log_meal_entries tool to record the meal immediately. Do not ask for confirmation before logging.
3. For meal type (breakfast/lunch/dinner/snacks): infer from context or time of day mentioned. Ask only if truly ambiguous.
4. Match foods to the database when possible. If a food isn't in the database, estimate reasonable nutrition values per 100g based on your knowledge.
5. Keep responses concise and conversational. Use a warm, encouraging tone — you are part of an app called Nourish.
6. After logging, give a brief encouraging summary of what was logged.

Standard gram conversions to use:
- 1 large egg ≈ 60g (whole), scrambled/cooked ≈ 61g per egg
- 1 cup cooked rice ≈ 195g
- 1 cup cooked oatmeal ≈ 234g
- 1 medium banana ≈ 118g
- 1 chicken breast (medium) ≈ 170g
- 1 cup milk ≈ 244g
- 1 slice bread ≈ 46g

Available foods in the database:
${foodContext}

When logging, always provide amount_grams. Match to matched_food_id when the food clearly corresponds to a database entry. For unrecognized foods, provide estimated_nutrition per 100g.`;
}

export async function sendMessage(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string,
  allFoods: FoodItem[],
  selectedDate: string,
  onStreamChunk: (delta: string) => void,
  onToolCall: (input: LogMealToolCall) => Promise<LoggedMealEntry[]>,
): Promise<{ finalText: string; loggedEntries: LoggedMealEntry[] | null }> {
  const client = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const messages: Anthropic.MessageParam[] = [
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: newUserMessage },
  ];

  const systemPrompt = buildSystemPrompt(allFoods, selectedDate);

  try {
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [LOG_MEAL_TOOL],
      tool_choice: { type: 'auto' },
      messages,
    });

    stream.on('text', (text) => {
      onStreamChunk(text);
    });

    const finalMessage = await stream.finalMessage();

    if (finalMessage.stop_reason === 'tool_use') {
      const toolUseBlock = finalMessage.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      if (!toolUseBlock) {
        throw new Error('Tool use expected but not found');
      }

      const toolInput = toolUseBlock.input as LogMealToolCall;
      const loggedEntries = await onToolCall(toolInput);

      // Build the assistant message content (may include text + tool_use blocks)
      const assistantContent = finalMessage.content;

      // Send follow-up with tool result to get Claude's summary
      const followUpMessages: Anthropic.MessageParam[] = [
        ...messages,
        { role: 'assistant', content: assistantContent },
        {
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUseBlock.id,
              content: JSON.stringify({
                success: true,
                logged: loggedEntries.map(e => ({
                  food: e.foodName,
                  meal: e.mealType,
                  grams: e.amountGrams,
                  calories: e.calories,
                })),
              }),
            },
          ],
        },
      ];

      const summaryResponse = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        tools: [LOG_MEAL_TOOL],
        tool_choice: { type: 'none' } as Anthropic.ToolChoiceNone,
        messages: followUpMessages,
      });

      const summaryText =
        summaryResponse.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map(b => b.text)
          .join('') || 'Logged successfully!';

      return { finalText: summaryText, loggedEntries };
    }

    // Normal end_turn — no tool was called
    const finalText = finalMessage.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    return { finalText, loggedEntries: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Claude API error: ${message}`);
  }
}
