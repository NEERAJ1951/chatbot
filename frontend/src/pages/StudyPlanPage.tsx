import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StudyPlan } from '../types';
import { StudyPlannerModal } from '../components/StudyPlannerModal';
import { Calendar, Plus, Clock, BookOpen } from 'lucide-react';

export const StudyPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getStudyPlans();
      setPlans(data);
      if (data.length > 0 && !activePlan) {
        setActivePlan(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (planId: string, newStatus: string) => {
    try {
      const updated = await api.updateStudyPlan(planId, { progress_status: newStatus });
      setPlans(prev => prev.map(p => p.id === planId ? updated : p));
      if (activePlan?.id === planId) setActivePlan(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#080B12] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Personalized UPSC Study Plans
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Diagnostic roadmaps with daily study blocks and phased syllabus completion
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Plan</span>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            Loading study roadmaps...
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-[#0E1524] rounded-2xl p-10 border border-slate-800 text-center space-y-3 shadow-xl">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full flex items-center justify-center mx-auto text-xl">
              📅
            </div>
            <h3 className="text-base font-semibold text-slate-100">No Study Plans Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Answer 5 quick diagnostic questions about your daily hours, target year, and optional subject to create your custom UPSC preparation schedule.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20"
            >
              Start Diagnostic Questionnaire
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Plans List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block px-1">
                Your Saved Plans ({plans.length})
              </span>

              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActivePlan(p)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activePlan?.id === p.id
                      ? 'bg-[#101725] border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-[#0E1524] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                      {p.title}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.progress_status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {p.progress_status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Created: {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Active Plan Details */}
            {activePlan && (
              <div className="lg:col-span-2 space-y-6 bg-[#0E1524] p-6 rounded-2xl border border-slate-800 shadow-xl">
                
                {/* Active Plan Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">{activePlan.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{activePlan.plan_data.overview}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={activePlan.progress_status}
                      onChange={(e) => handleStatusChange(activePlan.id, e.target.value)}
                      className="text-xs px-2.5 py-1 border border-slate-700 rounded-lg bg-[#101725] text-slate-200 font-medium focus:outline-none"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Daily Routine Slots */}
                {activePlan.plan_data.daily_routine && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Daily Study Schedule Blocks</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(activePlan.plan_data.daily_routine).map(([slot, task], idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-slate-800/80">
                          <span className="font-semibold text-slate-200 block capitalize">{slot}</span>
                          <span className="text-slate-400 text-[11px] mt-0.5 block">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3-Phase Roadmap */}
                {activePlan.plan_data.phases && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Syllabus Completion Phases</span>
                    </div>

                    <div className="space-y-3">
                      {activePlan.plan_data.phases.map((ph, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-800/80 bg-white/[0.02] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-100">{ph.phase_name}</span>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-medium">
                              {ph.focus_subjects.join(' • ')}
                            </span>
                          </div>
                          <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
                            {ph.weekly_targets.map((tgt, tIdx) => (
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
        )}

      </div>

      <StudyPlannerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPlanCreated={(newPlan) => {
          setPlans(prev => [newPlan, ...prev]);
          setActivePlan(newPlan);
        }}
      />
    </div>
  );
};

export default StudyPlanPage;
