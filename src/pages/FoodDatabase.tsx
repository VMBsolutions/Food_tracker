import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Pencil, Trash2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { FoodItem } from '../types';
import { searchAllFoods, getAllCategories, isCustomFood } from '../services/foodDatabase';
import { useAllFoods } from '../hooks/useAllFoods';
import { FoodFormModal } from '../components/FoodFormModal';

export function FoodDatabase() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allFoods = useAllFoods();
  const removeFoodMutation = useMutation(api.customFoods.remove);
  const removeFood = (id: string) => removeFoodMutation({ id: id as Id<'customFoods'> });

  const categories = useMemo(() => getAllCategories(allFoods), [allFoods]);

  const results = useMemo(() => {
    let foods = searchAllFoods(allFoods, query);
    if (category) foods = foods.filter(f => f.category === category);
    return foods;
  }, [allFoods, query, category]);

  const handleEdit = (food: FoodItem) => {
    setEditingFood(food);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    removeFood(id);
    setDeleteConfirm(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFood(undefined);
  };

  return (
    <div>
      <motion.div
        className="page-header animate-in"
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <div>
          <h2>Food Database</h2>
          <p>Browse {results.length} foods with full nutrition data</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingFood(undefined); setShowForm(true); }}
        >
          <Plus size={16} />
          Add Food
        </button>
      </motion.div>

      {/* Search & filters */}
      <motion.div className="animate-in animate-in-delay-1" style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--stone-light)',
            }}
          />
          <input
            type="text"
            placeholder="Search foods by name or category..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              paddingLeft: 44,
              padding: '14px 16px 14px 44px',
              fontSize: '1rem',
              borderRadius: 'var(--radius-lg)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--stone-light)', marginRight: 4 }} />
          <button
            className={`badge ${!category ? 'badge-terracotta' : 'badge-forest'}`}
            onClick={() => setCategory(null)}
            style={{ cursor: 'pointer', padding: '5px 14px', fontSize: '0.73rem' }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`badge ${category === cat ? 'badge-terracotta' : 'badge-forest'}`}
              onClick={() => setCategory(category === cat ? null : cat)}
              style={{ cursor: 'pointer', padding: '5px 14px', fontSize: '0.73rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Food grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {results.map((food, i) => {
          const isCustom = isCustomFood(food.id);
          const isDeleting = deleteConfirm === food.id;

          return (
            <motion.div
              key={food.id}
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
              style={{ padding: '20px', cursor: 'default', position: 'relative' }}
            >
              {/* Custom badge + actions */}
              {isCustom && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                }}>
                  <span className="badge badge-terracotta" style={{ fontSize: '0.6rem', marginRight: 4 }}>
                    Custom
                  </span>
                  <button
                    className="btn-icon btn-ghost"
                    onClick={() => handleEdit(food)}
                    style={{ width: 28, height: 28, color: 'var(--stone)' }}
                    title="Edit food"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="btn-icon btn-ghost"
                    onClick={() => setDeleteConfirm(isDeleting ? null : food.id)}
                    style={{ width: 28, height: 28, color: isDeleting ? 'var(--rose)' : 'var(--stone)' }}
                    title="Delete food"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

              {/* Delete confirmation */}
              <AnimatePresence>
                {isDeleting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: 'rgba(201, 115, 109, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--rose)', fontWeight: 500 }}>
                      Delete this food?
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-strong)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(food.id)}
                        style={{
                          background: 'var(--rose)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{
                  fontSize: '1.8rem',
                  lineHeight: 1,
                  width: 40,
                  textAlign: 'center',
                }}>
                  {food.emoji || '🍽️'}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: 'var(--forest)',
                    marginBottom: 2,
                  }}>
                    {food.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {food.servingSize}
                  </p>
                </div>
                {!isCustom && (
                  <span className="badge badge-forest" style={{ fontSize: '0.65rem' }}>
                    {food.category}
                  </span>
                )}
              </div>

              {/* Nutrition grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                marginTop: 16,
                padding: '12px',
                background: 'var(--cream)',
                borderRadius: 'var(--radius-md)',
              }}>
                {[
                  { label: 'Cal', value: food.nutrition.calories, color: 'var(--terracotta)' },
                  { label: 'Prot', value: `${food.nutrition.protein}g`, color: 'var(--sky)' },
                  { label: 'Carb', value: `${food.nutrition.carbs}g`, color: 'var(--amber)' },
                  { label: 'Fat', value: `${food.nutrition.fat}g`, color: 'var(--rose)' },
                ].map(n => (
                  <div key={n.label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: n.color,
                    }}>
                      {n.value}
                    </div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      {n.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {results.length === 0 && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">🔍</div>
          <p>No foods found. Try a different search term or add a custom food.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <FoodFormModal food={editingFood} onClose={handleCloseForm} />
        )}
      </AnimatePresence>
    </div>
  );
}
