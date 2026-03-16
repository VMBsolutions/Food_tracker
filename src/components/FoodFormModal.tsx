import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Pencil } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { FoodItem } from '../types';

interface FoodFormModalProps {
  food?: FoodItem; // If provided, we're editing
  onClose: () => void;
}

const commonEmojis = ['🍽️', '🥗', '🍖', '🍗', '🥩', '🐟', '🍚', '🍝', '🥦', '🥕', '🍎', '🍌', '🥑', '🧀', '🥛', '🍫', '🥜', '🍞', '🥚', '🌮', '🥪', '🍜', '🌯', '🥤', '🍲', '🧆'];

export function FoodFormModal({ food, onClose }: FoodFormModalProps) {
  const addFoodMutation = useMutation(api.customFoods.add);
  const updateFoodMutation = useMutation(api.customFoods.update);
  const isEditing = !!food;

  const [name, setName] = useState(food?.name ?? '');
  const [category, setCategory] = useState(food?.category ?? '');
  const [servingSize, setServingSize] = useState(food?.servingSize ?? '');
  const [servingGrams, setServingGrams] = useState(food?.servingGrams?.toString() ?? '');
  const [calories, setCalories] = useState(food?.nutrition.calories.toString() ?? '');
  const [protein, setProtein] = useState(food?.nutrition.protein.toString() ?? '');
  const [carbs, setCarbs] = useState(food?.nutrition.carbs.toString() ?? '');
  const [fat, setFat] = useState(food?.nutrition.fat.toString() ?? '');
  const [emoji, setEmoji] = useState(food?.emoji ?? '🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isValid = name.trim() && category.trim() && servingSize.trim() && calories;

  const handleSubmit = async () => {
    if (!isValid) return;

    const foodData = {
      name: name.trim(),
      category: category.trim(),
      servingSize: servingSize.trim(),
      servingGrams: parseFloat(servingGrams) || 0,
      nutrition: {
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      },
      emoji,
    };

    if (isEditing && food) {
      await updateFoodMutation({ id: food.id as Id<'customFoods'>, ...foodData });
    } else {
      await addFoodMutation(foodData);
    }
    onClose();
  };

  const inputStyle = {
    fontSize: '0.95rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  };

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
        style={{ maxWidth: 520 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isEditing ? <Pencil size={20} style={{ color: 'var(--terracotta)' }} /> : <Plus size={20} style={{ color: 'var(--sage)' }} />}
            <h3>{isEditing ? 'Edit Food' : 'Add Custom Food'}</h3>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Emoji + Name row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Icon</label>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-strong)',
                background: 'var(--cream)',
                fontSize: '1.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              {emoji}
            </button>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: 8,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 4,
                  zIndex: 10,
                  boxShadow: 'var(--shadow-lg)',
                  width: 220,
                }}
              >
                {commonEmojis.map(e => (
                  <button
                    key={e}
                    onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: emoji === e ? 'var(--cream)' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--cream)')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = emoji === e ? 'var(--cream)' : 'transparent')}
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Food Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Grilled Chicken"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Category + Serving row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Category *</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Protein"
              style={inputStyle}
              list="food-categories"
            />
            <datalist id="food-categories">
              {['Protein', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Legumes', 'Nuts', 'Snacks', 'Beverages', 'Mixed', 'Dips'].map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label style={labelStyle}>Serving Size *</label>
            <input
              type="text"
              value={servingSize}
              onChange={e => setServingSize(e.target.value)}
              placeholder="e.g. 1 cup"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Serving grams */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Grams per serving</label>
          <input
            type="number"
            value={servingGrams}
            onChange={e => setServingGrams(e.target.value)}
            placeholder="e.g. 150"
            style={inputStyle}
          />
        </div>

        {/* Nutrition section */}
        <div style={{
          padding: '16px',
          background: 'var(--cream)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24,
        }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--forest)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 14,
          }}>
            Nutrition per serving
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Calories', value: calories, onChange: setCalories, unit: 'kcal', color: 'var(--terracotta)' },
              { label: 'Protein', value: protein, onChange: setProtein, unit: 'g', color: 'var(--sky)' },
              { label: 'Carbs', value: carbs, onChange: setCarbs, unit: 'g', color: 'var(--amber)' },
              { label: 'Fat', value: fat, onChange: setFat, unit: 'g', color: 'var(--rose)' },
            ].map(field => (
              <div key={field.label}>
                <label style={{ ...labelStyle, fontSize: '0.65rem', color: field.color }}>
                  {field.label}
                </label>
                <input
                  type="number"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  placeholder="0"
                  style={{
                    ...inputStyle,
                    textAlign: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    borderColor: field.color,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!isValid}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.95rem',
            opacity: isValid ? 1 : 0.5,
          }}
        >
          {isEditing ? 'Save Changes' : 'Add Food'}
        </button>
      </motion.div>
    </motion.div>
  );
}
