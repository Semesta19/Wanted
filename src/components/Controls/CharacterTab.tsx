import React from 'react';
import { PosterData, CharacterPreset } from '../../types/poster';
import { User, Award, Coins, Sparkles, Plus, RotateCcw } from 'lucide-react';
import robinImg from '../../assets/robin.jpg';
import captainImg from '../../assets/captain.jpg';

interface CharacterTabProps {
  data: PosterData;
  onChange: (updated: Partial<PosterData>) => void;
}

const PRESET_CHARACTERS: CharacterPreset[] = [
  {
    id: 'robin',
    name: 'NICO ROBIN',
    epithet: 'DEVIL CHILD',
    bounty: 130000000,
    photoUrl: robinImg,
    filter: 'vintage-sepia',
    description: 'Nico Robin',
  },
  {
    id: 'luffy',
    name: 'MONKEY · D · LUFFY',
    epithet: 'STRAW HAT',
    bounty: 3000000000,
    photoUrl: captainImg,
    filter: 'anime-cel',
    description: 'Luffy',
  },
  {
    id: 'zoro',
    name: 'RORONOA ZORO',
    epithet: 'PIRATE HUNTER',
    bounty: 1111000000,
    photoUrl: captainImg,
    filter: 'manga-sketch',
    description: 'Zoro',
  },
  {
    id: 'custom',
    name: 'KAPTEN BARU',
    epithet: 'RAJA BAJAK LAUT',
    bounty: 500000000,
    photoUrl: '',
    filter: 'vintage-sepia',
    description: 'Kustom',
  },
];

const POPULAR_EPITHETS = [
  'DEVIL CHILD',
  'PIRATE HUNTER',
  'STRAW HAT',
  'SURGEON OF DEATH',
  'CAT BURGLAR',
  'SOUL KING',
  'KING OF SNIPERS',
  'BLACK LEG',
  'FIRE FIST',
  'DARK KING',
  'EMPEROR OF THE SEA',
];

export const CharacterTab: React.FC<CharacterTabProps> = ({ data, onChange }) => {
  const addBounty = (amount: number) => {
    onChange({ bounty: Math.max(0, (data.bounty || 0) + amount) });
  };

  const handleApplyPreset = (preset: CharacterPreset) => {
    onChange({
      characterName: preset.name,
      epithet: preset.epithet,
      bounty: preset.bounty,
      ...(preset.photoUrl ? { photoUrl: preset.photoUrl } : {}),
      photoFilter: preset.filter,
      displayMode: 'composite',
    });
  };

  return (
    <div className="space-y-5">
      {/* Preset Characters */}
      <div>
        <label className="text-xs font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Preset Karakter
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_CHARACTERS.map((preset) => {
            const isSelected =
              data.characterName.toUpperCase() === preset.name.toUpperCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2.5 text-left rounded-lg border transition text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200 shadow ring-1 ring-amber-500/30'
                    : 'border-stone-800 bg-stone-900/60 hover:border-stone-700 text-stone-300'
                }`}
              >
                <span className="font-bold truncate text-[13px]">{preset.name}</span>
                <span className="text-[11px] text-amber-400/80 italic truncate mt-0.5">
                  {preset.epithet}
                </span>
                <span className="text-[10px] text-stone-400 mt-1">
                  ฿{(preset.bounty / 1000000).toFixed(0)}M
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Nama Karakter */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-500" /> Nama Karakter
        </label>
        <input
          type="text"
          value={data.characterName}
          onChange={(e) => onChange({ characterName: e.target.value.toUpperCase() })}
          placeholder="NICO ROBIN"
          maxLength={32}
          className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition font-medium text-xs"
        />
      </div>

      {/* 2. Gelar Karakter */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-500" /> Gelar Karakter
        </label>
        <input
          type="text"
          value={data.epithet}
          onChange={(e) => onChange({ epithet: e.target.value.toUpperCase() })}
          placeholder="DEVIL CHILD"
          maxLength={40}
          className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition font-medium text-xs"
        />

        {/* Quick popular epithet chips */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {POPULAR_EPITHETS.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange({ epithet: tag })}
              className={`text-[11px] px-2 py-0.5 rounded border transition ${
                data.epithet.toUpperCase() === tag
                  ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                  : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Nilai Bounty */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" /> Nilai Bounty (Berry / ฿)
          </span>
          <span className="text-[11px] text-amber-300 font-mono">
            ฿ {data.bounty.toLocaleString()}-
          </span>
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500 font-bold text-xs">
            ฿
          </div>
          <input
            type="number"
            min="0"
            step="1000000"
            value={data.bounty === 0 ? '' : data.bounty}
            onChange={(e) => onChange({ bounty: parseInt(e.target.value, 10) || 0 })}
            placeholder="130000000"
            className="w-full pl-8 pr-3.5 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Quick increment buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => addBounty(10000000)}
            className="text-[11px] px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded border border-stone-700 transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 10 Juta
          </button>
          <button
            type="button"
            onClick={() => addBounty(50000000)}
            className="text-[11px] px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded border border-stone-700 transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 50 Juta
          </button>
          <button
            type="button"
            onClick={() => addBounty(100000000)}
            className="text-[11px] px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded border border-stone-700 transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 100 Juta
          </button>
          <button
            type="button"
            onClick={() => onChange({ bounty: 3000000000 })}
            className="text-[11px] px-2.5 py-1 bg-amber-900/40 hover:bg-amber-800/50 text-amber-200 rounded border border-amber-600/40 transition flex items-center gap-1 font-semibold"
          >
            👑 3 Miliar (Yonko)
          </button>
          <button
            type="button"
            onClick={() => onChange({ bounty: 0 })}
            className="text-[11px] px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-400 rounded border border-stone-800 transition flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};
