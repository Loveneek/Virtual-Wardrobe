'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ClothingItem {
  id: number;
  name: string;
  imageUrl: string;
  category: { name: string };
}

interface TryOnSelectorProps {
  items: ClothingItem[];
  onTryOn: (selected: Record<string, ClothingItem>) => void;
}

const CATEGORY_SLOTS = ['Shirts', 'T-Shirts', 'Pants', 'Shoes', 'Jackets'];

export default function TryOnSelector({ items, onTryOn }: TryOnSelectorProps) {
  const [selected, setSelected] = useState<Record<string, ClothingItem>>({});

  const handleSelect = (item: ClothingItem) => {
    const categoryName = item.category.name;
    setSelected(prev => {
      // If already selected, deselect it
      if (prev[categoryName]?.id === item.id) {
        const updated = { ...prev };
        delete updated[categoryName];
        return updated;
      }
      // Otherwise select it (replacing any previous selection in same category)
      return { ...prev, [categoryName]: item };
    });
  };

  const isSelected = (item: ClothingItem) =>
    selected[item.category.name]?.id === item.id;

  const selectedCount = Object.keys(selected).length;

  return (
    <div>
      {/* Selected Outfit Summary */}
      {selectedCount > 0 && (
        <div className="mb-6 p-4 bg-black text-white rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">
              {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              {Object.values(selected).map(item => (
                <img
                  key={item.id}
                  src={item.imageUrl}
                  className="w-8 h-8 rounded-lg object-cover border border-white/20"
                  alt={item.name}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => onTryOn(selected)}
            className="bg-white text-black px-4 py-2 rounded-xl text-sm font-black hover:bg-gray-100 transition"
          >
            Try On →
          </button>
        </div>
      )}

      {/* Category hint */}
      <p className="text-xs text-gray-400 font-medium mb-4">
        Select one item per category. Click an item to select it for try-on.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            className={`relative bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 cursor-pointer transition-all hover:shadow-xl ${isSelected(item)
                ? 'border-black scale-[1.02]'
                : 'border-gray-100 hover:border-gray-300'
              }`}
          >
            {/* Selected Badge */}
            {isSelected(item) && (
              <div className="absolute top-3 left-3 z-10 bg-black text-white text-xs font-black px-2 py-1 rounded-full">
                ✓ {item.category.name}
              </div>
            )}

            <img
              src={item.imageUrl}
              className="w-full h-64 object-cover"
              alt={item.name}
            />
            <div className="p-4">
              <p className="font-bold text-black truncate">{item.name}</p>
              <p className="text-xs text-gray-400 mt-1">{item.category?.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}