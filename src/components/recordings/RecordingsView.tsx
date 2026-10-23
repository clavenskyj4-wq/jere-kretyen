import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Download,
  Trash2,
  Clock,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  AlertCircle,
  FileAudio,
  Check,
  ShieldCheck,
  Music2,
  X,
  Edit2,
  Heart,
  HardDrive,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Language, Song } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { recordingStorageService, StoredAudioRecording } from '../../services/recordingStorageService';
import { createStudioMix, StudioMixOptions, StudioVoiceTone } from '../../services/audioProductionService';

interface RecordingsViewProps {
  language: Language;
  songForRecording?: Song | null;
  onClearSongForRecording?: () => void;
  onBack?: () => void;
}

export const RecordingsView: React.FC<RecordingsViewProps> = ({
  language,
  songForRecording,
  onClearSongForRecording,
  onBack,
}) => {
  const t = TRANSLATIONS[language];

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Audio elements & MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  // Stored Recordings from IndexedDB
  const [recordings, setRecordings] = useState<StoredAudioRecording[]>([]);
  const [storageUsage, setStorageUsage] = useState<{ usedBytes: number; quotaBytes: number }>({
    usedBytes: 0,
    quotaBytes: 0,
  });

  // Player state
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);

  // Modals for Renaming and Notes
  const [editingRecord, setEditingRecord] = useState<StoredAudioRecording | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [studioRecording, setStudioRecording] = useState<StoredAudioRecording | null>(null);
  const [studioOptions, setStudioOptions] = useState<StudioMixOptions>({
    studioVoice: true,
    voiceTone: 'natural',
    reverb: 0.18,
    echo: 0,
    tempo: 86,
    accompanimentVolume: 0.55,
    drums: false,
    guitar: false,
    keyboard: true,
  });
  const [isProcessingStudioMix, setIsProcessingStudioMix] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load from IndexedDB on mount
  useEffect(() => {
    loadRecordings();
    loadStorageEstimate();
  }, []);

  const loadRecordings = async () => {
    try {
      const list = await recordingStorageService.getAll();
      setRecordings(list);
    } catch {
      // fallback
    }
  };

  const loadStorageEstimate = async () => {
    const est = await recordingStorageService.getStorageEstimate();
    setStorageUsage(est);
  };

  // Request Wake Lock during recording
  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {
      // ignore
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Start recording
  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine best audio mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        releaseWakeLock();
        cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        const newRecord: StoredAudioRecording = {
          id: `rec_${Date.now()}`,
          title: songForRecording
            ? `#${songForRecording.number} ${songForRecording.title}`
            : language === 'kr'
            ? `Lapriyè / Vwa (${new Date().toLocaleDateString()})`
            : `Prière / Méditation (${new Date().toLocaleDateString()})`,
          songTitle: songForRecording?.title,
          songNumber: songForRecording?.number,
          duration: recordDuration,
          audioBlob,
          createdAt: Date.now(),
          sizeBytes: audioBlob.size,
          mimeType: recorder.mimeType || 'audio/webm',
          isFavorite: false,
        };

        await recordingStorageService.save(newRecord);
        await loadRecordings();
        await loadStorageEstimate();

        setIsRecording(false);
        setIsPaused(false);
        setRecordDuration(0);
        setMicVolume(0);
        showToast(language === 'kr' ? 'Anrejistreman an sove nan telefòn lan !' : 'Enregistrement sauvegardé localement !');
      };

      // Set up Audio Analyser for VU Meter
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch {
        // VU meter optional
      }

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      acquireWakeLock();

      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          // 10 minutes limit (600s)
          if (prev >= 600) {
            stopRecording();
            return 600;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setPermissionError(
        language === 'kr'
          ? 'Navigatè a pa gen otorizasyon pou mikwo a. Tanpri pèmèt li nan reglaj telefòn ou.'
          : 'Accès au microphone requis. Veuillez autoriser le micro dans les paramètres du navigateur pour chanter et vous enregistrer.'
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (window.confirm(language === 'kr' ? 'Èske w vle anile anrejistreman sa a?' : 'Voulez-vous annuler cet enregistrement ?')) {
      clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setIsPaused(false);
      setRecordDuration(0);
      setMicVolume(0);
      releaseWakeLock();
    }
  };

  // Playback handlers
  const handlePlayRecording = (rec: StoredAudioRecording) => {
    if (currentPlayingId === rec.id && isPlaying) {
      activeAudioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    const url = URL.createObjectURL(rec.audioBlob);
    setActiveBlobUrl(url);

    const audio = new Audio(url);
    activeAudioRef.current = audio;
    audio.playbackRate = playbackRate;

    audio.onloadedmetadata = () => {
      setPlaybackDuration(audio.duration || rec.duration);
    };

    audio.ontimeupdate = () => {
      setPlaybackProgress(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    };

    audio.play().then(() => {
      setCurrentPlayingId(rec.id);
      setIsPlaying(true);
    }).catch(() => {
      alert(language === 'kr' ? 'Pa ka jwe dosye sa a' : 'Lecture impossible');
    });
  };

  // Skip 10 seconds backward / forward
  const handleSkip = (seconds: number) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.currentTime = Math.max(
        0,
        Math.min(activeAudioRef.current.duration || 600, activeAudioRef.current.currentTime + seconds)
      );
    }
  };

  // Change playback speed
  const cyclePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (activeAudioRef.current) {
      activeAudioRef.current.playbackRate = nextRate;
    }
  };

  const handleDeleteRecording = async (id: string) => {
    if (window.confirm(t.record.deleteConfirm)) {
      if (currentPlayingId === id && activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      await recordingStorageService.delete(id);
      await loadRecordings();
      await loadStorageEstimate();
      showToast(language === 'kr' ? 'Anrejistreman efase' : 'Enregistrement supprimé');
    }
  };

  const toggleFavorite = async (rec: StoredAudioRecording) => {
    await recordingStorageService.update(rec.id, { isFavorite: !rec.isFavorite });
    await loadRecordings();
  };

  const handleOpenEdit = (rec: StoredAudioRecording) => {
    setEditingRecord(rec);
    setEditTitle(rec.title);
    setEditNote(rec.note || '');
  };

  const handleSaveEdit = async () => {
    if (editingRecord && editTitle.trim()) {
      await recordingStorageService.update(editingRecord.id, {
        title: editTitle.trim(),
        note: editNote.trim(),
      });
      await loadRecordings();
      setEditingRecord(null);
      showToast(language === 'kr' ? 'Chanjman yo sove !' : 'Modifications enregistrées !');
    }
  };

  const handleCreateStudioMix = async () => {
    if (!studioRecording || isProcessingStudioMix) return;
    setIsProcessingStudioMix(true);
    setStudioError(null);
    try {
      const audioBlob = await createStudioMix(studioRecording.audioBlob, studioOptions);
      const mixedRecording: StoredAudioRecording = {
        ...studioRecording,
        id: `rec_studio_${Date.now()}`,
        title: `${studioRecording.title} (${language === 'kr' ? 'Studio' : 'Studio'})`,
        audioBlob,
        createdAt: Date.now(),
        sizeBytes: audioBlob.size,
        mimeType: audioBlob.type,
        isFavorite: false,
        note: language === 'kr'
          ? 'Vèsyon estidyo kreye sou aparèy sa a.'
          : 'Version studio créée sur cet appareil.',
      };
      await recordingStorageService.save(mixedRecording);
      await loadRecordings();
      await loadStorageEstimate();
      setStudioRecording(null);
      showToast(language === 'kr' ? 'Nouvo vèsyon Studio a anrejistre !' : 'Nouvelle version studio enregistrée !');
    } catch (error) {
      console.error('Could not create studio mix.', error);
      const message = error instanceof Error ? error.message : '';
      setStudioError(message.includes('five minutes')
        ? language === 'kr'
          ? 'Tretman estidyo a limite a anrejistreman ki dire 5 minit oswa mwens.'
          : 'Le traitement studio est limité aux enregistrements de 5 minutes ou moins.'
        : language === 'kr'
          ? 'Nou pa t kapab trete anrejistreman an. Verifye fòma fichye a epi eseye ankò.'
          : 'Le traitement a échoué. Vérifiez le format de l’enregistrement puis réessayez.');
    } finally {
      setIsProcessingStudioMix(false);
    }
  };

  // Share recording audio file or download
  const handleShareRecording = async (rec: StoredAudioRecording) => {
    const extension = rec.mimeType.includes('wav') ? 'wav' : rec.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const filename = `${rec.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;

    if (navigator.share) {
      try {
        const file = new File([rec.audioBlob], filename, { type: rec.mimeType });
        await navigator.share({
          title: rec.title,
          text: `Enregistrement vocal : ${rec.title}\nJere Kretyen — Chante et vis la Parole`,
          files: [file],
        });
        return;
      } catch {
        // Fallback to download
      }
    }

    // Direct download
    const url = URL.createObjectURL(rec.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12263F] text-amber-300 px-4 py-2 rounded-xl shadow-xl border border-amber-500/40 text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Back Button */}
      {onBack && (
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 shadow-sm"
            title="Retour à l'accueil"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'kr' ? 'Akèy' : 'Retour'}</span>
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-cinzel">
            {language === 'kr' ? 'Estidyo Vokal' : 'Studio Vocal'}
          </span>
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-[#12263F] border border-amber-500/30 text-white flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-amber-300">
              {language === 'kr' ? 'Vwa ou se yon done pèsonèl' : 'Votre voix est une donnée personnelle'} :
            </span>{' '}
            <span className="text-slate-200">
              {language === 'kr'
                ? 'Tout anrejistreman yo rete nan memwa telefòn ou sèlman (IndexedDB).'
                : 'Tous les enregistrements restent stockés localement sur votre appareil.'}
            </span>
          </div>
        </div>

        {/* Space used indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-200/80 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0 font-mono">
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <span>{formatBytes(storageUsage.usedBytes)}</span>
        </div>
      </div>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500 text-white text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-300">Microphone</h4>
            <p className="text-rose-100">{permissionError}</p>
          </div>
        </div>
      )}

      {/* Recording Studio Card */}
      <div className="bg-gradient-to-br from-[#12263F] via-slate-900 to-[#0A1626] rounded-3xl p-6 text-white shadow-2xl border border-amber-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mic className={`w-5 h-5 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <h3 className="font-cinzel font-bold text-lg text-amber-300">
              {isRecording
                ? language === 'kr' ? 'ANREJISTREMAN AN KOU' : 'ENREGISTREMENT EN COURS'
                : t.record.title}
            </h3>
          </div>

          {/* Active Song Badge if launched from hymn */}
          {songForRecording && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Music2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px]">
                #{songForRecording.number} {songForRecording.title}
              </span>
              {onClearSongForRecording && (
                <button onClick={onClearSongForRecording} className="ml-1 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* If singing with song, display lyrics preview box with scroll */}
        {songForRecording && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-h-52 overflow-y-auto text-center space-y-4 font-scripture text-slate-200">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block font-sans">
              Paroles du chant #{songForRecording.number} — {songForRecording.section}
            </span>
            {songForRecording.verses.map((v) => (
              <div key={v.number} className="text-sm leading-relaxed">
                <span className="text-[11px] text-amber-500/80 block font-sans font-bold">
                  Couplet {v.number}
                </span>
                {v.text.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
            ))}
            {songForRecording.chorus && (
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300 text-sm italic">
                <span className="block text-[10px] font-sans font-bold uppercase tracking-wider mb-1">
                  Refrain
                </span>
                {songForRecording.chorus.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recording Screen Center: Timer & Dynamic Sound Bar */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          {/* Big Timer */}
          <div className="flex items-center gap-2.5">
            {isRecording && (
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping inline-block" />
            )}
            <span className="font-mono font-bold text-4xl sm:text-5xl text-white tracking-wider">
              {formatTime(recordDuration)}
            </span>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {isRecording
              ? isPaused
                ? language === 'kr' ? 'Anrejistreman an nan poz' : 'Enregistrement en pause'
                : language === 'kr' ? 'Koute vwa w nan mikwo a...' : 'Parlez ou chantez clairement...'
              : language === 'kr' ? 'Peze gwo bouton wouj la pou kòmanse' : 'Touchez le bouton rouge pour démarrer'}
          </span>

          {/* Dynamic VU Meter Level */}
          {isRecording && (
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Niveau micro</span>
                <span>{micVolume}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    micVolume > 70
                      ? 'bg-rose-500'
                      : micVolume > 30
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.max(4, micVolume)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {isRecording ? (
            <>
              {/* Cancel Button */}
              <button
                onClick={cancelRecording}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title={t.record.cancelRecord}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Pause / Resume */}
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shadow-lg"
                  title={t.record.resumeRecord}
                >
                  <Play className="w-6 h-6 fill-current" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="p-4 rounded-2xl bg-slate-800 text-amber-300 font-bold hover:bg-slate-700 border border-amber-500/30 transition shadow-lg"
                  title={t.record.pauseRecord}
                >
                  <Pause className="w-6 h-6" />
                </button>
              )}

              {/* Stop & Save */}
              <button
                onClick={stopRecording}
                className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg active:scale-95 flex items-center gap-2"
                title={t.record.stopRecord}
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            </>
          ) : (
            /* Big Red Start Record Button */
            <button
              onClick={startRecording}
              className="px-8 py-4 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white font-bold text-base shadow-xl hover:brightness-110 active:scale-95 transition flex items-center gap-3 ring-4 ring-rose-500/20"
            >
              <Mic className="w-6 h-6" />
              <span>{t.record.startRecord}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mes Enregistrements List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-amber-500" />
            <h3 className="font-cinzel font-bold text-lg text-slate-900 dark:text-white">
              {t.record.myRecordings}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {recordings.length} {language === 'kr' ? 'dosye' : 'fichiers'}
          </span>
        </div>

        {recordings.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
            <FileAudio className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-medium">{t.record.noRecordingsYet}</p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'kr'
                ? 'Ou ka chante ak pawòl yon chant oswa anrejistre yon priyè.'
                : 'Chantez avec les paroles d\'un chant ou enregistrez une méditation.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((rec) => {
              const isCurrentPlaying = currentPlayingId === rec.id;
              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-3xl border transition shadow-sm ${
                    isCurrentPlaying
                      ? 'bg-amber-50/80 dark:bg-slate-800/90 border-amber-500/50 ring-1 ring-amber-400/50'
                      : 'bg-white dark:bg-[#0D1C30] border-slate-200 dark:border-slate-800 hover:border-amber-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayRecording(rec)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition active:scale-95 ${
                          isCurrentPlaying && isPlaying
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-500 hover:text-slate-950'
                        }`}
                      >
                        {isCurrentPlaying && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        )}
                      </button>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {rec.title}
                          </h4>
                          {rec.isFavorite && (
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {formatTime(rec.duration)}
                          </span>
                          <span>•</span>
                          <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{formatBytes(rec.sizeBytes)}</span>
                        </div>

                        {rec.note && (
                          <p className="text-xs text-amber-700 dark:text-amber-300 italic mt-1 line-clamp-1">
                            Note : {rec.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Studio, Edit, Favorite, Share, Delete */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setStudioRecording(rec);
                          setStudioError(null);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-500 transition"
                        title={language === 'kr' ? 'Pèsonalize vwa a ak mizik' : 'Personnaliser la voix et ajouter des instruments'}
                        aria-label={language === 'kr' ? 'Louvri estidyo vwa a' : 'Ouvrir le studio vocal'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleFavorite(rec)}
                        className={`p-2 rounded-xl transition ${
                          rec.isFavorite
                            ? 'text-rose-500 hover:text-rose-600'
                            : 'text-slate-400 hover:text-rose-500'
                        }`}
                        title="Favori"
                      >
                        <Heart className={`w-4 h-4 ${rec.isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(rec)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-500 transition"
                        title="Renommer / Note"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleShareRecording(rec)}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition"
                        title="Partager"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteRecording(rec.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Audio Controls Bar when playing */}
                  {isCurrentPlaying && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-2 animate-in fade-in">
                      {/* Seek Bar */}
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                        <span>{formatTime(playbackProgress)}</span>
                        <div
                          className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden cursor-pointer relative"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            if (activeAudioRef.current) {
                              activeAudioRef.current.currentTime = pos * (playbackDuration || rec.duration);
                            }
                          }}
                        >
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{
                              width: `${(playbackProgress / (playbackDuration || rec.duration || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span>{formatTime(playbackDuration || rec.duration)}</span>
                      </div>

                      {/* Fast Controls: -10s, +10s, Speed */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSkip(-10)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1"
                          >
                            <Rewind className="w-3.5 h-3.5" />
                            <span>-10s</span>
                          </button>
                          <button
                            onClick={() => handleSkip(10)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1"
                          >
                            <FastForward className="w-3.5 h-3.5" />
                            <span>+10s</span>
                          </button>
                        </div>

                        <button
                          onClick={cyclePlaybackRate}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold hover:bg-amber-500 hover:text-slate-950 transition"
                        >
                          {playbackRate}x
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {studioRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-mix-title"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-amber-500/30 bg-white p-5 text-slate-900 shadow-2xl dark:bg-[#0D1C30] dark:text-white space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="studio-mix-title" className="font-cinzel text-lg font-bold">
                  {language === 'kr' ? 'Estidyo vwa' : 'Studio vocal'}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{studioRecording.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setStudioRecording(null)}
                disabled={isProcessingStudioMix}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 dark:hover:text-white"
                aria-label={language === 'kr' ? 'Fèmen' : 'Fermer'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-emerald-300/60 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              <ShieldCheck className="mr-1 inline h-4 w-4" />
              {language === 'kr'
                ? 'Tretman an fèt dirèkteman sou telefòn ou. Vwa a pa voye sou entènèt.'
                : 'Le traitement se fait sur votre appareil. Votre voix n’est pas téléversée ni envoyée à un service externe.'}
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {language === 'kr'
                ? 'Anrejistreman orijinal la rete san chanjman. Ajoute konpresyon, koulè vwa, reverberasyon, eko ak yon akonpayman sentetize nan yon nouvo kopi.'
                : 'L’enregistrement original reste intact. Ajoutez compression, couleur vocale, réverbération, écho et accompagnement synthétisé à une nouvelle copie.'}
            </p>

            <div className="space-y-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {language === 'kr' ? 'Koulè vwa' : 'Couleur de voix'}
                </span>
                <select
                  value={studioOptions.voiceTone}
                  disabled={isProcessingStudioMix}
                  onChange={(event) => {
                    const tone = event.target.value;
                    if (tone === 'natural' || tone === 'warm' || tone === 'bright' || tone === 'telephone') {
                      const voiceTone: StudioVoiceTone = tone;
                      setStudioOptions(previous => ({ ...previous, voiceTone }));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="natural">{language === 'kr' ? 'Natirèl' : 'Naturelle'}</option>
                  <option value="warm">{language === 'kr' ? 'Cho' : 'Chaleureuse'}</option>
                  <option value="bright">{language === 'kr' ? 'Klè' : 'Claire'}</option>
                  <option value="telephone">{language === 'kr' ? 'Efè telefòn' : 'Effet téléphone'}</option>
                </select>
              </label>

              {([
                {
                  key: 'reverb',
                  label: language === 'kr' ? 'Reverberasyon' : 'Réverbération',
                  hint: language === 'kr' ? 'Sans chanm rive nan gwo legliz' : 'De la petite pièce à la grande église',
                  max: 0.5,
                  step: 0.01,
                },
                {
                  key: 'echo',
                  label: language === 'kr' ? 'Eko' : 'Écho',
                  hint: language === 'kr' ? 'Ajoute repetisyon nan vwa a' : 'Ajoute des répétitions à la voix',
                  max: 0.4,
                  step: 0.01,
                },
              ] as const).map(({ key, label, hint, max, step }) => (
                <label key={key} className="block space-y-1.5">
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>{label}</span>
                    <span className="font-mono text-slate-500">{Math.round(studioOptions[key] / max * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={max}
                    step={step}
                    value={studioOptions[key]}
                    disabled={isProcessingStudioMix}
                    onChange={(event) => setStudioOptions(previous => ({
                      ...previous,
                      [key]: Number(event.target.value),
                    }))}
                    aria-label={label}
                    className="w-full accent-amber-500"
                  />
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2">
              {([
                ['studioVoice', language === 'kr' ? 'Konpresyon vokal — egalize volim lan' : 'Compression vocale — égalise le volume'],
                ['drums', language === 'kr' ? 'Batri' : 'Batterie'],
                ['guitar', language === 'kr' ? 'Gita' : 'Guitare'],
                ['keyboard', language === 'kr' ? 'Klavye' : 'Clavier'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={studioOptions[key]}
                    disabled={isProcessingStudioMix}
                    onChange={(event) => setStudioOptions(previous => ({ ...previous, [key]: event.target.checked }))}
                    className="h-4 w-4 accent-amber-500"
                  />
                  {label}
                </label>
              ))}
            </div>

            {(studioOptions.drums || studioOptions.guitar || studioOptions.keyboard) && (
              <div className="space-y-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                <label className="block space-y-1.5">
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>{language === 'kr' ? 'Vitès rit la' : 'Tempo de l’accompagnement'}</span>
                    <span className="font-mono text-slate-500">{studioOptions.tempo} BPM</span>
                  </span>
                  <input
                    type="range"
                    min="60"
                    max="130"
                    step="1"
                    value={studioOptions.tempo}
                    disabled={isProcessingStudioMix}
                    onChange={(event) => setStudioOptions(previous => ({
                      ...previous,
                      tempo: Number(event.target.value),
                    }))}
                    className="w-full accent-amber-500"
                    aria-label={language === 'kr' ? 'Vitès rit la' : 'Tempo de l’accompagnement'}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>{language === 'kr' ? 'Volim enstriman' : 'Volume des instruments'}</span>
                    <span className="font-mono text-slate-500">{Math.round(studioOptions.accompanimentVolume * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={studioOptions.accompanimentVolume}
                    disabled={isProcessingStudioMix}
                    onChange={(event) => setStudioOptions(previous => ({
                      ...previous,
                      accompanimentVolume: Number(event.target.value),
                    }))}
                    className="w-full accent-amber-500"
                    aria-label={language === 'kr' ? 'Volim enstriman' : 'Volume des instruments'}
                  />
                </label>
              </div>
            )}

            {studioError && (
              <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {studioError}
              </p>
            )}

            <p className="text-[11px] text-slate-400">
              {language === 'kr'
                ? 'Pou pi bon vitès sou telefòn, anrejistreman estidyo limite a 5 minit.'
                : 'Pour un traitement fiable sur téléphone, la durée est limitée à 5 minutes.'}
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStudioRecording(null)}
                disabled={isProcessingStudioMix}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleCreateStudioMix}
                disabled={isProcessingStudioMix || !Object.values(studioOptions).some(Boolean)}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
              >
                <Music2 className="h-4 w-4" />
                {isProcessingStudioMix
                  ? language === 'kr' ? 'N ap trete…' : 'Traitement…'
                  : language === 'kr' ? 'Kreye kopi Studio' : 'Créer la copie studio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename / Note Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0D1C30] rounded-3xl p-5 border border-amber-500/30 text-slate-900 dark:text-white space-y-4">
            <h4 className="font-cinzel font-bold text-base text-amber-400">
              {language === 'kr' ? 'Chanje Non & Nòt' : 'Modifier le Titre & la Note'}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {language === 'kr' ? 'Tit anrejistreman an:' : 'Titre de l\'enregistrement :'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {language === 'kr' ? 'Nòt pèsonèl:' : 'Note personnelle :'}
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={3}
                  placeholder={language === 'kr' ? 'Ekri yon ti nòt...' : 'Ajoutez une note spirituelle...'}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-3.5 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
