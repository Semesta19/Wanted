import React, { useState } from 'react';
import { PosterData } from '../types/poster';
import { renderPosterToCanvas } from '../utils/canvasRenderer';
import parchmentDefault from '../assets/parchment.jpg';
import { Download, Image, Copy, Check, Eye, X, Loader2, Sparkles } from 'lucide-react';

interface ExportBarProps {
  data: PosterData;
}

export const ExportBar: React.FC<ExportBarProps> = ({ data }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');

  // Generate file name
  const getFileName = (format: string) => {
    const cleanName = (data.characterName || 'PIRATE')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toUpperCase();
    return `WANTED_${cleanName}_฿${data.bounty}.${format}`;
  };

  const handleDownload = async (format: 'png' | 'jpeg') => {
    setIsExporting(true);
    setDownloadFormat(format);

    try {
      // Render canvas at 1200x1740 high resolution
      const canvas = await renderPosterToCanvas(data, parchmentDefault, 1200, 1740);

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const quality = format === 'jpeg' ? 0.95 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsExporting(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = getFileName(format);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => {
            URL.revokeObjectURL(url);
            setIsExporting(false);
          }, 1500);
        },
        mimeType,
        quality
      );
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengekspor gambar. Silakan coba lagi.');
      setIsExporting(false);
    }
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderPosterToCanvas(data, parchmentDefault, 1000, 1450);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
        } catch {
          alert('Peramban Anda belum mendukung salin gambar langsung ke clipboard.');
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch {
      setIsExporting(false);
    }
  };

  // Preview full resolution modal
  const handleOpenPreview = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderPosterToCanvas(data, parchmentDefault, 1200, 1740);
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Ekspor & Unduh Poster
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">1200 x 1740 HD</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Download PNG Button */}
          <button
            type="button"
            onClick={() => handleDownload('png')}
            disabled={isExporting}
            className="py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isExporting && downloadFormat === 'png' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download PNG (HD)</span>
          </button>

          {/* Download JPG Button */}
          <button
            type="button"
            onClick={() => handleDownload('jpeg')}
            disabled={isExporting}
            className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold rounded-lg text-xs flex items-center justify-center gap-2 border border-stone-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isExporting && downloadFormat === 'jpeg' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Image className="w-4 h-4 text-amber-400" />
            )}
            <span>Download JPG</span>
          </button>

          {/* Copy to Clipboard or Preview */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyClipboard}
              disabled={isExporting}
              className="flex-1 py-3 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition disabled:opacity-50 cursor-pointer"
              title="Salin gambar poster ke clipboard"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Salin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenPreview}
              disabled={isExporting}
              className="px-3 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs flex items-center justify-center border border-stone-700 transition disabled:opacity-50 cursor-pointer"
              title="Pratinjau resolusi tinggi"
            >
              <Eye className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full max-h-[92vh] flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-12 right-0 p-2 text-stone-400 hover:text-white bg-stone-900/80 rounded-full border border-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-auto max-h-[80vh] rounded-lg shadow-2xl border border-stone-700">
              <img src={previewUrl} alt="Poster Wanted HD" className="w-full h-auto object-contain" />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewUrl;
                  link.download = getFileName('png');
                  link.click();
                }}
                className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" /> Unduh Gambar HD
              </button>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="py-2 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
