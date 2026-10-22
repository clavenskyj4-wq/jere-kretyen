import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Language } from '../../types';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android
  if (isInstallable) {
    return (
      <div className="bg-gradient-to-r from-[#12263F] to-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-amber-200">
              {language === 'kr' ? 'Enstale aplikasyon an' : 'Installer l\'application'}
            </h4>
            <p className="text-xs text-slate-300">
              {language === 'kr' 
                ? 'Sèvi ak Labib ak Chant yo menm san entènèt' 
                : 'Accédez à la Bible et aux chants même sans connexion'}
            </p>
          </div>
        </div>
        <button
          onClick={install}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition"
        >
          {language === 'kr' ? 'Enstale' : 'Installer'}
        </button>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="bg-gradient-to-r from-[#12263F] to-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-amber-200">
                {language === 'kr' ? 'Mete sou ekran iPhone ou' : 'Ajouter à l\'écran d\'accueil'}
              </h4>
              <p className="text-xs text-slate-300">
                {language === 'kr' ? 'Gid pou iPhone & iPad' : 'Guide pour iPhone et iPad'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="shrink-0 px-3 py-1.5 rounded-xl border border-amber-400/40 text-amber-300 font-semibold text-xs hover:bg-amber-400/10 active:scale-95 transition"
          >
            {language === 'kr' ? 'Kòman fè ?' : 'Comment faire ?'}
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#12263F] border border-amber-500/30 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cinzel text-lg font-bold text-amber-300">
                  {language === 'kr' ? 'Enstale sou iPhone / iPad' : 'Installer sur iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-sm text-slate-200">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Étape 1: </span>
                    {language === 'kr'
                      ? 'Peze sou bouton « Pataje » (Share) ki anba nan navigatè Safari a.'
                      : 'Appuyez sur le bouton de Partage en bas dans la barre Safari.'}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Étape 2: </span>
                    {language === 'kr'
                      ? 'Desann nan meni an epi peze sou « Ajoute sou ekran akèy » (Sur l\'écran d\'accueil).'
                      : 'Faites défiler vers le bas et touchez « Sur l\'écran d\'accueil ».'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
              >
                {language === 'kr' ? 'Mwen konprann' : 'C\'est compris'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
