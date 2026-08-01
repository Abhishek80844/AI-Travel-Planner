import React, { useState } from 'react';
import { PackingItem } from '../types';
import { CheckSquare, Square, Plus, Trash2, Shield, Shirt, FileText, Smartphone, HeartPulse } from 'lucide-react';

interface PackingChecklistProps {
  items: PackingItem[];
  onToggleItem?: (itemId: number) => Promise<void>;
  onAddItem?: (item: { item: string; category: string }) => Promise<void>;
  onDeleteItem?: (itemId: number) => Promise<void>;
  isReadOnly?: boolean;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  isReadOnly = false,
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [newCategory, setNewCategory] = useState('Clothing');
  const [isAdding, setIsAdding] = useState(false);

  const categories = ['Clothing', 'Documents', 'Electronics', 'Health'];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Clothing':
        return <Shirt className="w-4 h-4 text-sky-400" />;
      case 'Documents':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'Electronics':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'Health':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      default:
        return <Shield className="w-4 h-4 text-emerald-400" />;
    }
  };

  const completedCount = items ? items.filter((i) => i.isChecked).length : 0;
  const totalCount = items ? items.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !onAddItem) return;
    setIsAdding(true);
    try {
      await onAddItem({ item: newItemText.trim(), category: newCategory });
      setNewItemText('');
    } catch (err) {
      console.error('Failed to add packing item', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <span>Smart Packing Checklist</span>
          </h3>
          <p className="text-xs text-slate-400">Dynamically generated based on travel style and weather</p>
        </div>

        <div className="flex items-center space-x-3 sm:self-auto self-start">
          <div className="w-32 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-sky-400">{progressPercent}% packed</span>
        </div>
      </div>

      {!isReadOnly && onAddItem && (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            placeholder="Add custom packing item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="flex-grow bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isAdding || !newItemText.trim()}
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>
      )}

      {/* Categorized List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {categories.map((cat) => {
          const categoryItems = items ? items.filter((i) => i.category === cat) : [];
          if (categoryItems.length === 0) return null;

          return (
            <div key={cat} className="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                {getCategoryIcon(cat)}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{cat}</h4>
              </div>

              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between group p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <button
                      disabled={isReadOnly || !onToggleItem || !item.id}
                      onClick={() => item.id && onToggleItem && onToggleItem(item.id)}
                      className="flex items-center space-x-3 text-left flex-grow cursor-pointer disabled:cursor-default"
                    >
                      {item.isChecked ? (
                        <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          item.isChecked ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                        }`}
                      >
                        {item.item}
                      </span>
                    </button>

                    {!isReadOnly && onDeleteItem && item.id && (
                      <button
                        onClick={() => onDeleteItem(item.id!)}
                        className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 p-1 transition-all"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
