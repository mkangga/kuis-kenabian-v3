import React from 'react';
import { ChevronRight, Trophy } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { HighScore } from '../types';

interface MenuProps {
  onSelectCategory: (id: string) => void;
  highScores: HighScore;
}

const Menu: React.FC<MenuProps> = ({ onSelectCategory, highScores }) => {
  return (
    <div className="w-full">
      <div className="text-center mb-8 mt-4 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-emerald-900 mb-2 tracking-tight">Pilih Topik Kuis</h2>
        <p className="text-emerald-700 font-medium">Uji pengetahuan Islammu dengan cara yang menyenangkan.</p>
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-2">
        {CATEGORIES.map((cat, index) => {
          const score = highScores[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`animate-pop-in opacity-0 ${cat.color} text-white p-6 rounded-3xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex flex-col gap-4 group h-full justify-between relative overflow-hidden`}
            >
              {/* Background Decoration */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

              <div className="flex items-start justify-between w-full z-10">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner">
                  {cat.icon}
                </div>
                {score !== undefined && (
                   <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg text-xs font-bold">
                      <Trophy className="w-3 h-3 text-yellow-300" />
                      {score}%
                   </div>
                )}
              </div>
              <div className="text-left mt-2 z-10">
                <h3 className="font-bold text-xl mb-1">{cat.name}</h3>
                <div className="flex items-center gap-1 text-sm opacity-90 group-hover:gap-2 transition-all">
                  <span>Mulai Kuis</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;