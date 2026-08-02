import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  selectedCategory: string;
  selectedSubcategory: string;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory: (subcategory: string) => void;
  onClearFilters: () => void;
  productCounts: Record<string, Record<string, number>>; // category -> subcategory -> count
}

const CategoryBrowser: React.FC<Props> = ({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  onClearFilters,
  productCounts,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string>(selectedCategory || '');

  const handleCategoryClick = (catName: string) => {
    if (expandedCategory === catName) {
      // Collapse and clear
      setExpandedCategory('');
      onClearFilters();
    } else {
      setExpandedCategory(catName);
      onSelectCategory(catName);
    }
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubcategoryClick = (subName: string) => {
    onSelectSubcategory(subName);
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const categoryTotal = (catName: string) => {
    const subCounts = productCounts[catName] || {};
    return Object.values(subCounts).reduce((a, b) => a + b, 0);
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tight">Choose From Category</h2>
        {(selectedCategory || selectedSubcategory) && (
          <button
            onClick={() => {
              setExpandedCategory('');
              onClearFilters();
            }}
            className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-black transition-colors border border-zinc-200 rounded-full px-3 py-1"
          >
            <X size={12} /> Clear Filter
          </button>
        )}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = expandedCategory === cat.name;
          const total = categoryTotal(cat.name);

          return (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`group relative text-left rounded-2xl p-4 border-2 transition-all duration-200 ${
                isActive
                  ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
                  : `bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-md`
              }`}
            >
              <span className="text-2xl mb-2 block">{cat.icon}</span>
              <h3 className={`font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                {cat.name}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-zinc-400'}`}>
                  {total > 0 ? `${total} item${total !== 1 ? 's' : ''}` : cat.subcategories.length + ' types'}
                </p>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isActive ? 'rotate-180 text-white/80' : 'text-zinc-300'}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Subcategory Pills — slide open when a category is selected */}
      <AnimatePresence>
        {expandedCategory && (
          <motion.div
            key={expandedCategory}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-3">
                {expandedCategory} — Browse Subcategory
              </p>
              <div className="flex flex-wrap gap-2">
                {/* "All in category" pill */}
                <button
                  onClick={() => {
                    onSelectCategory(expandedCategory);
                    onSelectSubcategory('');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedCategory === expandedCategory && !selectedSubcategory
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  All {expandedCategory}
                </button>

                {CATEGORIES.find(c => c.name === expandedCategory)?.subcategories.map((sub) => {
                  const count = productCounts[expandedCategory]?.[sub.name] || 0;
                  const isSubActive = selectedSubcategory === sub.name;

                  return (
                    <button
                      key={sub.name}
                      onClick={() => handleSubcategoryClick(sub.name)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        isSubActive
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {sub.name}
                      {count > 0 && (
                        <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-black ${
                          isSubActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CategoryBrowser;
