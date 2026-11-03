import React, { useState } from 'react';
import { api } from '../services/api';
import { StudyPlan } from '../types';
import { X, Calendar, Clock, BookOpen, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface StudyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated?: (plan: StudyPlan) => void;
}

export const StudyPlannerModal: React.FC<StudyPlannerModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [level, setLevel] = useState('Beginner');
  const [year, setYear] = useState<number>(2026);
  const [hours, setHours] = useState<number>(6);
  const [optional, setOptional] = useState('Public Administration');
  const [lang, setLang] = useState('English');
  const [strong, setStrong] = useState('Polity, Modern History');
  const [weak, setWeak] = useState('Economy, Environment');
  const [duration, setDuration] = useState<number>(90);

  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const plan = await api.generateStudyPlan({
        preparation_level: level,
        target_exam_year: year,
        daily_available_hours: hours,
        optional_subject: optional,
        preferred_language: lang,
        strong_subjects: strong.split(',').map(s => s.trim()).filter(Boolean),
        weak_subjects: weak.split(',').map(s => s.trim()).filter(Boolean),
        duration_days: duration,
      });
      setGeneratedPlan(plan);
      if (onPlanCreated) onPlanCreated(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              📅
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">Personalized UPSC Study Planner</h2>
              <p className="text-xs text-slate-500">Diagnostic-driven 90-day preparation roadmap tailored to your target year</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Questionnaire Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preparation Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                >
                  <option>Beginner (Starting NCERTs)</option>
                  <option>Intermediate (1st syllabus read done)</option>
                  <option>Advanced (Multiple revisions & test series)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Study Hours</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                >
                  <option value={4}>4 Hours (Working Professional)</option>
                  <option value={6}>6 Hours (Balanced)</option>
                  <option value={8}>8 Hours (Full-Time Aspirant)</option>
                  <option value={10}>10+ Hours (Intensive Bootcamp)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Subject</label>
                <select
                  value={optional}
                  onChange={(e) => setOptional(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                >
                  <option>Public Administration</option>
                  <option>Political Science & IR (PSIR)</option>
                  <option>Sociology</option>
                  <option>Geography</option>
                  <option>History</option>
                  <option>Anthropology</option>
                  <option>Economics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Hinglish</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Strong Subjects</label>
                <input
                  type="text"
                  value={strong}
                  onChange={(e) => setStrong(e.target.value)}
                  placeholder="e.g. Polity, Modern History"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weak / High Focus Subjects</label>
                <input
                  type="text"
                  value={weak}
                  onChange={(e) => setWeak(e.target.value)}
                  placeholder="e.g. Economy, Environment"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all shadow-xs flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Strategy...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Personalized 90-Day Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          {/* Generated Plan Details */}
          {generatedPlan && (
            <div className="pt-6 border-t border-slate-200 space-y-6 animate-in fade-in duration-300">
              
              {/* Header card */}
              <div className="p-4 rounded-xl bg-navy-950 text-white space-y-1">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  Verified Strategy Roadmap
                </span>
                <h3 className="text-lg font-bold font-serif">{generatedPlan.title}</h3>
                <p className="text-xs text-slate-300">{generatedPlan.plan_data.overview}</p>
              </div>

              {/* Daily Schedule Slots */}
              {generatedPlan.plan_data.daily_routine && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Recommended Daily Study Blocks ({hours} Hours)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(generatedPlan.plan_data.daily_routine).map(([slot, task], i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-semibold text-navy-900 block capitalize">{slot}</span>
                        <span className="text-slate-600 text-[11px] mt-0.5 block">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3 Phases Breakdown */}
              {generatedPlan.plan_data.phases && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>3-Phase Preparation Trajectory</span>
                  </div>

                  <div className="space-y-3">
                    {generatedPlan.plan_data.phases.map((phase, pIdx) => (
                      <div key={pIdx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy-950">{phase.phase_name}</span>
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                            {phase.focus_subjects.join(' • ')}
                          </span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                          {phase.weekly_targets.map((tgt, tIdx) => (
                            <li key={tIdx}>{tgt}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
