import React, { useState } from 'react';
import { api } from '../services/api';
import { MainsEvaluationResult } from '../types';
import { X, Award, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface MainsEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MainsEvaluatorModal: React.FC<MainsEvaluatorModalProps> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState('Discuss the discretionary powers of the Governor under Article 163 of the Constitution of India. How has judicial interpretation shaped these powers?');
  const [answer, setAnswer] = useState('Under Article 163, the Governor has discretionary powers except where the Constitution requires aid and advice. The Supreme Court in Nabam Rebia (2016) and Shamsher Singh cases held that discretionary powers are limited to constitutional exceptions and not wide arbitrariness. The Sarkaria Commission also recommended that Article 356 and discretionary actions be used sparingly.');
  const [marks, setMarks] = useState<number>(15);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MainsEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const evalResult = await api.evaluateMains(question, answer, marks);
      setResult(evalResult);
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Please try again.');
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
            <div className="w-8 h-8 rounded-lg bg-saffron-100 text-saffron-700 flex items-center justify-center font-bold">
              📝
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">Mains Answer Writing Evaluator</h2>
              <p className="text-xs text-slate-500">Graded against UPSC 3-Tier Rubric: Intro (20%), Body (70%), Conclusion (10%)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Input Form */}
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPSC Mains Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Paste Mains question..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marks
                </label>
                <select
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                >
                  <option value={10}>10 Marks (150 words)</option>
                  <option value={15}>15 Marks (250 words)</option>
                  <option value={20}>20 Marks (300 words)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Written Answer
              </label>
              <textarea
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type or paste your answer draft here..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800 font-sans"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-saffron-600 hover:bg-saffron-700 text-white rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Answer...</span>
                  </>
                ) : (
                  <>
                    <span>Evaluate with AI Rubric</span>
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

          {/* Results Display */}
          {result && (
            <div className="pt-6 border-t border-slate-200 space-y-5 animate-in fade-in duration-300">
              
              {/* Score Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-navy-950 to-navy-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-saffron-300 uppercase tracking-wider">
                    {result.syllabus_tag || 'UPSC Mains GS Evaluation'}
                  </span>
                  <h3 className="text-xl font-bold font-serif mt-0.5">
                    Score Awarded: <span className="text-saffron-400">{result.score_awarded}</span> / {result.max_marks}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-saffron-600/30 text-saffron-200 text-xs font-semibold border border-saffron-500/40">
                    {((result.score_awarded / result.max_marks) * 100).toFixed(0)}% Benchmark
                  </span>
                </div>
              </div>

              {/* Rubric Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>1. Introduction (20%)</span>
                    <span className="text-saffron-600 font-mono">{result.intro_score}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{result.intro_feedback}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>2. Body PESTEL (70%)</span>
                    <span className="text-saffron-600 font-mono">{result.body_score}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{result.body_feedback}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>3. Way Forward (10%)</span>
                    <span className="text-saffron-600 font-mono">{result.conclusion_score}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{result.conclusion_feedback}</p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Key Strengths</span>
                  </div>
                  <ul className="text-[11px] text-emerald-900 space-y-1 list-disc list-inside">
                    {result.overall_strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Critical Improvements & Value Additions</span>
                  </div>
                  <ul className="text-[11px] text-amber-900 space-y-1 list-disc list-inside">
                    {result.critical_improvements.map((ci, i) => (
                      <li key={i}>{ci}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
