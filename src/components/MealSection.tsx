import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import type { MealType, LogEntry } from '../types';
import { getMealEmoji, getMealLabel } from '../utils';

interface MealSectionProps {
  meal: MealType;
  entries: LogEntry[];
  onAddFood: (meal: MealType) => void;
  onRemoveEntry: (id: string) => void;
}

export function MealSection({ meal, entries, onAddFood, onRemoveEntry }: MealSectionProps) {
  const totalCals = entries.reduce((sum, e) => sum + e.nutrition.calories, 0);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: entries.length > 0 ? '1px solid var(--border)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.3rem' }}>{getMealEmoji(meal)}</span>
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--forest)',
            }}>
              {getMealLabel(meal)}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {totalCals > 0 ? `${totalCals} kcal` : 'No entries yet'}
            </span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onAddFood(meal)}
          style={{ gap: 6 }}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(250, 245, 235, 0.4)',
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {entry.foodName}
              </span>
              {entry.servings !== 1 && (
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginLeft: 8,
                }}>
                  x{entry.servings}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="macro-tag protein">P {entry.nutrition.protein}g</span>
                <span className="macro-tag carbs">C {entry.nutrition.carbs}g</span>
                <span className="macro-tag fat">F {entry.nutrition.fat}g</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--terracotta)',
                minWidth: 52,
                textAlign: 'right',
              }}>
                {entry.nutrition.calories}
              </span>
              <button
                className="btn-icon btn-ghost"
                onClick={() => onRemoveEntry(entry.id)}
                style={{ color: 'var(--stone-light)' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {entries.length === 0 && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--stone-light)',
          fontSize: '0.85rem',
          fontStyle: 'italic',
        }}>
          Tap "Add" to log your {meal}
        </div>
      )}
    </div>
  );
}
