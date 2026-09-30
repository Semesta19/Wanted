import React, { useState, useRef } from 'react';
import { PosterData } from '../../types/poster';
import {
  Upload,
  Camera,
  Wand2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Check,
  User,
  Award,
  Coins,
  X,
} from 'lucide-react';

interface PhotoAITabProps {
  data: PosterData;
  onChange: (updated: Partial<PosterData>) => void;
}

export const PhotoAITab: React.FC<PhotoAITabProps> = ({ data, onChange }) => {
  const [promptText, setPromptText] = useState<string>(
    'Arkeolog misterius berambut hitam, mata ungu, pose tangan di depan wajah, kelopak bunga sakura melayang, kertas kuno lapuk'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onChange({ photoUrl: base64 });
        setGenerationSuccess(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Webcam Capture Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      alert('Tidak dapat mengakses kamera.');
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      onChange({ photoUrl: base64 });
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Generate with Nano Banana using user's API
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(false);

    try {
      const response = await fetch('/api/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          imageBase64: data.photoUrl?.startsWith('data:') ? data.photoUrl : undefined,
          characterName: data.characterName,
          epithet: data.epithet,
          bounty: data.bounty,
          bottomNotice: data.bottomNotice || 'Bapack-bapack deadstar',
          marineText: data.marineText || 'MARINE',
          generateFullPoster: true,
        }),
      });

      const resData = await response.json();
      if (!response.ok || resData.error) {
        throw new Error(resData.error || 'Gagal generate gambar.');
      }

      if (resData.imageUrl) {
        onChange({
          fullPosterImageUrl: resData.imageUrl,
          displayMode: 'full-ai',
        });
        setGenerationSuccess(true);
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Gagal membuat poster.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchPromptIdeas = async () => {
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/suggest-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: data.characterName,
          epithet: data.epithet,
        }),
      });
      const resData = await res.json();
      if (resData.suggestions && Array.isArray(resData.suggestions)) {
        const prompts = resData.suggestions.map((s: any) => s.prompt).filter(Boolean);
        if (prompts.length > 0) {
          setPromptText(prompts[0]);
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. KOLOM TEKS: NAMA, GELAR, DAN NILAI BURONAN */}
      <div className="space-y-3 p-3.5 bg-stone-900 border border-stone-800 rounded-xl">
        {/* Nama Karakter */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-500" /> Nama Karakter
          </label>
          <input
            type="text"
            value={data.characterName}
            onChange={(e) => onChange({ characterName: e.target.value.toUpperCase() })}
            placeholder="NICO ROBIN"
            className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
          />
        </div>

        {/* Gelar Karakter */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Gelar Karakter
          </label>
          <input
            type="text"
            value={data.epithet}
            onChange={(e) => onChange({ epithet: e.target.value.toUpperCase() })}
            placeholder="DEVIL CHILD"
            className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition text-xs font-semibold"
          />
        </div>

        {/* Nilai Buronan */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Nilai Buronan (Berry / ฿)
            </label>
            <span className="text-[11px] font-mono text-amber-300 font-bold">
              ฿ {data.bounty.toLocaleString()}-
            </span>
          </div>
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
              className="w-full pl-8 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Tulisan Kecil Bawah & Label Sudut Marine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-stone-800">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-amber-400/90 uppercase flex items-center gap-1">
              Tulisan Kecil Bawah
            </label>
            <input
              type="text"
              value={data.bottomNotice ?? 'Bapack-bapack deadstar'}
              onChange={(e) => onChange({ bottomNotice: e.target.value })}
              placeholder="Bapack-bapack deadstar"
              className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 text-xs font-medium focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-amber-400/90 uppercase flex items-center gap-1">
              Label Sudut Bawah
            </label>
            <input
              type="text"
              value={data.marineText ?? 'MARINE'}
              onChange={(e) => onChange({ marineText: e.target.value.toUpperCase() })}
              placeholder="MARINE"
              className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 text-xs font-bold tracking-wider focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>
      </div>

      {/* 2. UPLOAD FOTO (OPSIONAL SEBAGAI REFERENSI WAJAH) */}
      <div className="space-y-2 p-3.5 bg-stone-900 border border-stone-800 rounded-xl">
        <label className="text-xs font-bold text-amber-400 uppercase flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-amber-500" /> Foto Wajah (Opsional)
          </span>
          {data.photoUrl && data.photoUrl.startsWith('data:') && (
            <button
              type="button"
              onClick={() => onChange({ photoUrl: '' })}
              className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Hapus
            </button>
          )}
        </label>

        {isCameraActive ? (
          <div className="rounded-lg overflow-hidden border border-amber-500 bg-black p-2 space-y-2">
            <video ref={videoRef} className="w-full aspect-[4/3] object-cover rounded bg-black" autoPlay muted />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={takePhoto}
                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded text-xs"
              >
                Ambil Foto
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 border border-stone-700 hover:border-amber-500 bg-stone-950 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-stone-200 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-500" />
              <span>Unggah Foto</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              type="button"
              onClick={startCamera}
              className="p-2.5 border border-stone-700 hover:border-amber-500 bg-stone-950 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-stone-200 transition cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-500" />
              <span>Kamera HP</span>
            </button>
          </div>
        )}

        {data.photoUrl && data.photoUrl.startsWith('data:') && (
          <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Foto wajah terpasang sebagai referensi AI</span>
          </div>
        )}
      </div>

      {/* 3. AI PROMPT & GENERATE DENGAN NANO BANANA */}
      <div className="p-3.5 bg-stone-900 border border-amber-500/40 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-500" /> Prompt AI (Gaya & Pose)
          </label>
          <button
            type="button"
            onClick={handleFetchPromptIdeas}
            disabled={isSuggesting}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            {isSuggesting ? 'Memuat ide...' : 'Ide Prompt AI'}
          </button>
        </div>

        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Tulis instruksi pose, pakaian, gaya gambar..."
          className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition leading-relaxed resize-none font-medium"
        />

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isGenerating || !promptText.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
              <span>Memproses Poster...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate Poster</span>
            </>
          )}
        </button>

        {generationSuccess && (
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Poster berhasil di-generate!</span>
          </div>
        )}

        {generationError && (
          <div className="p-2 bg-red-950/80 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">{generationError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
