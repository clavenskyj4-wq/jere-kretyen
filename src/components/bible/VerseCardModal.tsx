import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check, Palette, Sparkles } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface VerseCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  verseText: string;
  verseTextKr?: string;
  language: Language;
}

type CardTheme = 'night' | 'emerald' | 'dawn' | 'scripture';

export const VerseCardModal: React.FC<VerseCardModalProps> = ({
  isOpen,
  onClose,
  reference,
  verseText,
  verseTextKr,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTheme, setCurrentTheme] = useState<CardTheme>('night');
  const [cardMode, setCardMode] = useState<'both' | 'kr' | 'fr'>(verseTextKr ? 'both' : 'fr');
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Render high-res canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if (currentTheme === 'night') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#12263F');
      grad.addColorStop(0.5, '#0B1728');
      grad.addColorStop(1, '#050D18');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Gold border
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Inner faint border
      ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)';
      ctx.lineWidth = 3;
      ctx.strokeRect(55, 55, width - 110, height - 110);
    } else if (currentTheme === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#064E3B');
      grad.addColorStop(0.7, '#022C22');
      grad.addColorStop(1, '#011F18');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, width - 80, height - 80);
    } else if (currentTheme === 'dawn') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#78350F');
      grad.addColorStop(0.5, '#451A03');
      grad.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, width - 80, height - 80);
    } else {
      // Scripture / Parchemin
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      ctx.strokeStyle = 'rgba(120, 53, 15, 0.2)';
      ctx.lineWidth = 3;
      ctx.strokeRect(55, 55, width - 110, height - 110);
    }

    // 2. Decorative Cross
    const isLight = currentTheme === 'scripture';
    ctx.fillStyle = isLight ? '#C9A227' : '#F2D06B';
    ctx.textAlign = 'center';
    ctx.font = '900 36px "Montserrat", sans-serif';
    ctx.fillText('✝', width / 2, 130);

    // 3. Draw App Title
    ctx.font = '900 26px "Montserrat", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillStyle = isLight ? '#78350F' : '#C9A227';
    ctx.fillText('JERE KRETYEN', width / 2, 175);

    // Helper to wrap text
    const wrapText = (text: string, maxWidth: number, fontStr: string): string[] => {
      ctx.font = fontStr;
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
      return lines;
    };

    const maxWidth = 880;

    if (cardMode === 'both' && verseTextKr) {
      // DUAL MODE: Both French and Haitian Creole
      const frLines = wrapText(`« ${verseText} »`, maxWidth, 'italic 500 34px "Montserrat", sans-serif');
      const krLines = wrapText(`« ${verseTextKr} »`, maxWidth, 'italic 500 32px "Montserrat", sans-serif');

      const frLineHeight = 48;
      const krLineHeight = 44;
      const separatorSpace = 60;
      const totalBlockHeight =
        frLines.length * frLineHeight + separatorSpace + krLines.length * krLineHeight;

      let startY = height / 2 - totalBlockHeight / 2 + 10;

      // Draw French text
      ctx.fillStyle = isLight ? '#1E293B' : '#FFFFFF';
      ctx.font = 'italic 500 34px "Montserrat", sans-serif';
      frLines.forEach((l) => {
        ctx.fillText(l, width / 2, startY);
        startY += frLineHeight;
      });

      // Decorative divider
      startY += 10;
      ctx.font = '700 18px "Montserrat", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillStyle = isLight ? '#B45309' : '#FBBF24';
      ctx.fillText('— KREYÒL AYISYEN —', width / 2, startY);
      startY += 36;

      // Draw Haitian Creole text
      ctx.fillStyle = isLight ? '#78350F' : '#FDE68A';
      ctx.font = 'italic 500 32px "Montserrat", sans-serif';
      krLines.forEach((l) => {
        ctx.fillText(l, width / 2, startY);
        startY += krLineHeight;
      });

      // Reference
      ctx.font = '900 32px "Montserrat", sans-serif';
      ctx.fillStyle = isLight ? '#92400E' : '#F2D06B';
      ctx.letterSpacing = '2px';
      ctx.fillText(`— ${reference} —`, width / 2, startY + 50);
    } else {
      // SINGLE MODE
      const targetText = cardMode === 'kr' && verseTextKr ? `« ${verseTextKr} »` : `« ${verseText} »`;
      let fontSize = 46;
      if (targetText.length > 200) fontSize = 38;
      if (targetText.length > 320) fontSize = 32;

      const lines = wrapText(targetText, maxWidth, `italic 500 ${fontSize}px "Montserrat", sans-serif`);
      const lineHeight = fontSize * 1.5;
      const totalHeight = lines.length * lineHeight;
      let startY = height / 2 - totalHeight / 2 + 20;

      ctx.fillStyle = isLight ? '#1E293B' : '#FFFFFF';
      ctx.font = `italic 500 ${fontSize}px "Montserrat", sans-serif`;
      lines.forEach((l) => {
        ctx.fillText(l, width / 2, startY);
        startY += lineHeight;
      });

      // Reference
      ctx.font = '900 34px "Montserrat", sans-serif';
      ctx.fillStyle = isLight ? '#92400E' : '#F2D06B';
      ctx.letterSpacing = '2px';
      ctx.fillText(`— ${reference} —`, width / 2, startY + 55);
    }

    // Subtitle / Slogan footer
    ctx.font = '500 22px "Montserrat", sans-serif';
    ctx.fillStyle = isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)';
    ctx.letterSpacing = '1px';
    ctx.fillText('Chante epi viv Pawòl la • Louis Segond & Kreyòl', width / 2, height - 85);

    // Generate data URL for image preview
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setImageUrl(dataUrl);
    } catch {
      // fallback
    }
  }, [isOpen, currentTheme, cardMode, verseText, verseTextKr, reference, language]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `Verset_${reference.replace(/[^a-zA-Z0-9]/g, '_')}_JereKretyen.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currentTextToShare =
    cardMode === 'both' && verseTextKr
      ? `« ${verseText} »\n\n« ${verseTextKr} »`
      : cardMode === 'kr' && verseTextKr
      ? `« ${verseTextKr} »`
      : `« ${verseText} »`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], `Verset_${reference}.png`, { type: 'image/png' });
        await navigator.share({
          title: `Verset ${reference} — Jere Kretyen`,
          text: `${currentTextToShare} (${reference})\nJere Kretyen — Chante et vis la Parole`,
          files: [file],
        });
        return;
      } catch {
        // Fallback to text sharing or download
      }
    }

    // Direct WhatsApp share fallback with text
    const textToShare = encodeURIComponent(`*${reference}*\n${currentTextToShare}\n\n_Jere Kretyen — Chante et vis la Parole_`);
    window.open(`https://api.whatsapp.com/send?text=${textToShare}`, '_blank');
  };

  const handleCopyText = () => {
    let formatted = '';
    if (cardMode === 'both' && verseTextKr) {
      formatted = `« ${verseText} »\n\n« ${verseTextKr} »\n(${reference} — Louis Segond & Kreyòl Ayisyen)`;
    } else if (cardMode === 'kr' && verseTextKr) {
      formatted = `« ${verseTextKr} » (${reference} — Kreyòl Ayisyen)`;
    } else {
      formatted = `« ${verseText} » (${reference} — Louis Segond)`;
    }
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md max-h-[92vh] bg-white dark:bg-[#0D1C30] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20">
        {/* Header */}
        <div className="p-4 bg-[#12263F] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-base text-amber-300">
              {t.imageGenerator.title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Canvas preview (hidden canvas, visible image for responsive fit) */}
          <canvas ref={canvasRef} className="hidden" />
          {imageUrl ? (
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-900 aspect-square max-w-[320px] mx-auto">
              <img src={imageUrl} alt={reference} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="aspect-square max-w-[320px] mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-sm text-slate-400">
              {t.imageGenerator.generating}
            </div>
          )}

          {/* Theme Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.imageGenerator.themeSelect}</span>
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
              <button
                onClick={() => setCurrentTheme('night')}
                className={`py-2 px-1 rounded-xl border text-center transition ${
                  currentTheme === 'night'
                    ? 'border-amber-400 bg-[#12263F] text-amber-300 font-bold shadow'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Bleu Nuit
              </button>
              <button
                onClick={() => setCurrentTheme('emerald')}
                className={`py-2 px-1 rounded-xl border text-center transition ${
                  currentTheme === 'emerald'
                    ? 'border-emerald-400 bg-emerald-950 text-emerald-300 font-bold shadow'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Émeraude
              </button>
              <button
                onClick={() => setCurrentTheme('dawn')}
                className={`py-2 px-1 rounded-xl border text-center transition ${
                  currentTheme === 'dawn'
                    ? 'border-amber-400 bg-amber-950 text-amber-300 font-bold shadow'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Aube
              </button>
              <button
                onClick={() => setCurrentTheme('scripture')}
                className={`py-2 px-1 rounded-xl border text-center transition ${
                  currentTheme === 'scripture'
                    ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold shadow'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Parchemin
              </button>
            </div>
          </div>

          {/* Language Selection: Bilingue / Kreyòl / Français */}
          {verseTextKr && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                {language === 'kr' ? 'Lang vèsè sou imaj la :' : 'Langue du verset :' }
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setCardMode('both')}
                  className={`py-2 px-1 rounded-xl border transition text-center ${
                    cardMode === 'both'
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Bilingue (FR+KR)
                </button>
                <button
                  onClick={() => setCardMode('kr')}
                  className={`py-2 px-1 rounded-xl border transition text-center ${
                    cardMode === 'kr'
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Kreyòl
                </button>
                <button
                  onClick={() => setCardMode('fr')}
                  className={`py-2 px-1 rounded-xl border transition text-center ${
                    cardMode === 'fr'
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Français
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Image</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-110 transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
