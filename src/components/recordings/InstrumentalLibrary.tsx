import React, { FormEvent, useEffect, useState } from 'react';
import { ExternalLink, Headphones, LoaderCircle, Music2, Search } from 'lucide-react';
import { Language } from '../../types';

interface CommonsTrack {
  id: number;
  title: string;
  audioUrl: string;
  sourceUrl: string;
  artist: string;
  license: string;
  licenseUrl: string;
  description: string;
}

interface CommonsPage {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    url?: string;
    descriptionurl?: string;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
}

const cleanMetadata = (value?: string): string =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isReusableLicense = (license: string): boolean =>
  /^(CC0|Public domain|CC BY(?:-SA)?(?:\s|$))/i.test(license.trim());

async function searchCommonsTracks(query: string, signal: AbortSignal): Promise<CommonsTrack[]> {
  const parameters = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:audio ${query}`,
    gsrnamespace: '6',
    gsrlimit: '30',
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    format: 'json',
    origin: '*',
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${parameters}`, { signal });
  if (!response.ok) {
    throw new Error(`Wikimedia Commons a répondu avec le statut ${response.status}.`);
  }
  const data: { query?: { pages?: Record<string, CommonsPage> } } = await response.json();
  const pages = Object.values(data.query?.pages ?? {});

  return pages.flatMap((page) => {
    const info = page.imageinfo?.[0];
    const metadata = info?.extmetadata;
    const license = cleanMetadata(metadata?.LicenseShortName?.value);
    const audioUrl = info?.url;
    const sourceUrl = info?.descriptionurl;
    if (!info?.mime?.startsWith('audio/') || !audioUrl || !sourceUrl ||
      !license || !metadata?.LicenseUrl?.value || !isReusableLicense(license)) {
      return [];
    }

    const description = cleanMetadata(metadata.ImageDescription?.value);
    const categories = cleanMetadata(metadata.Categories?.value);
    if (!/instrument|piano cover|guitar cover|keyboard cover/i.test(
      `${page.title} ${description} ${categories}`
    )) {
      return [];
    }
    return [{
      id: page.pageid,
      title: cleanMetadata(metadata.ObjectName?.value) || page.title.replace(/^File:/, ''),
      audioUrl,
      sourceUrl,
      artist: cleanMetadata(metadata.Artist?.value || metadata.Credit?.value) || 'Auteur indiqué sur Commons',
      license,
      licenseUrl: metadata.LicenseUrl.value,
      description,
    }];
  });
}

const SEARCH_PRESETS = [
  { fr: 'Gospel', kr: 'Levanjil', query: 'gospel instrumental' },
  { fr: 'Louange', kr: 'Lwanj', query: 'worship instrumental' },
  { fr: 'Piano', kr: 'Pyano', query: 'piano hymn instrumental' },
  { fr: 'Guitare', kr: 'Gita', query: 'guitar hymn instrumental' },
];

export const InstrumentalLibrary: React.FC<{ language: Language }> = ({ language }) => {
  const [searchText, setSearchText] = useState('gospel instrumental');
  const [query, setQuery] = useState('gospel instrumental');
  const [tracks, setTracks] = useState<CommonsTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presetIndex, setPresetIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void searchCommonsTracks(query, controller.signal)
        .then(setTracks)
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return;
          setTracks([]);
          setError(cause instanceof Error
            ? cause.message
            : 'Impossible de charger les instrumentales. Vérifiez votre connexion Internet.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchText.trim();
    if (nextQuery) setQuery(nextQuery);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#12263F] via-slate-900 to-[#0A1626] p-5 text-white shadow-xl">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-amber-500/20 p-2 text-amber-300">
          <Headphones className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-amber-200">
            {language === 'kr' ? 'Enstrimantal sou entènèt' : 'Instrumentales en ligne'}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            {language === 'kr'
              ? 'Chèche mizik sou Wikimedia Commons. Tande mizik yo ak lisans ak kredi yo.'
              : 'Explorez le catalogue Wikimedia Commons. Chaque piste affiche sa licence et ses crédits.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEARCH_PRESETS.map((preset) => (
          <button
            key={preset.query}
            type="button"
            onClick={() => {
              setSearchText(preset.query);
              setQuery(preset.query);
              setPresetIndex(SEARCH_PRESETS.indexOf(preset));
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              query === preset.query
                ? 'border-amber-300 bg-amber-400 text-slate-950'
                : 'border-white/15 bg-white/5 text-slate-200 hover:border-amber-300/70'
            }`}
          >
            {language === 'kr' ? preset.kr : preset.fr}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const nextIndex = (presetIndex + 1) % SEARCH_PRESETS.length;
            const nextPreset = SEARCH_PRESETS[nextIndex];
            setPresetIndex(nextIndex);
            setSearchText(nextPreset.query);
            setQuery(nextPreset.query);
          }}
          className="rounded-full border border-amber-300/40 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
        >
          {language === 'kr' ? 'Lòt estil' : 'Autres pistes'}
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <label className="sr-only" htmlFor="instrumental-search">
          {language === 'kr' ? 'Chèche estil mizik' : 'Rechercher un style musical'}
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/15 bg-slate-950/50 px-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            id="instrumental-search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={language === 'kr' ? 'Gospel, pyano, gita…' : 'Gospel, piano, guitare…'}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
        >
          {language === 'kr' ? 'Chèche' : 'Chercher'}
        </button>
      </form>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-300" role="status">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {language === 'kr' ? 'Ap chèche mizik…' : 'Recherche de pistes…'}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-950/40 p-3 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && tracks.length === 0 && (
        <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">
          {language === 'kr'
            ? 'Pa gen mizik ki gen lisans klè nan rechèch sa a. Eseye yon lòt mo.'
            : 'Aucune piste avec une licence vérifiable pour cette recherche. Essayez un autre terme.'}
        </p>
      )}

      {!loading && tracks.length > 0 && (
        <div className="space-y-3">
          {tracks.slice(0, 8).map((track) => (
            <article key={track.id} className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <div className="mb-2 flex items-start gap-2">
                <Music2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <div className="min-w-0 flex-1">
                  <h4 className="break-words text-sm font-bold text-white">{track.title}</h4>
                  <p className="mt-0.5 break-words text-xs text-slate-300">{track.artist}</p>
                </div>
                <a
                  href={track.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-1 text-slate-300 hover:text-amber-300"
                  aria-label={language === 'kr' ? 'Louvri sous ak kredi yo' : 'Ouvrir la source et les crédits'}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <audio controls preload="none" src={track.audioUrl} className="h-10 w-full">
                {language === 'kr'
                  ? 'Navigatè sa a pa sipòte lekti odyo.'
                  : 'Votre navigateur ne prend pas en charge la lecture audio.'}
              </audio>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                {track.description && <>{track.description} · </>}
                {language === 'kr' ? 'Lisans' : 'Licence'}:{' '}
                <a href={track.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-amber-400/60 underline-offset-2 hover:text-amber-200">
                  {track.license}
                </a>
                {' · '}
                {language === 'kr' ? 'Kredi' : 'Crédit'}: {track.artist}
              </p>
            </article>
          ))}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-slate-400">
        {language === 'kr'
          ? 'Katalòg la bezwen entènèt. Pistes yo rete sou Commons; aplikasyon an pa telechaje ni repibliye fichye yo.'
          : 'Connexion Internet requise. Les fichiers restent hébergés sur Commons; l’application ne les redistribue pas.'}
      </p>
    </section>
  );
};
