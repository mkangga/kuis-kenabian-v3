import React, { useEffect } from 'react';
import { Clock, Trophy, RefreshCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../constants';

interface ResultProps {
  categoryId: string | null;
  score: number;
  totalQuestions: number;
  timeLeft: number;
  useTimer: boolean;
  onRetry: () => void;
  onGoHome: () => void;
}

const Result: React.FC<ResultProps> = ({ 
  categoryId, 
  score, 
  totalQuestions, 
  timeLeft, 
  useTimer, 
  onRetry, 
  onGoHome 
}) => {
  const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name;
  const isTimeOut = useTimer && timeLeft === 0;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Trigger Confetti if score is good (> 70%)
  useEffect(() => {
    if (!isTimeOut && percentage >= 70) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#34d399', '#f59e0b'] // Emerald & Amber theme
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#34d399', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [percentage, isTimeOut]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in max-w-md mx-auto relative z-10">
      
      {/* Icon Badge */}
      <div className="mb-6 relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${isTimeOut ? 'bg-red-100' : 'bg-gradient-to-br from-yellow-100 to-amber-200 shadow-xl shadow-amber-100'}`}>
          {isTimeOut ? (
            <Clock className="w-16 h-16 text-red-500 animate-pulse" />
          ) : (
            <Trophy className="w-16 h-16 text-yellow-600 fill-yellow-600 animate-bounce-short" />
          )}
        </div>
        {!isTimeOut && percentage === 100 && (
          <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
            PERFECT!
          </div>
        )}
      </div>

      <h2 className="text-4xl font-black text-gray-800 mb-2 px-4 tracking-tight">
        {isTimeOut ? "Waktu Habis!" : "Sesi Selesai!"}
      </h2>
      <p className="text-emerald-700 font-medium mb-8 bg-emerald-100/50 px-4 py-1 rounded-full">{categoryName}</p>
      
      {/* Score Card */}
      <div className="w-full bg-white p-8 rounded-3xl shadow-xl shadow-emerald-900/5 mb-8 flex flex-col gap-4 border border-emerald-50">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Skor Akhir</span>
          <div className="flex items-baseline justify-center gap-1 text-emerald-600">
             <span className="text-7xl font-black tracking-tighter">{score}</span>
             <span className="text-2xl font-bold text-gray-300">/{totalQuestions}</span>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${percentage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
            style={{width: `${percentage}%`}}
          ></div>
        </div>

        <p className="text-sm text-gray-500 font-medium">
          {percentage === 100 ? "Masya Allah! Luar biasa sempurna." : 
           percentage >= 80 ? "Hebat! Kamu menguasai topik ini." : 
           percentage >= 60 ? "Bagus! Sedikit lagi sempurna." : 
           "Jangan menyerah, coba lagi ya!"}
        </p>
      </div>
      
      {/* Buttons */}
      <div className="w-full space-y-3">
        <button 
          onClick={onRetry}
          className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" />
          Ulangi Kuis
        </button>
        <button 
          onClick={onGoHome}
          className="w-full py-4 bg-white border-2 border-transparent text-gray-600 font-bold rounded-2xl hover:bg-gray-50 hover:text-emerald-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Menu Utama
        </button>
      </div>
    </div>
  );
};

export default Result;