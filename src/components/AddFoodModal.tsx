import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Minus, Plus, ChevronRight } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { MealType, FoodItem } from '../types';
import { searchAllFoods, getAllCategories } from '../services/foodDatabase';
import { getMealEmoji, getMealLabel, scaleNutrition } from '../utils';
import { useStore } from '../store/useStore';
import { useAllFoods } from '../hooks/useAllFoods';

interface AddFoodModalProps {
  meal: MealType;
  onClose: () => void;
}

export function AddFoodModal({ meal, onClose }: AddFoodModalProps) {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addEntryMutation = useMutation(api.entries.add);
  const selectedDate = useStore(s => s.selectedDate);
  const allFoods = useAllFoods();

  const categories = useMemo(() => getAllCategories(allFoods), [allFoods]);
  const results = useMemo(() => {
    let foods = searchAllFoods(allFoods, query);
    if (selectedCategory) {
      foods = foods.filter(f => f.category === selectedCategory);
    }
    return foods;
  }, [allFoods, query, selectedCategory]);

  const handleAdd = async () => {
    if (!selectedFood) return;
    const scaled = scaleNutrition(selectedFood.nutrition, servings);
    await addEntryMutation({
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      meal,
      servings,
      nutrition: {
        calories: scaled.calories,
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
        fiber: scaled.fiber,
      },
      date: selectedDate,
    });
    onClose();
  };

  const scaledNutrition = selectedFood ? scaleNutrition(selectedFood.nutrition, servings) : null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
      >
        {!selectedFood ? (
          <>
            <div className="modal-header">
              <div>
                <h3>
                  {getMealEmoji(meal)} Add to {getMealLabel(meal)}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Search or browse foods below
                </p>
              </div>
              <button className="btn-icon btn-ghost" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--stone-light)',
                }}
              />
              <input
                type="text"
                placeholder="Search foods..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                style={{ paddingLeft: 42 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              <button
                className={`badge ${!selectedCategory ? 'badge-terracotta' : 'badge-forest'}`}
                onClick={() => setSelectedCategory(null)}
                style={{ cursor: 'pointer', padding: '5px 12px', fontSize: '0.72rem' }}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`badge ${selectedCategory === cat ? 'badge-terracotta' : 'badge-forest'}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  style={{ cursor: 'pointer', padding: '5px 12px', fontSize: '0.72rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: 340, overflowY: 'auto', margin: '0 -8px' }}>
              {results.map(food => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setServings(1);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: 12, width: 28, textAlign: 'center' }}>
                    {food.emoji || '🍽️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {food.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {food.servingSize} · {food.nutrition.calories} kcal
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--stone-light)' }} />
                </button>
              ))}
              {results.length === 0 && (
                <div className="empty-state" style={{ padding: '32px 16px' }}>
                  <div className="empty-state-icon">🔍</div>
                  <p>No foods found matching "{query}"</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="modal-header">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedFood(null)}
                style={{ marginLeft: -8 }}
              >
                ← Back
              </button>
              <button className="btn-icon btn-ghost" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>
                {selectedFood.emoji || '🍽️'}
              </span>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                color: 'var(--forest)',
                fontWeight: 700,
              }}>
                {selectedFood.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {selectedFood.servingSize} per serving
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              marginBottom: 28,
              padding: '16px',
              background: 'var(--cream)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <button
                className="btn-icon"
                onClick={() => setServings(Math.max(0.25, servings - 0.25))}
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-strong)',
                  borderRadius: 'var(--radius-full)',
                  width: 40,
                  height: 40,
                }}
              >
                <Minus size={16} />
              </button>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--forest)',
                }}>
                  {servings}
                </span>
                <span style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {servings === 1 ? 'serving' : 'servings'}
                </span>
              </div>
              <button
                className="btn-icon"
                onClick={() => setServings(servings + 0.25)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-strong)',
                  borderRadius: 'var(--radius-full)',
                  width: 40,
                  height: 40,
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {scaledNutrition && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginBottom: 28,
              }}>
                {[
                  { label: 'Calories', value: scaledNutrition.calories, color: 'var(--terracotta)' },
                  { label: 'Protein', value: scaledNutrition.protein, color: 'var(--sky)' },
                  { label: 'Carbs', value: scaledNutrition.carbs, color: 'var(--amber)' },
                  { label: 'Fat', value: scaledNutrition.fat, color: 'var(--rose)' },
                ].map(macro => (
                  <div key={macro.label} style={{
                    textAlign: 'center',
                    padding: '14px 8px',
                    background: 'var(--cream)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: macro.color,
                    }}>
                      {macro.value}
                    </div>
                    <div style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginTop: 2,
                    }}>
                      {macro.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
            >
              Add to {getMealLabel(meal)}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
