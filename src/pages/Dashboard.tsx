import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Flame, Drumstick, Wheat, Droplets } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { CalorieRing } from '../components/CalorieRing';
import { MacroBar } from '../components/MacroBar';
import { MealSection } from '../components/MealSection';
import { DatePicker } from '../components/DatePicker';
import { WeeklyChart } from '../components/WeeklyChart';
import { AddFoodModal } from '../components/AddFoodModal';
import { GoalsModal } from '../components/GoalsModal';
import { useDailySummary } from '../hooks/useDailySummary';
import { useStore } from '../store/useStore';
import type { MealType, LogEntry } from '../types';

const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export function Dashboard() {
  const [addMeal, setAddMeal] = useState<MealType | null>(null);
  const [showGoals, setShowGoals] = useState(false);
  const { summary, goals, percentages } = useDailySummary();
  const selectedDate = useStore(s => s.selectedDate);
  const removeEntryMutation = useMutation(api.entries.remove);
  const convexEntries = useQuery(api.entries.getByDate, { date: selectedDate }) ?? [];

  const entries: LogEntry[] = convexEntries.map(e => ({
    id: e._id,
    foodId: e.foodId,
    foodName: e.foodName,
    meal: e.meal,
    servings: e.servings,
    nutrition: e.nutrition,
    timestamp: e.timestamp,
    date: e.date,
  }));

  const removeEntry = (id: string) => removeEntryMutation({ entryId: id as Id<'entries'> });

  const mealEntries = (meal: MealType) =>
    entries.filter(e => e.date === selectedDate && e.meal === meal);

  return (
    <div>
      {/* Header */}
      <motion.div
        className="page-header animate-in"
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <div>
          <h2>Dashboard</h2>
          <p>Track your daily nutrition journey</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowGoals(true)}
          style={{ marginTop: 4 }}
        >
          <Target size={16} />
          Set Goals
        </button>
      </motion.div>

      {/* Date picker */}
      <motion.div className="animate-in animate-in-delay-1" style={{ marginBottom: 28 }}>
        <DatePicker />
      </motion.div>

      {/* Main grid: ring + macros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, marginBottom: 28 }}>
        {/* Calorie ring card */}
        <motion.div className="card animate-in animate-in-delay-2" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          background: 'linear-gradient(135deg, #ffffff 0%, var(--cream) 100%)',
        }}>
          <CalorieRing consumed={summary.totalCalories} goal={goals.calories} size={210} />

          {/* Quick stats */}
          <div style={{
            display: 'flex',
            gap: 24,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border)',
            width: '100%',
            justifyContent: 'center',
          }}>
            {[
              { icon: Flame, label: 'Goal', value: `${goals.calories}`, color: 'var(--terracotta)' },
              { icon: Drumstick, label: 'Eaten', value: `${summary.totalCalories}`, color: 'var(--forest)' },
              { icon: Droplets, label: 'Left', value: `${Math.max(goals.calories - summary.totalCalories, 0)}`, color: 'var(--sage)' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <stat.icon size={16} style={{ color: stat.color, marginBottom: 4 }} />
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: stat.color,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Macros card */}
        <motion.div className="card animate-in animate-in-delay-3" style={{ padding: '28px' }}>
          <div className="card-header" style={{ marginBottom: 20 }}>
            <h3 className="card-title">
              <Wheat size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom', color: 'var(--sage)' }} />
              Macronutrients
            </h3>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              fontFamily: 'var(--font-display)',
            }}>
              {Math.round(percentages.calories)}% of daily goal
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <MacroBar
              label="Protein"
              current={summary.totalProtein}
              goal={goals.protein}
              color="var(--sky)"
              delay={0}
            />
            <MacroBar
              label="Carbohydrates"
              current={summary.totalCarbs}
              goal={goals.carbs}
              color="var(--amber)"
              delay={0.1}
            />
            <MacroBar
              label="Fat"
              current={summary.totalFat}
              goal={goals.fat}
              color="var(--rose)"
              delay={0.2}
            />
          </div>

          {/* Macro split visual */}
          <div style={{
            marginTop: 24,
            padding: '14px 16px',
            background: 'var(--cream)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              flex: 1,
              height: 6,
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              display: 'flex',
              background: 'var(--cream-dark)',
            }}>
              {summary.totalCalories > 0 && (
                <>
                  <div style={{
                    width: `${(summary.totalProtein * 4 / (summary.totalCalories || 1)) * 100}%`,
                    background: 'var(--sky)',
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{
                    width: `${(summary.totalCarbs * 4 / (summary.totalCalories || 1)) * 100}%`,
                    background: 'var(--amber)',
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{
                    width: `${(summary.totalFat * 9 / (summary.totalCalories || 1)) * 100}%`,
                    background: 'var(--rose)',
                    transition: 'width 0.5s ease',
                  }} />
                </>
              )}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Calorie split
            </span>
          </div>
        </motion.div>
      </div>

      {/* Weekly chart */}
      <div style={{ marginBottom: 28 }}>
        <WeeklyChart />
      </div>

      {/* Meal sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          color: 'var(--forest)',
          fontWeight: 600,
        }}>
          Today's Meals
        </h3>
        {meals.map((meal, i) => (
          <motion.div
            key={meal}
            className={`animate-in animate-in-delay-${i + 1}`}
          >
            <MealSection
              meal={meal}
              entries={mealEntries(meal)}
              onAddFood={setAddMeal}
              onRemoveEntry={removeEntry}
            />
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addMeal && <AddFoodModal meal={addMeal} onClose={() => setAddMeal(null)} />}
        {showGoals && <GoalsModal onClose={() => setShowGoals(false)} />}
      </AnimatePresence>
    </div>
  );
}
