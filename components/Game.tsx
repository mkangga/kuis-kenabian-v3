import React, { useState } from 'react';
import { RotateCw, CheckCircle, XCircle, SkipForward, Eye, Flame } from 'lucide-react';
import { Question } from '../types';
import { CATEGORIES } from '../constants';

interface GameProps {
  currentQuestion: Question;
  remainingCount: number;
  totalInitial: number;
  categoryId: string | null;
  isFlipped: boolean;
  onFlip: () => void;
  onSkip: () => void;
  onAnswer: (isCorrect: boolean) => void;
  streak: number;
}

const Game: React.FC<GameProps> = ({ 
  currentQuestion, 
  remainingCount,
  totalInitial,
  categoryId, 
  isFlipped, 
  onFlip, 
  onSkip,
  onAnswer,
  streak
}) => {
  const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name;
  const progressPercent = ((totalInitial - remainingCount) / totalInitial) * 100;
  
  // Floating feedback state
  const [feedback, setFeedback] = useState<{type: 'correct' | 'wrong', id: number} | null>(null);

  const handleAnswerClick = (correct: boolean) => {
    setFeedback({ type: correct ? 'correct' : 'wrong', id: Date.now() });
    onAnswer(correct);
    setTimeout(() => setFeedback(null), 1000);
  };

  // --- Styles ---
  const cardClass = `relative w-full h-80 md:h-96 transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`;
  // Added backdrop-blur and subtle borders
  const faceClass = "absolute w-full h-full backface-hidden rounded-3xl shadow-xl shadow-emerald-900/10 flex flex-col items-center justify-center p-8 text-center border-[3px]";
  const frontClass = `${faceClass} bg-white border-emerald-100`;
  const backClass = `${faceClass} bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 text-white rotate-y-180`;

  return (
    <div className="w-full h-full flex flex-col justify-center animate-fade-in max-w-2xl mx-auto relative">
      
      {/* Streak Indicator (Absolute or fixed position in game container) */}
      <div className={`absolute -top-2 right-0 z-10 transition-all duration-300 ${streak > 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-2 bg-orange-100 border-2 border-orange-200 text-orange-600 px-4 py-2 rounded-full shadow-sm animate-bounce-short">
          <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
          <span className="font-bold text-sm">{streak} Streak!</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-3">
          <span className="bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            Sisa: {remainingCount}
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs uppercase tracking-wider">
            {categoryName}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner border border-gray-100">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2" 
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          >
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="perspective-1000 w-full mb-10 group">
        <div 
          className={cardClass}
          onClick={onFlip}
        >
          {/* Front Side (Question) */}
          <div className={frontClass}>
            <div className="absolute top-6 left-6">
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Pertanyaan</span>
            </div>
            <h3 className="text-xl md:text-3xl font-extrabold text-gray-800 leading-relaxed max-w-lg font-sans">
              {currentQuestion?.q}
            </h3>
            <div className="absolute bottom-8 text-gray-400 text-sm font-semibold flex items-center gap-2 animate-pulse group-hover:text-emerald-500 transition-colors">
              <RotateCw className="w-4 h-4" /> Ketuk untuk balik
            </div>
          </div>

          {/* Back Side (Answer) */}
          <div className={backClass}>
            <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute top-6 left-6">
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm">Jawaban</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-extrabold text-white leading-relaxed max-w-lg drop-shadow-md">
              {currentQuestion?.a}
            </h3>
            <div className="absolute bottom-8 text-white/70 text-sm font-semibold flex items-center gap-2 animate-pulse transition-colors hover:text-white">
              <RotateCw className="w-4 h-4" /> Ketuk untuk balik
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center items-center w-full relative">
        {/* Floating Feedback Animation */}
        {feedback && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-float-up">
            <span className={`text-4xl font-black ${feedback.type === 'correct' ? 'text-emerald-500' : 'text-red-500'} drop-shadow-sm`}>
              {feedback.type === 'correct' ? '+1' : 'Yah!'}
            </span>
          </div>
        )}

        {!isFlipped ? (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); onSkip(); }}
              disabled={remainingCount <= 1}
              className={`flex-1 py-4 font-bold text-lg rounded-2xl shadow-sm border-[3px] transition-all flex justify-center items-center gap-2 ${
                remainingCount <= 1 
                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" 
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300 active:scale-95"
              }`}
            >
              <SkipForward className="w-5 h-5" /> Lewati
            </button>

            <button 
              onClick={onFlip}
              className="flex-1 py-4 bg-white border-[3px] border-gray-200 text-gray-700 font-bold text-lg rounded-2xl shadow-sm hover:bg-gray-50 hover:border-emerald-300 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              <Eye className="w-5 h-5" /> Lihat Jawaban
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => handleAnswerClick(false)}
              className="flex-1 py-4 bg-red-50 border-[3px] border-red-100 text-red-600 font-bold text-lg rounded-2xl shadow-sm hover:bg-red-100 hover:border-red-300 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              <XCircle className="w-6 h-6" /> Salah
            </button>

            <button 
              onClick={() => handleAnswerClick(true)}
              className="flex-[1.5] py-4 bg-emerald-600 border-[3px] border-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:border-emerald-500 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              <CheckCircle className="w-6 h-6" /> Benar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;