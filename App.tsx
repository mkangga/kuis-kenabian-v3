import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import Settings from './components/Settings';
import Game from './components/Game';
import Result from './components/Result';
import { ALL_QUESTIONS } from './constants';
import { GameState, GameSettings, Question, HighScore } from './types';

const App = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Game Logic State
  const [queue, setQueue] = useState<Question[]>([]);
  const [totalInitialQuestions, setTotalInitialQuestions] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); // New: Streak Counter
  const [highScores, setHighScores] = useState<HighScore>({}); // New: High Scores

  const [isFlipped, setIsFlipped] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<GameSettings>({
    useTimer: false,
    inputDuration: 5,
    numQuestions: 10,
  });
  const [timeLeft, setTimeLeft] = useState(0);

  // Load High Scores from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kuis_kenabian_scores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Function to play beep sound
  const playBeep = (freq = 440, type: OscillatorType = 'sine', duration = 0.5) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); 
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    if (gameState === 'playing' && settings.useTimer && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          // Trigger sound if time is running out (Last 15 seconds)
          if (prev <= 16 && prev > 1) { 
             playBeep(880, 'sine', 0.1); 
          }
          
          if (prev <= 1) {
            playBeep(440, 'triangle', 1);
            clearInterval(timerInterval);
            finishGame(score); // Finish game on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [gameState, settings.useTimer, timeLeft]);

  // Format Time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const prepareGame = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setGameState('settings');
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const startConfirm = () => {
    if (!selectedCategory) return;

    // Shuffle questions
    const catQuestions = [...ALL_QUESTIONS[selectedCategory]];
    for (let i = catQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [catQuestions[i], catQuestions[j]] = [catQuestions[j], catQuestions[i]];
    }
    
    // Slice based on selected number of questions
    const selectedQuestions = catQuestions.slice(0, settings.numQuestions);
    setQueue(selectedQuestions);
    setTotalInitialQuestions(selectedQuestions.length);
    setScore(0);
    setStreak(0); // Reset streak
    setIsFlipped(false);
    
    // Timer setup
    if (settings.useTimer) {
      setTimeLeft(settings.inputDuration * 60);
    }
    
    setGameState('playing');
  };

  const finishGame = (finalScore: number) => {
    setGameState('finished');
    
    // Save High Score Logic
    if (selectedCategory && totalInitialQuestions > 0) {
      const percentage = Math.round((finalScore / totalInitialQuestions) * 100);
      const currentHigh = highScores[selectedCategory] || 0;
      
      if (percentage > currentHigh) {
        const newScores = { ...highScores, [selectedCategory]: percentage };
        setHighScores(newScores);
        localStorage.setItem('kuis_kenabian_scores', JSON.stringify(newScores));
      }
    }
  };

  // Skip: Move current item to end of queue
  const handleSkip = () => {
    if (queue.length <= 1) return;
    
    const currentItem = queue[0];
    const newQueue = [...queue.slice(1), currentItem];
    
    setQueue(newQueue);
    setIsFlipped(false);
    setStreak(0); // Reset streak on skip
    playBeep(300, 'sine', 0.1);
  };

  // Answer: Correct or Incorrect
  const handleAnswer = (isCorrect: boolean) => {
    let newScore = score;
    let newStreak = streak;

    if (isCorrect) {
      newScore = score + 1;
      newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      
      // Streak Pitch (Higher pitch for higher streak)
      const pitch = Math.min(600 + (newStreak * 50), 1200);
      playBeep(pitch, 'sine', 0.15); 
    } else {
      newStreak = 0;
      setStreak(0);
      playBeep(200, 'sawtooth', 0.3);
    }

    const newQueue = queue.slice(1);
    
    if (newQueue.length === 0) {
      finishGame(newScore);
    } else {
      setQueue(newQueue);
      setIsFlipped(false);
    }
  };

  const goHome = () => {
    setGameState('menu');
    setSelectedCategory(null);
    setSettings(prev => ({ ...prev, useTimer: false, numQuestions: 10 }));
    setIsFlipped(false);
    setStreak(0);
  };

  const retryCategory = () => {
    if (selectedCategory) {
       // Just restart with current settings
       startConfirm();
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 flex flex-col w-full relative overflow-hidden">
      <Header 
        gameState={gameState} 
        timeLeft={timeLeft} 
        useTimer={settings.useTimer} 
        onGoHome={goHome} 
        formatTime={formatTime} 
      />

      <div className="flex-1 w-full flex flex-col overflow-y-auto z-10">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-1 flex flex-col">
          {gameState === 'menu' && (
            <Menu 
              onSelectCategory={prepareGame} 
              highScores={highScores}
            />
          )}

          {gameState === 'settings' && (
            <Settings 
              categoryId={selectedCategory}
              settings={settings}
              onUpdateSettings={updateSettings}
              onStart={startConfirm}
            />
          )}

          {gameState === 'playing' && (
            <Game 
              currentQuestion={queue[0]}
              remainingCount={queue.length}
              totalInitial={totalInitialQuestions}
              categoryId={selectedCategory}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(true)}
              onSkip={handleSkip}
              onAnswer={handleAnswer}
              streak={streak}
            />
          )}

          {gameState === 'finished' && (
            <Result 
              categoryId={selectedCategory}
              score={score}
              totalQuestions={totalInitialQuestions}
              timeLeft={timeLeft}
              useTimer={settings.useTimer}
              onRetry={retryCategory}
              onGoHome={goHome}
            />
          )}
        </div>
      </div>
      
      <div className="w-full p-4 text-center text-xs text-emerald-800/60 font-semibold z-10">
        Dibuat untuk Pengajian Akhir Tahun 2025 - Desa Cikampek Barat
      </div>
    </div>
  );
};

export default App;