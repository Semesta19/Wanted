import { useState, useCallback } from 'react';
import { PosterData, InteractiveSettings } from './types/poster';
import { WantedPoster } from './components/WantedPoster';
import { Poster3DCard } from './components/Poster3DCard';
import { PhotoAITab } from './components/Controls/PhotoAITab';
import { ExportBar } from './components/ExportBar';
import robinImg from './assets/robin.jpg';
import generatedRobinPoster from './assets/generated_wanted_robin.png';
import { Skull, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

export default function App() {
  const [posterData, setPosterData] = useState<PosterData>({
    characterName: 'NICO ROBIN',
    epithet: 'DEVIL CHILD',
    bounty: 130000000,
    photoUrl: robinImg,
    photoScale: 1,
    photoPanX: 0,
    photoPanY: 0,
    photoRotate: 0,
    photoFilter: 'vintage-sepia',
    textureTone: 'authentic',
    fullPosterImageUrl: generatedRobinPoster,
    displayMode: 'full-ai',
    bottomNotice: 'Bapack-bapack deadstar',
    marineText: 'MARINE',
  });

  const [interactiveSettings] = useState<InteractiveSettings>({
    tiltEnabled: true,
    tiltIntensity: 1.0,
    glareEnabled: true,
    glareOpacity: 0.45,
    gyroEnabled: false,
  });

  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  const handlePosterChange = useCallback((updated: Partial<PosterData>) => {
    setPosterData((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleReset = () => {
    setPosterData({
      characterName: 'NICO ROBIN',
      epithet: 'DEVIL CHILD',
      bounty: 130000000,
      photoUrl: robinImg,
      photoScale: 1,
      photoPanX: 0,
      photoPanY: 0,
      photoRotate: 0,
      photoFilter: 'vintage-sepia',
      textureTone: 'authentic',
      fullPosterImageUrl: generatedRobinPoster,
      displayMode: 'full-ai',
      bottomNotice: 'Bapack-bapack deadstar',
      marineText: 'MARINE',
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow text-stone-950">
              <Skull className="w-4 h-4" />
            </div>
            <h1 className="font-wanted font-black text-base sm:text-lg tracking-wider text-amber-100">
              WANTED POSTER 3D
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-amber-200 rounded-lg text-xs border border-stone-700/60 transition"
              title="Reset ke Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-1.5 bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-amber-200 rounded-lg text-xs border border-stone-700/60 transition"
              title={isFocusMode ? 'Keluar Mode Fokus' : 'Layar Penuh'}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className={`grid gap-6 items-start ${isFocusMode ? 'grid-cols-1 max-w-xl mx-auto' : 'lg:grid-cols-12'}`}>
          {/* POSTER DISPLAY STAGE */}
          <div className={`${isFocusMode ? 'w-full' : 'lg:col-span-7 flex flex-col items-center'}`}>
            <div className="w-full flex items-center justify-center min-h-[500px] sm:min-h-[640px] bg-gradient-to-b from-stone-900/50 to-stone-950/80 border border-stone-800/80 rounded-2xl p-3 sm:p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

              <Poster3DCard settings={interactiveSettings} className="w-full max-w-md">
                <WantedPoster data={posterData} />
              </Poster3DCard>
            </div>
          </div>

          {/* CONTROLS (HANYA FOTO & AI) */}
          {!isFocusMode && (
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-4 shadow-xl">
                <PhotoAITab data={posterData} onChange={handlePosterChange} />
              </div>

              {/* EXPORT / DOWNLOAD BAR */}
              <ExportBar data={posterData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
