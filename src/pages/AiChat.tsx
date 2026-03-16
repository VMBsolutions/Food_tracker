import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Check, ChevronRight } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStore } from '../store/useStore';
import { useAllFoods } from '../hooks/useAllFoods';
import { defaultFoods } from '../services/foodDatabase';
import { sendMessage, type ChatMessage, type LoggedMealEntry, type LogMealToolCall } from '../services/claudeService';
import type { MealType } from '../types';

const EXAMPLE_PROMPTS = [
  'I had oatmeal for breakfast',
  'Just ate grilled chicken and brown rice for lunch',
  'Snacked on almonds and an apple',
  'Had a protein shake after my workout',
];

const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snacks: '🍎',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px' }}
      className="chat-bubble-assistant" >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--forest)', marginRight: 4, flexShrink: 0 }} />
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function LogConfirmationCard({ entries }: { entries: LoggedMealEntry[] }) {
  const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
  const totalProtein = entries.reduce((s, e) => s + e.protein, 0);
  const totalCarbs = entries.reduce((s, e) => s + e.carbs, 0);
  const totalFat = entries.reduce((s, e) => s + e.fat, 0);

  return (
    <div className="log-confirm-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Check size={13} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sage)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Logged to your diary
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{MEAL_EMOJI[entry.mealType]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--forest)', fontSize: '0.9rem' }}>
                  {entry.foodName}
                  {entry.wasCustomFood && (
                    <span style={{ fontSize: '0.7rem', background: 'var(--terracotta-glow)', color: 'var(--terracotta)', borderRadius: 4, padding: '1px 6px', marginLeft: 6 }}>
                      Custom
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{entry.amountGrams}g</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--terracotta)', fontWeight: 600 }}>{Math.round(entry.calories)} kcal</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>P {entry.protein.toFixed(1)}g</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>C {entry.carbs.toFixed(1)}g</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>F {entry.fat.toFixed(1)}g</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {entries.length > 1 && (
        <div style={{ borderTop: '1px solid var(--sage-pale)', marginTop: 12, paddingTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total:</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--terracotta)', fontWeight: 600 }}>{Math.round(totalCalories)} kcal</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>P {totalProtein.toFixed(1)}g</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>C {totalCarbs.toFixed(1)}g</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>F {totalFat.toFixed(1)}g</span>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <div className="chat-bubble-user" style={{ padding: '12px 16px', maxWidth: '70%', fontSize: '0.925rem', lineHeight: 1.5 }}>
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--forest)', marginTop: 20, flexShrink: 0 }} />
      <div style={{ maxWidth: '75%' }}>
        <div className="chat-bubble-assistant" style={{ padding: '14px 18px', fontSize: '0.925rem', lineHeight: 1.6 }}>
          {message.content}
          {isStreaming && <span className="streaming-cursor" />}
        </div>
        {message.loggedEntries && message.loggedEntries.length > 0 && (
          <LogConfirmationCard entries={message.loggedEntries} />
        )}
      </div>
    </motion.div>
  );
}

function WelcomePrompts({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '48px 24px', textAlign: 'center', gap: 24 }}
    >
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--sage-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={30} color="var(--sage)" />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--forest)', marginBottom: 8 }}>
          What did you eat?
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 360 }}>
          Just tell me naturally — I'll ask if I need more details, then log it for you automatically.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 500 }}>
        {EXAMPLE_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            style={{
              background: 'var(--cream)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--cream)')}
          >
            <ChevronRight size={12} />
            {prompt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addEntryMutation = useMutation(api.entries.add);
  const addFoodMutation = useMutation(api.customFoods.add);
  const selectedDate = useStore(s => s.selectedDate);
  const allFoods = useAllFoods();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  function handleTextareaInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleToolCall(toolInput: LogMealToolCall): Promise<LoggedMealEntry[]> {
    return Promise.all(
      toolInput.entries.map(async entry => {
        if (entry.matched_food_id) {
          // Look up in the merged food list (default + custom already in allFoods)
          const food = allFoods.find(f => f.id === entry.matched_food_id)
            ?? defaultFoods.find(f => f.id === entry.matched_food_id);
          if (food) {
            const servings = entry.amount_grams / food.servingGrams;
            const scale = servings;
            const nutrition = {
              calories: food.nutrition.calories * scale,
              protein: food.nutrition.protein * scale,
              carbs: food.nutrition.carbs * scale,
              fat: food.nutrition.fat * scale,
              fiber: food.nutrition.fiber ? food.nutrition.fiber * scale : undefined,
            };
            await addEntryMutation({
              foodId: food.id,
              foodName: food.name,
              meal: entry.meal_type,
              servings,
              nutrition,
              date: selectedDate,
            });
            return {
              foodName: food.name,
              mealType: entry.meal_type,
              amountGrams: entry.amount_grams,
              calories: nutrition.calories,
              protein: nutrition.protein,
              carbs: nutrition.carbs,
              fat: nutrition.fat,
              wasCustomFood: false,
            };
          }
        }

        // Unknown food — create custom food then log it
        const est = entry.estimated_nutrition ?? { calories_per_100g: 100, protein_per_100g: 5, carbs_per_100g: 15, fat_per_100g: 3 };
        const scale = entry.amount_grams / 100;
        const nutrition = {
          calories: est.calories_per_100g * scale,
          protein: est.protein_per_100g * scale,
          carbs: est.carbs_per_100g * scale,
          fat: est.fat_per_100g * scale,
        };

        const newFoodId = await addFoodMutation({
          name: entry.food_name,
          category: 'Custom',
          servingSize: `${entry.amount_grams}g`,
          servingGrams: entry.amount_grams,
          nutrition,
          emoji: '🍽️',
        });

        await addEntryMutation({
          foodId: newFoodId,
          foodName: entry.food_name,
          meal: entry.meal_type,
          servings: 1,
          nutrition,
          date: selectedDate,
        });

        return {
          foodName: entry.food_name,
          mealType: entry.meal_type,
          amountGrams: entry.amount_grams,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          wasCustomFood: true,
        };
      }),
    );
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingText('');

    // Build history from existing messages (strip loggedEntries for API)
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const { finalText, loggedEntries } = await sendMessage(
        history,
        text,
        allFoods,
        selectedDate,
        (delta) => setStreamingText(prev => prev + delta),
        handleToolCall,
      );

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: finalText,
        loggedEntries: loggedEntries ?? undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)', maxHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        className="page-header animate-in"
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}
      >
        <div>
          <h2>AI Assistant</h2>
          <p>Tell me what you ate and I'll log it for you</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--sage-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} color="var(--sage)" />
        </div>
      </motion.div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '0 0 16px' }}>
        <AnimatePresence>
          {messages.length === 0 && !isLoading ? (
            <WelcomePrompts onSelect={val => { setInput(val); textareaRef.current?.focus(); }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}

              {/* Live streaming bubble */}
              {isLoading && streamingText && (
                <MessageBubble
                  message={{ role: 'assistant', content: streamingText }}
                  isStreaming
                />
              )}

              {/* Typing indicator — while waiting for first token */}
              {isLoading && !streamingText && <TypingIndicator />}
            </div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              margin: '8px 0',
              padding: '12px 16px',
              background: 'rgba(196,112,75,0.08)',
              border: '1px solid var(--terracotta)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--terracotta)',
              fontSize: '0.875rem',
            }}
          >
            {error.includes('API key') || error.includes('401')
              ? 'Invalid API key. Please check your VITE_ANTHROPIC_API_KEY in the .env file.'
              : error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid var(--border)',
        paddingTop: 16,
        paddingBottom: 8,
        background: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what you ate…"
            disabled={isLoading}
            style={{
              flex: 1,
              resize: 'none',
              overflow: 'hidden',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.925rem',
              color: 'var(--text-primary)',
              background: 'var(--bg-card)',
              outline: 'none',
              lineHeight: 1.5,
              maxHeight: 120,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 14px',
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
