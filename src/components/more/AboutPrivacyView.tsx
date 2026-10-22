import React, { useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  Info,
  LockKeyhole,
  Mail,
  Mic,
  Music2,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../../types';

interface AboutPrivacyViewProps {
  language: Language;
  onBack: () => void;
}

type LegalSection = 'about' | 'privacy';

export const AboutPrivacyView: React.FC<AboutPrivacyViewProps> = ({ language, onBack }) => {
  const [section, setSection] = useState<LegalSection>('about');
  const isKr = language === 'kr';

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-950 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isKr ? 'Retounen' : 'Retour'}</span>
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {isKr ? 'Enfòmasyon' : 'Informations'}
        </span>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12263F] via-slate-900 to-[#0A1626] p-6 sm:p-8 text-white border border-amber-500/30 shadow-xl">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
            {section === 'about' ? <Info className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
              Jere Kretyen
            </p>
            <h1 className="mt-1 font-cinzel text-2xl font-bold">
              {section === 'about'
                ? isKr ? 'Konsènan aplikasyon an' : 'À propos'
                : isKr ? 'Konfidansyalite' : 'Confidentialité'}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
              {isKr
                ? 'Yon espas kretyen pou li Labib, chante, aprann epi grandi nan lafwa.'
                : 'Un espace chrétien pour lire la Bible, chanter, apprendre et grandir dans la foi.'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-200/80 p-1 dark:bg-slate-800/80">
        <button
          onClick={() => setSection('about')}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            section === 'about'
              ? 'bg-white text-slate-900 shadow dark:bg-[#12263F] dark:text-amber-300'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <Info className="h-4 w-4" />
          {isKr ? 'Konsènan' : 'À propos'}
        </button>
        <button
          onClick={() => setSection('privacy')}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            section === 'privacy'
              ? 'bg-white text-slate-900 shadow dark:bg-[#12263F] dark:text-amber-300'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          {isKr ? 'Konfidansyalite' : 'Confidentialité'}
        </button>
      </div>

      {section === 'about' ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0D1C30] sm:p-6">
            <h2 className="font-cinzel text-lg font-bold text-slate-900 dark:text-white">
              {isKr ? 'Misyon nou' : 'Notre mission'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {isKr
                ? 'Jere Kretyen rasanble zouti pou lavi espirityèl la: lekti Labib an fransè ak kreyòl ayisyen, kantik, anrejistreman pèsonèl, plan lekti, kesyon biblik ak zouti meditasyon.'
                : 'Jere Kretyen réunit des outils pour la vie spirituelle : lecture de la Bible en français et en créole haïtien, cantiques, enregistrements personnels, plans de lecture, quiz bibliques et outils de méditation.'}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: BookOpen, label: isKr ? 'Labib ak lekti' : 'Bible et lecture' },
                { icon: Music2, label: isKr ? 'Kantik ak lwanj' : 'Cantiques et louange' },
                { icon: Mic, label: isKr ? 'Anrejistreman pèsonèl' : 'Enregistrements personnels' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <Icon className="h-4 w-4 text-amber-500" />
                  {label}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0D1C30] sm:p-6">
            <h2 className="font-cinzel text-lg font-bold text-slate-900 dark:text-white">
              {isKr ? 'Kontak ak kreyatè' : 'Création et contact'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isKr ? 'Pou kesyon, sijesyon oswa sipò :' : 'Pour toute question, suggestion ou demande de soutien :'}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href="mailto:manofthetech22@gmail.com"
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-700 hover:border-amber-400 dark:border-slate-700 dark:text-slate-200"
              >
                <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="truncate">manofthetech22@gmail.com</span>
              </a>
              <a
                href="tel:+50955270304"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-700 hover:border-amber-400 dark:border-slate-700 dark:text-slate-200"
              >
                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                <span>+509 55 27 03 04</span>
              </a>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:p-6">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <LockKeyhole className="h-5 w-5" />
              <h2 className="font-cinzel text-lg font-bold">
                {isKr ? 'Done lokal yo rete sou aparèy ou' : 'Vos données restent sur votre appareil'}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-emerald-900/80 dark:text-emerald-100/80">
              {isKr
                ? 'Nòt, preferans ak anrejistreman vwa pèsonèl ou yo rete sou aparèy la. Anrejistreman yo pa telechaje sou sèvè aplikasyon an. Kantik, anons ak logo administrasyon an ka pataje sou entènèt pou tout moun wè yo.'
                : 'Vos notes, préférences et enregistrements vocaux personnels restent sur votre appareil. Les enregistrements ne sont pas envoyés au serveur. Les cantiques, annonces et le logo publiés par l’administration sont partagés en ligne pour tous les utilisateurs.'}
            </p>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0D1C30] sm:p-6">
            <PrivacyItem
              title={isKr ? 'Mikwo a' : 'Microphone'}
              text={isKr
                ? 'Aplikasyon an mande aksè ak mikwo a sèlman lè ou chwazi anrejistre. Navigatè a ka mande pèmisyon.'
                : 'L’accès au microphone n’est sollicité que lorsque vous choisissez d’enregistrer. Le navigateur peut demander votre autorisation.'}
            />
            <PrivacyItem
              title={isKr ? 'Depo lokal' : 'Stockage local'}
              text={isKr
                ? 'Navigatè a estoke done pèsonèl aplikasyon an lokalman. Efase done navigatè a oswa itilize « Efase tout done » nan Paramèt pou retire yo. Sa pa retire kontni administrasyon an pataje.'
                : 'Le navigateur conserve localement vos données personnelles. Effacez les données du navigateur ou utilisez « Effacer toutes les données » dans les paramètres. Cette action ne supprime pas le contenu partagé par l’administration.'}
            />
            <PrivacyItem
              title={isKr ? 'Done administrasyon an' : 'Données d’administration'}
              text={isKr
                ? 'Kont administratè yo sèvi ak Supabase pou koneksyon (adrès imel ak verifikasyon kont). Sèvis sa a estoke kontni piblik administrasyon an (kantik, anons, logo) ak jounal aksyon teknik ki gen lè, kalite aksyon ak kèk kantite sèlman. Rapò yo limite ak aksyon administratè yo; yo pa gen done pèsonèl itilizatè ni anrejistreman.'
                : 'Les comptes réservés aux administrateurs utilisent Supabase pour l’authentification (adresse e-mail et vérification du compte). Ce service héberge les contenus publiés (cantiques, annonces, logo) et un historique technique contenant la date, le type d’action et quelques compteurs. Les rapports sont limités aux opérations d’administration : ils ne contiennent ni données personnelles d’utilisateurs ni enregistrements audio.'}
            />
            <PrivacyItem
              title={isKr ? 'Koneksyon ekstèn' : 'Services externes'}
              text={isKr
                ? 'Polis ekriti Google Fonts ka chaje depi Google lè ou konekte ak entènèt. Founisè sa a ka resevwa done teknik nòmal koneksyon an.'
                : 'Les polices Google Fonts peuvent être chargées depuis Google lorsque vous êtes en ligne. Ce fournisseur peut recevoir les données techniques habituelles de connexion.'}
            />
            <PrivacyItem
              title={isKr ? 'Pataj done ak lòt moun' : 'Partage et suivi'}
              text={isKr
                ? 'Pa gen kont piblik pou itilizatè, piblisite ni zouti analiz odyans. Kont yo rezève pou administratè. Lè ou pataje yon kantik, se yon aksyon ou chwazi.'
                : 'Aucun compte public n’est proposé aux utilisateurs; les comptes sont réservés aux administrateurs. L’application n’intègre ni publicité ni outil de mesure d’audience. Le partage d’un cantique reste une action que vous déclenchez.'}
            />
            <PrivacyItem
              title={isKr ? 'Kontakte nou' : 'Nous contacter'}
              text={isKr
                ? 'Pou kestyon sou konfidansyalite, kontakte kreyatè a nan manofthetech22@gmail.com.'
                : 'Pour toute question relative à la confidentialité, contactez le créateur à manofthetech22@gmail.com.'}
            />
          </section>

          <p className="px-2 text-[11px] leading-relaxed text-slate-400">
            {isKr
              ? 'Enfòmasyon sa a dekri sèvis ak depo aplikasyon an kounye a. Ou ka kontakte kreyatè a pou kestyon oswa demann sou done yo.'
              : 'Cette notice décrit les services et stockages actuellement utilisés par l’application. Vous pouvez contacter le créateur pour toute question ou demande relative aux données.'}
          </p>
        </>
      )}
    </div>
  );
};

const PrivacyItem: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
  </div>
);
