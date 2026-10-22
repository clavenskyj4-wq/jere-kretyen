import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Upload,
  FileText,
  Check,
  AlertCircle,
  Megaphone,
  BookOpen,
  Music2,
  ChevronLeft,
  Download,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { HYMNAL_SECTIONS, SAMPLE_SONGS } from '../../data/sampleSongs';
import { songService } from '../../services/songService';
import { HymnalSection, Language, Song, SongCategory } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface AdminViewProps {
  language: Language;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ language, onBack }) => {
  const t = TRANSLATIONS[language];

  // Auth state: Default PIN is 1910 (Louis Segond 1910)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('jere_kretyen_admin_auth') === 'true';
  });
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);

  // Admin tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'songs' | 'import' | 'announcements'>('songs');

  // Song management state
  const [allSongs, setAllSongs] = useState<Song[]>(() => songService.getAllSongs());
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [songForm, setSongForm] = useState<Partial<Song>>({
    number: 1,
    title: '',
    titleKr: '',
    sectionCode: 'CE_FR',
    section: "Chants d'Espérance Français",
    author: '',
    category: 'adoration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Modéré',
    verses: [{ number: 1, text: [''] }],
    chorus: [''],
  });

  // Bulk import state
  const [importJsonText, setImportJsonText] = useState('');
  const [importPreview, setImportPreview] = useState<Song[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Church announcements state
  const [announcements, setAnnouncements] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jere_kretyen_church_announcements');
      return stored ? JSON.parse(stored) : [
        'Culte d\'adoration et de louange tous les dimanches matin à 9h00.',
        'Veillée de prière et de jeûne chaque premier vendredi du mois.'
      ];
    } catch {
      return [];
    }
  });
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '1910') {
      setIsAuthenticated(true);
      sessionStorage.setItem('jere_kretyen_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('jere_kretyen_admin_auth');
  };

  // Save / Update Song
  const handleSaveSong = () => {
    if (!songForm.title || !songForm.number) {
      alert(language === 'kr' ? 'Tanpri mete yon tit ak yon nimewo.' : 'Veuillez saisir un titre et un numéro.');
      return;
    }

    const sec = HYMNAL_SECTIONS.find((s) => s.code === songForm.sectionCode);
    const newSong: Song = {
      id: songForm.id || `custom_${songForm.sectionCode}_${songForm.number}_${Date.now()}`,
      number: Number(songForm.number),
      title: songForm.title.trim(),
      titleKr: songForm.titleKr?.trim() || songForm.title.trim(),
      section: sec ? sec.labelFr : "Chants d'Espérance Français",
      sectionCode: songForm.sectionCode || 'CE_FR',
      author: songForm.author?.trim() || 'Auteur chrétien',
      category: songForm.category || 'louange',
      copyrightStatus: songForm.copyrightStatus || 'Domaine public',
      keySignature: songForm.keySignature || 'Fa Majeur (F)',
      tempo: songForm.tempo || 'Modéré',
      verses: songForm.verses && songForm.verses.length > 0 ? songForm.verses : [{ number: 1, text: ['Paroles à venir'] }],
      chorus: songForm.chorus && songForm.chorus.length > 0 && songForm.chorus[0].trim() ? songForm.chorus : undefined,
    };

    songService.addCustomSong(newSong);
    setAllSongs(songService.getAllSongs());
    setIsEditingSong(false);
    showToast(language === 'kr' ? 'Chant anrejistre avèk siksè !' : 'Chant enregistré avec succès !');
  };

  // Mass Import validation
  const handlePreviewImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        setImportError('Le fichier doit contenir un tableau JSON (liste de chants).');
        return;
      }
      if (parsed.length === 0) {
        setImportError('Le tableau JSON est vide.');
        return;
      }
      setImportPreview(parsed);
      showToast(`${parsed.length} chants validés dans l'aperçu.`);
    } catch (err: any) {
      setImportError(`Erreur de format JSON: ${err.message}`);
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.length === 0) return;
    importPreview.forEach((song) => {
      songService.addCustomSong(song);
    });
    setAllSongs(songService.getAllSongs());
    setImportPreview(null);
    setImportJsonText('');
    showToast(language === 'kr' ? 'Tout chant yo enpòte avèk siksè !' : 'Importation en masse réussie !');
  };

  // Download template JSON
  const handleDownloadTemplate = () => {
    const template = [
      {
        id: 'sample_import_1',
        number: 999,
        title: 'Mon chant chrétien',
        titleKr: 'Chant kretyen mwen an',
        section: "Chants d'Espérance Français",
        sectionCode: 'CE_FR',
        author: 'Auteur / Église',
        category: 'louange',
        copyrightStatus: 'Domaine public',
        keySignature: 'Sol Majeur (G)',
        tempo: 'Joyeux',
        verses: [
          {
            number: 1,
            text: ['Première ligne du chant,', 'Deuxième ligne du chant.']
          }
        ],
        chorus: ['Ligne du refrain,', 'Deuxième ligne du refrain.']
      }
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele_import_chants.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Add announcement
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    const updated = [newAnnouncement.trim(), ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('jere_kretyen_church_announcements', JSON.stringify(updated));
    setNewAnnouncement('');
    showToast(language === 'kr' ? 'Anons ajoute !' : 'Annonce publiée !');
  };

  const handleDeleteAnnouncement = (index: number) => {
    const updated = announcements.filter((_, i) => i !== index);
    setAnnouncements(updated);
    localStorage.setItem('jere_kretyen_church_announcements', JSON.stringify(updated));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12263F] text-amber-300 px-4 py-2 rounded-xl shadow-xl border border-amber-500/40 text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{language === 'kr' ? 'Retounen' : 'Retour'}</span>
        </button>

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:text-red-500 transition"
          >
            {language === 'kr' ? 'Dekonekte' : 'Déconnexion'}
          </button>
        )}
      </div>

      {/* If Not Authenticated, show Pin Code Screen */}
      {!isAuthenticated ? (
        <div className="bg-white dark:bg-[#0D1C30] rounded-3xl p-8 border border-amber-500/30 text-center shadow-xl max-w-sm mx-auto space-y-5 animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-cinzel font-bold text-xl text-slate-900 dark:text-white">
              {language === 'kr' ? 'Espas Administrasyon' : 'Espace Administration'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'kr'
                ? 'Aksè sa a rezève pou lidè ak responsab yo pou ajoute chant ak jere anons.'
                : 'Accès protégé pour les responsables de louange afin d\'ajouter des chants et des annonces.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Code PIN (par défaut : 1910)"
                className="w-full text-center tracking-widest font-mono text-lg py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {pinError && (
                <span className="text-xs text-rose-500 mt-1 block">
                  Code incorrect. Utilisez « 1910 » (Louis Segond).
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow hover:brightness-110 transition active:scale-95"
            >
              {language === 'kr' ? 'Antre nan Administrasyon' : 'Déverrouiller l\'Administration'}
            </button>
          </form>

          {/* Privacy Guarantee Notice */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Les administrateurs ne peuvent <strong>jamais</strong> écouter les enregistrements vocaux privés des utilisateurs.
            </span>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="space-y-5 animate-in fade-in">
          {/* Admin Header */}
          <div className="bg-gradient-to-br from-[#12263F] to-slate-900 rounded-3xl p-5 text-white shadow-lg border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-lg text-white">
                  {language === 'kr' ? 'Administrasyon Jere Kretyen' : 'Administration Jere Kretyen'}
                </h3>
                <p className="text-xs text-amber-300/80">
                  {language === 'kr' ? 'Jesyon chant, enpòtasyon ak anons' : 'Gestion des chants d\'espérance, imports et annonces'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveAdminTab('songs')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'songs'
                  ? 'bg-[#12263F] text-amber-300 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>{language === 'kr' ? 'Chant yo' : 'Chants'}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('import')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'import'
                  ? 'bg-[#12263F] text-amber-300 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{language === 'kr' ? 'Enpòtasyon an mas' : 'Import en masse'}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('announcements')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'announcements'
                  ? 'bg-[#12263F] text-amber-300 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{language === 'kr' ? 'Anons' : 'Annonces'}</span>
            </button>
          </div>

          {/* TAB 1: SONGS MANAGEMENT */}
          {activeAdminTab === 'songs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                  Répertoire des chants ({allSongs.length})
                </h4>
                <button
                  onClick={() => {
                    setSongForm({
                      number: allSongs.length + 1,
                      title: '',
                      titleKr: '',
                      sectionCode: 'CE_FR',
                      category: 'louange',
                      copyrightStatus: 'Domaine public',
                      keySignature: 'Sol Majeur (G)',
                      verses: [{ number: 1, text: ['Ligne 1...', 'Ligne 2...'] }],
                      chorus: [''],
                    });
                    setIsEditingSong(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow hover:bg-amber-400 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'kr' ? 'Ajoute yon chant' : 'Ajouter un chant'}</span>
                </button>
              </div>

              {/* Form Modal for Adding / Editing */}
              {isEditingSong && (
                <div className="p-5 bg-white dark:bg-[#0D1C30] rounded-3xl border border-amber-500/40 shadow-lg space-y-4 animate-in fade-in">
                  <h4 className="font-cinzel font-bold text-base text-amber-400">
                    {language === 'kr' ? 'Fòmilè pou Ajoute / Modifye Chant' : 'Formulaire de Cantique'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Numéro du chant :
                      </label>
                      <input
                        type="number"
                        value={songForm.number || ''}
                        onChange={(e) => setSongForm({ ...songForm, number: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Recueil / Section :
                      </label>
                      <select
                        value={songForm.sectionCode}
                        onChange={(e) => setSongForm({ ...songForm, sectionCode: e.target.value as HymnalSection })}
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                      >
                        {HYMNAL_SECTIONS.map((sec) => (
                          <option key={sec.code} value={sec.code}>
                            {sec.labelFr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Titre (Français) :
                      </label>
                      <input
                        type="text"
                        value={songForm.title || ''}
                        onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                        placeholder="Ex: Grand Dieu, nous te bénissons"
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Titre (Kreyòl) :
                      </label>
                      <input
                        type="text"
                        value={songForm.titleKr || ''}
                        onChange={(e) => setSongForm({ ...songForm, titleKr: e.target.value })}
                        placeholder="Ex: Granmèt, nou beni Non w"
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Thème spirituel :
                      </label>
                      <select
                        value={songForm.category}
                        onChange={(e) => setSongForm({ ...songForm, category: e.target.value as SongCategory })}
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                      >
                        <option value="adoration">Adoration</option>
                        <option value="louange">Louange</option>
                        <option value="foi">Foi</option>
                        <option value="esperance">Espérance</option>
                        <option value="consecration">Consécration</option>
                        <option value="priere">Prière</option>
                        <option value="combat_spirituel">Combat Spirituel</option>
                        <option value="paques">Pâques</option>
                        <option value="noel">Noël</option>
                        <option value="enfants">Enfants</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Tonalité musicale :
                      </label>
                      <input
                        type="text"
                        value={songForm.keySignature || ''}
                        onChange={(e) => setSongForm({ ...songForm, keySignature: e.target.value })}
                        placeholder="Ex: Fa Majeur (F)"
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Verses input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Paroles du Couplet 1 (une ligne par retour à la ligne) :
                    </label>
                    <textarea
                      rows={4}
                      value={songForm.verses?.[0]?.text?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        setSongForm({
                          ...songForm,
                          verses: [{ number: 1, text: lines }],
                        });
                      }}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-scripture leading-relaxed"
                    />
                  </div>

                  {/* Chorus input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Paroles du Refrain (optionnel) :
                    </label>
                    <textarea
                      rows={3}
                      value={songForm.chorus?.join('\n') || ''}
                      onChange={(e) => setSongForm({ ...songForm, chorus: e.target.value.split('\n') })}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-scripture italic"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingSong(false)}
                      className="px-4 py-2 text-xs text-slate-500 hover:text-white"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      onClick={handleSaveSong}
                      className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 shadow transition"
                    >
                      {t.common.save}
                    </button>
                  </div>
                </div>
              )}

              {/* List of existing songs with delete/edit */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allSongs.map((song) => (
                  <div
                    key={song.id}
                    className="p-3 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-bold text-amber-500 shrink-0">#{song.number}</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {song.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">({song.sectionCode})</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setSongForm(song);
                          setIsEditingSong(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-500 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MASS IMPORT */}
          {activeAdminTab === 'import' && (
            <div className="p-5 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">
                    {language === 'kr' ? 'Enpòte Chants an Mas (JSON)' : 'Import de Cantiques en Masse (JSON)'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Collez votre liste de chants au format JSON pour les importer en un seul clic.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Modèle JSON</span>
                </button>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "number": 1, "title": "Mon Chant", "sectionCode": "CE_FR", "category": "louange", "verses": [ { "number": 1, "text": ["Ligne 1", "Ligne 2"] } ] } ]'
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl font-mono"
              />

              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviewImport}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-300"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Vérifier et Prévisualiser</span>
                </button>

                {importPreview && (
                  <button
                    onClick={handleConfirmImport}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirmer l'import ({importPreview.length} chants)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHURCH ANNOUNCEMENTS */}
          {activeAdminTab === 'announcements' && (
            <div className="p-5 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">
                  {language === 'kr' ? 'Anons pou Legliz la' : 'Annonces & Nouvelles de l\'Église'}
                </h4>
                <p className="text-xs text-slate-400">
                  Ces annonces s'affichent sur l'écran d'accueil pour édifier et informer l'assemblée.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder={language === 'kr' ? 'Ekri yon nouvo anons...' : 'Rédiger une annonce spirituelle...'}
                  className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
                <button
                  onClick={handleAddAnnouncement}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition shrink-0"
                >
                  Publier
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {announcements.map((ann, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200">{ann}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
