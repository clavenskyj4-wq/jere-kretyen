import React, { useEffect, useRef, useState } from 'react';
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Check,
  AlertCircle,
  Megaphone,
  Music2,
  ChevronLeft,
  Download,
  Eye,
  ShieldCheck,
  History,
  Image as ImageIcon,
  KeyRound,
} from 'lucide-react';
import { HYMNAL_SECTIONS } from '../../data/sampleSongs';
import { songService } from '../../services/songService';
import { HymnalSection, Language, Song, SongCategory } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { adminBackendService, AdminActivity, InstrumentalTrack } from '../../services/adminBackendService';

interface AdminViewProps {
  language: Language;
  onBack: () => void;
}

function isSongImport(value: unknown): value is Song {
  if (!value || typeof value !== 'object') return false;
  const song = value as Partial<Song>;
  return typeof song.id === 'string'
    && Number.isInteger(song.number)
    && typeof song.title === 'string'
    && typeof song.section === 'string'
    && HYMNAL_SECTIONS.some(section => section.code === song.sectionCode)
    && ['adoration', 'louange', 'foi', 'esperance', 'consecration', 'priere', 'combat_spirituel', 'noel', 'paques', 'enfants'].includes(String(song.category))
    && Array.isArray(song.verses)
    && song.verses.length > 0
    && song.verses.every(verse => Boolean(verse && typeof verse === 'object')
      && Number.isInteger(verse.number)
      && Array.isArray(verse.text)
      && verse.text.every(line => typeof line === 'string'));
}

export const AdminView: React.FC<AdminViewProps> = ({ language, onBack }) => {
  const t = TRANSLATIONS[language];

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Admin tabs
  const [activeAdminTab, setActiveAdminTab] = useState<
    'songs' | 'import' | 'music' | 'announcements' | 'branding' | 'reports' | 'account'
  >('songs');

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
    copyrightStatus: 'À vérifier',
    rights: { status: 'unverified' },
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
  const [brandIconFile, setBrandIconFile] = useState<File | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [instrumentalTracks, setInstrumentalTracks] = useState<InstrumentalTrack[]>([]);
  const [instrumentalTitle, setInstrumentalTitle] = useState('');
  const [instrumentalArtist, setInstrumentalArtist] = useState('');
  const [instrumentalFile, setInstrumentalFile] = useState<File | null>(null);
  const [instrumentalRightsConfirmed, setInstrumentalRightsConfirmed] = useState(false);
  const instrumentalFormRef = useRef<HTMLFormElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    let active = true;
    if (!adminBackendService.isConfigured()) {
      setIsCheckingSession(false);
      return () => { active = false; };
    }
    void adminBackendService.isAdminSession().then(isAdmin => {
      if (active) setIsAuthenticated(isAdmin);
    }).catch(error => {
      if (active) setAuthError(error instanceof Error ? error.message : 'Vérification de session impossible.');
    }).finally(() => {
      if (active) setIsCheckingSession(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    Promise.all([
      songService.refreshSharedSongs(),
      adminBackendService.getAdminActivity(),
      adminBackendService.getPublicAnnouncements(),
    ]).then(([songs, logs, sharedAnnouncements]) => {
      if (!active) return;
      setAllSongs(songs);
      setActivity(logs);
      if (sharedAnnouncements) setAnnouncements(sharedAnnouncements);
    }).catch(error => {
      if (active) setActionError(error instanceof Error ? error.message : 'Impossible de charger les données d’administration.');
    });
    return () => { active = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || activeAdminTab !== 'music') return;
    let active = true;
    adminBackendService.getInstrumentalTracks().then(tracks => {
      if (active) setInstrumentalTracks(tracks);
    }).catch(error => {
      if (active) setActionError(error instanceof Error ? error.message : 'Impossible de charger le catalogue musical.');
    });
    return () => { active = false; };
  }, [isAuthenticated, activeAdminTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await adminBackendService.signIn(loginEmail.trim(), loginPassword);
      setIsAuthenticated(true);
      setLoginPassword('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Connexion impossible. Vérifiez les identifiants.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setActionError(null);
    try {
      await adminBackendService.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'La déconnexion a échoué.');
    }
  };

  // Save / Update Song
  const handleSaveSong = async () => {
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
      copyrightStatus: songForm.copyrightStatus || 'À vérifier',
      rights: songForm.rights || { status: 'unverified' },
      keySignature: songForm.keySignature || 'Fa Majeur (F)',
      tempo: songForm.tempo || 'Modéré',
      verses: songForm.verses && songForm.verses.length > 0 ? songForm.verses : [{ number: 1, text: ['Paroles à venir'] }],
      chorus: songForm.chorus && songForm.chorus.length > 0 && songForm.chorus[0].trim() ? songForm.chorus : undefined,
    };

    setActionError(null);
    try {
      await songService.addCustomSong(newSong);
      setAllSongs(songService.getAllSongs());
      setIsEditingSong(false);
      showToast(language === 'kr' ? 'Chant anrejistre avèk siksè !' : 'Chant enregistré avec succès !');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible d’enregistrer ce chant.');
    }
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
      if (!parsed.every(isSongImport)) {
        setImportError('Au moins un chant est incomplet ou invalide. Vérifiez les champs id, numéro, titres, section, catégorie et couplets.');
        return;
      }
      setImportPreview(parsed);
      showToast(`${parsed.length} chants validés dans l'aperçu.`);
    } catch (error) {
      setImportError(`Erreur de format JSON: ${error instanceof Error ? error.message : 'contenu invalide'}`);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.length === 0) return;
    setActionError(null);
    try {
      for (const song of importPreview) await songService.addCustomSong(song);
      setAllSongs(songService.getAllSongs());
      setImportPreview(null);
      setImportJsonText('');
      showToast(language === 'kr' ? 'Tout chant yo enpòte avèk siksè !' : 'Importation en masse réussie !');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'L’importation a échoué; certains chants peuvent déjà être enregistrés.');
    }
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
        copyrightStatus: 'À vérifier',
        rights: {
          status: 'unverified',
          lyricsAuthor: '',
          composer: '',
          translator: '',
          arranger: '',
          sourceTitle: '',
          sourceUrl: '',
          evidence: '',
        },
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
  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    const updated = [newAnnouncement.trim(), ...announcements];
    setActionError(null);
    try {
      await adminBackendService.saveAnnouncements(updated);
      setAnnouncements(updated);
      setNewAnnouncement('');
      showToast(language === 'kr' ? 'Anons ajoute !' : 'Annonce publiée !');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de publier cette annonce.');
    }
  };

  const handleDeleteAnnouncement = async (index: number) => {
    const updated = announcements.filter((_, i) => i !== index);
    setActionError(null);
    try {
      await adminBackendService.saveAnnouncements(updated);
      setAnnouncements(updated);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de supprimer cette annonce.');
    }
  };

  const handleUploadInstrumental = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!instrumentalFile) {
      setActionError('Choisissez un fichier MP3 à publier.');
      return;
    }
    if (!instrumentalRightsConfirmed) {
      setActionError('Confirmez que vous avez le droit de publier cette musique.');
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      const track = await adminBackendService.uploadInstrumentalTrack(instrumentalTitle, instrumentalArtist, instrumentalFile);
      setInstrumentalTitle('');
      setInstrumentalArtist('');
      setInstrumentalFile(null);
      setInstrumentalRightsConfirmed(false);
      instrumentalFormRef.current?.reset();
      setInstrumentalTracks(current => [track, ...current]);
      showToast('Instrumentale publiée pour tous les utilisateurs.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de publier cette instrumentale.');
      try {
        setInstrumentalTracks(await adminBackendService.getInstrumentalTracks());
      } catch (refreshError) {
        setActionError(current => `${current} Actualisation du catalogue impossible : ${refreshError instanceof Error ? refreshError.message : 'erreur inconnue.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstrumental = async (track: InstrumentalTrack) => {
    if (!window.confirm(`Retirer « ${track.title} » du catalogue pour tous les utilisateurs ?`)) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await adminBackendService.deleteInstrumentalTrack(track);
      setInstrumentalTracks(current => current.filter(item => item.id !== track.id));
      showToast('Instrumentale supprimée.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de supprimer cette instrumentale.');
      try {
        setInstrumentalTracks(await adminBackendService.getInstrumentalTracks());
      } catch (refreshError) {
        setActionError(current => `${current} Actualisation du catalogue impossible : ${refreshError instanceof Error ? refreshError.message : 'erreur inconnue.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrandIconUpload = async () => {
    if (!brandIconFile) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await adminBackendService.uploadBrandIcon(brandIconFile);
      window.dispatchEvent(new Event('brand-icon-updated'));
      setBrandIconFile(null);
      showToast('Logo de l’application mis à jour.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de téléverser le logo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(null);
    if (newPassword.length < 10) {
      setActionError('Choisissez un mot de passe d’au moins 10 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setActionError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminBackendService.changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Mot de passe modifié avec succès.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de modifier le mot de passe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityByAction = activity.reduce<Record<string, number>>((counts, item) => {
    counts[item.action] = (counts[item.action] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12263F] text-amber-300 px-4 py-2 rounded-xl shadow-xl border border-amber-500/40 text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
      {actionError && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
          {actionError}
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

      {isCheckingSession ? (
        <div className="py-16 text-center text-sm text-slate-500">Vérification de la session…</div>
      ) : !isAuthenticated ? (
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

          {!adminBackendService.isConfigured() && (
            <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-amber-700 dark:text-amber-300">
              L’administration sécurisée n’est pas configurée. Suivez la section Supabase du README et configurez les variables du projet.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input
                type="email"
                autoComplete="username"
                autoFocus
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Adresse courriel"
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Mot de passe"
                className="mt-3 w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {authError && <span role="alert" className="text-xs text-rose-500 mt-2 block">{authError}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !adminBackendService.isConfigured()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow hover:brightness-110 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Connexion…' : language === 'kr' ? 'Antre nan Administrasyon' : 'Se connecter'}
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
              onClick={() => setActiveAdminTab('music')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'music'
                  ? 'bg-[#12263F] text-amber-300 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>{language === 'kr' ? 'Mizik' : 'Musique'}</span>
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
            <button
              onClick={() => setActiveAdminTab('branding')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'branding'
                  ? 'bg-[#12263F] text-amber-300 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Identité</span>
            </button>
            <button
              onClick={() => setActiveAdminTab('reports')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'reports'
                  ? 'bg-[#12263F] text-amber-300 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Rapports</span>
            </button>
            <button
              onClick={() => setActiveAdminTab('account')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'account'
                  ? 'bg-[#12263F] text-amber-300 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sécurité</span>
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
                      copyrightStatus: 'À vérifier',
                      rights: { status: 'unverified' },
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

          {activeAdminTab === 'music' && (
            <section className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0D1C30]">
                <h4 className="font-cinzel text-base font-bold text-slate-900 dark:text-white">
                  {language === 'kr' ? 'Ajoute mizik ak enstrimantal' : 'Ajouter une musique ou une instrumentale'}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  MP3 uniquement, 25 Mo maximum. Les pistes publiées seront accessibles à tous dans l’espace Enregistrements.
                </p>
                <form ref={instrumentalFormRef} onSubmit={handleUploadInstrumental} className="mt-4 space-y-3">
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={instrumentalTitle}
                    onChange={event => setInstrumentalTitle(event.target.value)}
                    placeholder="Titre de la musique"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    maxLength={120}
                    value={instrumentalArtist}
                    onChange={event => setInstrumentalArtist(event.target.value)}
                    placeholder="Artiste ou source (facultatif)"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                  <input
                    type="file"
                    required
                    accept=".mp3,audio/mpeg,audio/mp3"
                    onChange={event => setInstrumentalFile(event.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:font-bold file:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  />
                  <label className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={instrumentalRightsConfirmed}
                      onChange={event => setInstrumentalRightsConfirmed(event.target.checked)}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span>
                      Je confirme que j’ai l’autorisation ou les droits nécessaires pour publier et partager ce fichier audio.
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting || !instrumentalFile || !instrumentalRightsConfirmed}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {isSubmitting ? 'Téléversement…' : 'Publier dans le catalogue'}
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0D1C30]">
                <h4 className="mb-3 font-bold text-sm text-slate-900 dark:text-white">
                  Catalogue publié ({instrumentalTracks.length})
                </h4>
                {instrumentalTracks.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-900">
                    Aucune musique publiée pour le moment.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {instrumentalTracks.map(track => (
                      <div key={track.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                        <Music2 className="h-5 w-5 shrink-0 text-amber-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{track.title}</p>
                          {track.artist && <p className="truncate text-xs text-slate-500">{track.artist}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDeleteInstrumental(track)}
                          disabled={isSubmitting}
                          aria-label={`Supprimer ${track.title}`}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
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

          {activeAdminTab === 'branding' && (
            <section className="p-5 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">Logo de l’application</h4>
                <p className="text-xs text-slate-400">
                  Importez une image carrée PNG, JPEG ou WebP (3 Mo maximum). Elle sera partagée dans l’en-tête, les réglages, le favicon et les métadonnées de partage. L’icône déjà installée sur l’écran d’accueil reste définie par le manifeste statique.
                </p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={event => setBrandIconFile(event.target.files?.[0] ?? null)}
                className="block w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-bold file:text-slate-950"
              />
              {brandIconFile && (
                <p className="text-xs text-slate-500">Fichier sélectionné : {brandIconFile.name}</p>
              )}
              <button
                type="button"
                disabled={!brandIconFile || isSubmitting}
                onClick={handleBrandIconUpload}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"
              >
                {isSubmitting ? 'Téléversement…' : 'Publier le logo'}
              </button>
              <p className="text-[11px] text-slate-400">
                La mise à jour de l’aperçu des réseaux sociaux peut dépendre de leur cache et de leur prise en charge des métadonnées dynamiques.
              </p>
            </section>
          )}

          {activeAdminTab === 'reports' && (
            <section className="p-5 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">Rapports et historique</h4>
                <p className="text-xs text-slate-400">Activité administrative récente, limitée aux 200 dernières opérations. Aucun profil utilisateur ni audio n’est inclus.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                  <p className="text-xs text-slate-400">Opérations enregistrées</p>
                  <p className="mt-1 text-2xl font-bold text-amber-500">{activity.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                  <p className="text-xs text-slate-400">Types d’action</p>
                  <p className="mt-1 text-2xl font-bold text-amber-500">{Object.keys(activityByAction).length}</p>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(activityByAction).map(([action, count]) => (
                  <div key={action} className="flex justify-between rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs">
                    <span>{action.replaceAll('_', ' ')}</span><strong>{count}</strong>
                  </div>
                ))}
              </div>
              {activity.length === 0 ? (
                <p className="text-xs text-slate-500">Aucune activité enregistrée pour le moment.</p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {activity.map(item => (
                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-xs">
                      <div><p className="font-semibold">{item.action.replaceAll('_', ' ')}</p><p className="mt-1 text-slate-400">{new Date(item.created_at).toLocaleString(language === 'kr' ? 'ht-HT' : 'fr-FR')}</p></div>
                      <span className="text-right text-slate-400">{Object.entries(item.details).map(([key, value]) => `${key}: ${value}`).join(' · ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeAdminTab === 'account' && (
            <section className="p-5 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">Sécurité du compte</h4>
                <p className="text-xs text-slate-400">Choisissez un nouveau mot de passe d’au moins 10 caractères.</p>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  required
                  value={newPassword}
                  onChange={event => setNewPassword(event.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  required
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">
                  Modifier le mot de passe
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
