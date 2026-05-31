import React from 'react';

const pickFruit = (name = '', category = '') => {
  const key = `${name} ${category}`.toLowerCase();

  if (key.includes('apple') || key.includes('saib')) return { emoji: '🍎', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' };
  if (key.includes('banana')) return { emoji: '🍌', bg: 'linear-gradient(135deg,#fef9c3,#fde68a)' };
  if (key.includes('orange') || key.includes('citrus') || key.includes('kinnow') || key.includes('malta')) return { emoji: '🍊', bg: 'linear-gradient(135deg,#ffedd5,#fdba74)' };
  if (key.includes('grape') || key.includes('angoor')) return { emoji: '🍇', bg: 'linear-gradient(135deg,#ede9fe,#c4b5fd)' };
  if (key.includes('guava')) return { emoji: '🍈', bg: 'linear-gradient(135deg,#dcfce7,#86efac)' };
  if (key.includes('mango') || key.includes('aam')) return { emoji: '🥭', bg: 'linear-gradient(135deg,#dcfce7,#fde68a)' };
  if (key.includes('pomegranate') || key.includes('anar')) return { emoji: '🫐', bg: 'linear-gradient(135deg,#ffe4e6,#fecdd3)' };
  if (key.includes('watermelon') || key.includes('tarbooz')) return { emoji: '🍉', bg: 'linear-gradient(135deg,#dcfce7,#fca5a5)' };
  if (key.includes('strawberry')) return { emoji: '🍓', bg: 'linear-gradient(135deg,#ffe4e6,#fecdd3)' };
  if (key.includes('pineapple')) return { emoji: '🍍', bg: 'linear-gradient(135deg,#fef9c3,#bbf7d0)' };

  return { emoji: '🍏', bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)' };
};

export default function FruitIcon({ name, category, size = 64, variant = 'card' }) {
  const fruit = pickFruit(name, category);
  const isFill = size === 'fill';
  const style = {
    width: isFill ? '100%' : size,
    height: isFill ? '100%' : size,
    borderRadius: isFill ? 'inherit' : (variant === 'modal' ? 28 : 22),
    background: fruit.bg,
    display: 'grid',
    placeItems: 'center',
    boxShadow: isFill ? 'none' : 'var(--clay-shadow-in)',
    border: isFill ? 'none' : '1px solid rgba(255,255,255,0.65)',
  };

  return (
    <div className="fruit-icon-wrap" style={style} aria-hidden="true">
      <div
        className="fruit-icon-emoji"
        style={{
          fontSize: isFill ? 92 : Math.round(size * 0.62),
          lineHeight: 1,
        }}
      >
        {fruit.emoji}
      </div>
    </div>
  );
}

