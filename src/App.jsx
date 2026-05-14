import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Routines } from './pages/Routines';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { LogWorkout } from './pages/LogWorkout';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { PwaPrompt } from './components/ui/PwaPrompt';
import { useAuthInit } from './hooks/useAuthInit';
import { useAutoSync } from './hooks/useAutoSync';

export default function App() {
  const { isInitialized } = useAuthInit();
  useAutoSync();

  if (!isInitialized) {
    return <div className="min-h-dvh max-w-lg mx-auto flex items-center justify-center">Initializing...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-dvh pb-20 max-w-lg mx-auto px-4">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/library"  element={<ExerciseLibrary />} />
          <Route path="/log"      element={<LogWorkout />} />
          <Route path="/stats"    element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <BottomNav />
      <PwaPrompt />
    </BrowserRouter>
  );
}