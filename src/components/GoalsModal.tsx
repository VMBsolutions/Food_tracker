import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Target } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface GoalsModalProps {
  onClose: () => void;
}

export function GoalsModal({ onClose }: GoalsModalProps) {
  const goalsDoc = useQuery(api.userGoals.get);
  const setGoalsMutation = useMutation(api.userGoals.set);

  const currentGoals = goalsDoc ?? { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const [cal, setCal] = useState(currentGoals.calories.toString());
  const [protein, setProtein] = useState(currentGoals.protein.toString());
  const [carbs, setCarbs] = useState(currentGoals.carbs.toString());
  const [fat, setFat] = useState(currentGoals.fat.toString());

  const handleSave = async () => {
    await setGoalsMutation({
      calories: parseInt(cal) || 2000,
      protein: parseInt(protein) || 150,
      carbs: parseInt(carbs) || 250,
      fat: parseInt(fat) || 65,
    });
    onClose();
  };

  const presets = [
    { label: 'Weight Loss', cal: 1500, p: 130, c: 150, f: 50 },
    { label: 'Maintenance', cal: 2000, p: 150, c: 250, f: 65 },
    { label: 'Muscle Gain', cal: 2500, p: 200, c: 300, f: 75 },
    { label: 'High Protein', cal: 2200, p: 220, c: 200, f: 60 },
  ];

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
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Target size={22} style={{ color: 'var(--terracotta)' }} />
            <h3>Daily Goals</h3>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>
            Quick presets
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setCal(p.cal.toString());
                  setProtein(p.p.toString());
                  setCarbs(p.c.toString());
                  setFat(p.f.toString());
                }}
                style={{
                  padding: '10px 14px',
                  background: 'var(--cream)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  border: '1.5px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--sage)';
                  e.currentTarget.style.background = 'var(--sage-pale)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'var(--cream)';
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest)' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {p.cal} kcal · P{p.p}g · C{p.c}g · F{p.f}g
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Calories (kcal)', value: cal, onChange: setCal, color: 'var(--terracotta)' },
            { label: 'Protein (g)', value: protein, onChange: setProtein, color: 'var(--sky)' },
            { label: 'Carbs (g)', value: carbs, onChange: setCarbs, color: 'var(--amber)' },
            { label: 'Fat (g)', value: fat, onChange: setFat, color: 'var(--rose)' },
          ].map(field => (
            <div key={field.label}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {field.label}
              </label>
              <input
                type="number"
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                style={{
                  borderColor: field.color,
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              />
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
        >
          Save Goals
        </button>
      </motion.div>
    </motion.div>
  );
}
