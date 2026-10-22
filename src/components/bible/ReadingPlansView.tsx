import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, ChevronRight, BookOpen, RotateCcw } from 'lucide-react';
import { READING_PLANS } from '../../data/readingPlans';
import { storageService } from '../../services/storageService';
import { Language, ReadingPlan } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface ReadingPlansViewProps {
  onOpenPassage: (bookId: string, chapter: number) => void;
  language: Language;
}

export const ReadingPlansView: React.FC<ReadingPlansViewProps> = ({
  onOpenPassage,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [activePlanId, setActivePlanId] = useState<string>('year');
  const [completedDays, setCompletedDays] = useState<Record<string, number[]>>(() => ({
    year: storageService.getPlanProgress('year'),
    nt90: storageService.getPlanProgress('nt90'),
    psalms_proverbs: storageService.getPlanProgress('psalms_proverbs'),
  }));

  const activePlan = READING_PLANS.find((p) => p.id === activePlanId) || READING_PLANS[0];
  const currentCompleted = completedDays[activePlan.id] || [];
  const percent = Math.round((currentCompleted.length / activePlan.items.length) * 100);

  const toggleDay = (day: number) => {
    const updated = storageService.togglePlanDay(activePlan.id, day);
    setCompletedDays((prev) => ({
      ...prev,
      [activePlan.id]: updated,
    }));
  };

  const resetCurrentPlan = () => {
    if (window.confirm(language === 'kr' ? 'Èske w vle rekòmanse plan sa a a zewo?' : 'Voulez-vous réinitialiser la progression de ce plan ?')) {
      localStorage.removeItem(`jere_kretyen_plan_progress_${activePlan.id}`);
      setCompletedDays((prev) => ({
        ...prev,
        [activePlan.id]: [],
      }));
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-12">
      {/* Plan Header */}
      <div className="bg-gradient-to-br from-[#12263F] via-slate-900 to-[#0A1626] rounded-2xl p-5 text-white shadow-xl border border-amber-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-lg text-amber-300">
              {t.plans.title}
            </h3>
          </div>
          {currentCompleted.length > 0 && (
            <button
              onClick={resetCurrentPlan}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
              title={t.plans.resetPlan}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'kr' ? 'Rekòmanse' : 'Réinitialiser'}</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {language === 'kr' ? activePlan.descKr : activePlan.descFr}
        </p>

        {/* Plan Switcher Pills */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-semibold">
          {READING_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setActivePlanId(plan.id)}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                activePlanId === plan.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {language === 'kr' ? plan.titleKr : plan.titleFr}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-amber-300">{t.plans.progress}</span>
            <span className="text-white font-mono">
              {currentCompleted.length} / {activePlan.items.length} {t.plans.day.toLowerCase()}s ({percent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Days Checklist */}
      <div className="space-y-2.5">
        {activePlan.items.map((item) => {
          const isDone = currentCompleted.includes(item.day);
          const firstPassage = item.passages[0];
          return (
            <div
              key={item.day}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-slate-800 dark:text-slate-200'
                  : 'bg-white dark:bg-[#0D1C30] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-amber-400/50 shadow-sm'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDay(item.day)}
                className="flex items-center gap-3 text-left flex-1"
              >
                <div className="shrink-0 text-amber-500 dark:text-amber-400">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {t.plans.day} {item.day}
                    </span>
                    {isDone && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-semibold">
                        {t.plans.completed}
                      </span>
                    )}
                  </div>
                  <h4
                    className={`text-sm font-semibold mt-0.5 ${
                      isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {language === 'kr' ? item.labelKr : item.labelFr}
                  </h4>
                </div>
              </button>

              {/* Jump to Bible Reader */}
              {firstPassage && (
                <button
                  onClick={() => onOpenPassage(firstPassage.bookId, firstPassage.chapter)}
                  className="shrink-0 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-300 hover:text-slate-950 border border-amber-500/30 transition flex items-center gap-1 text-xs font-bold active:scale-95"
                  title="Lire ce chapitre dans la Bible"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Lire</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
