import React, { useState } from 'react';
import { InteractiveSettings, PosterData, TextureToneType } from '../../types/poster';
import { Compass, Smartphone, Sun, Layers } from 'lucide-react';

interface SettingsTabProps {
  settings: InteractiveSettings;
  onSettingsChange: (updated: Partial<InteractiveSettings>) => void;
  posterData: PosterData;
  onPosterChange: (updated: Partial<PosterData>) => void;
}

const TEXTURE_TONES: Array<{ id: TextureToneType; name: string }> = [
  { id: 'authentic', name: 'Autentik Robin' },
  { id: 'aged-sepia', name: 'Sepia Antik' },
  { id: 'golden-papyrus', name: 'Papirus Emas' },
  { id: 'dark-weathered', name: 'Lapuk Gelap' },
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSettingsChange,
  posterData,
  onPosterChange,
}) => {
  const [gyroStatus, setGyroStatus] = useState<string | null>(null);

  const requestGyroPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          onSettingsChange({ gyroEnabled: true });
          setGyroStatus('Aktif');
        } else {
          setGyroStatus('Ditolak');
        }
      } catch {
        setGyroStatus('Tidak didukung');
      }
    } else {
      onSettingsChange({ gyroEnabled: !settings.gyroEnabled });
      setGyroStatus(!settings.gyroEnabled ? 'Aktif' : 'Nonaktif');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. EFEK TILT 3D */}
      <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              Efek Tilt 3D
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.tiltEnabled}
              onChange={(e) => onSettingsChange({ tiltEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {settings.tiltEnabled && (
          <div className="space-y-3 pt-1 border-t border-stone-800">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-stone-300">
                <span>Sensitivitas:</span>
                <span className="text-amber-400 font-mono">
                  {settings.tiltIntensity <= 0.6
                    ? 'Halus'
                    : settings.tiltIntensity <= 1.2
                    ? 'Normal'
                    : 'Ekstrem'}
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.8"
                step="0.1"
                value={settings.tiltIntensity}
                onChange={(e) => onSettingsChange({ tiltIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Glare Sheen */}
            <div className="pt-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-stone-300">Kilauan Cahaya</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.glareEnabled}
                  onChange={(e) => onSettingsChange({ glareEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-stone-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {settings.glareEnabled && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>Intensitas</span>
                  <span>{Math.round(settings.glareOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={settings.glareOpacity}
                  onChange={(e) => onSettingsChange({ glareOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. SENSOR GYROSCOPE */}
      <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              Sensor Gyroscope HP
            </span>
          </div>
          {gyroStatus && (
            <span className="text-[10px] font-mono text-amber-400">{gyroStatus}</span>
          )}
        </div>

        <button
          type="button"
          onClick={requestGyroPermission}
          className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-2 ${
            settings.gyroEnabled
              ? 'bg-amber-500/20 text-amber-200 border-amber-500/50'
              : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          {settings.gyroEnabled ? 'Matikan Gyroscope' : 'Aktifkan Gyroscope'}
        </button>
      </div>

      {/* 3. TONE KERTAS KUNO */}
      <div className="space-y-2">
        <label className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500" /> Tekstur Kertas
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TEXTURE_TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPosterChange({ textureTone: t.id })}
              className={`p-2.5 rounded-lg border text-center transition text-xs font-medium ${
                posterData.textureTone === t.id
                  ? 'border-amber-500 bg-amber-500/20 text-amber-200 font-bold'
                  : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
