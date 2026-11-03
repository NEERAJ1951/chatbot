import React, { useState } from 'react';
import { api } from '../services/api';
import { MCQQuestion } from '../types';
import { X, CheckCircle, XCircle, Lightbulb, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

interface MCQPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MCQPracticeModal: React.FC<MCQPracticeModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('Preamble & Fundamental Rights');
  const [subject, setSubject] = useState('Indian Polity');
  const [difficulty, setDifficulty] = useState('UPSC Prelims Standard');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedAnswers({});
    try {
      const data = await api.generateMCQs(topic, subject, 3, difficulty);
      setQuestions(data.mcqs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to generate MCQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, opt: string) => {
    if (selectedAnswers[qIdx]) return; // already answered
    const optionLetter = opt.substring(0, 3); // e.g. "(a)"
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optionLetter }));
  };

  const score = Object.entries(selectedAnswers).filter(([idx, ans]) => {
    const q = questions[Number(idx)];
    return q && q.correct_option.toLowerCase().includes(ans.toLowerCase());
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              🎯
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">Prelims MCQ Practice & Logic Elimination</h2>
              <p className="text-xs text-slate-500">Train statement elimination strategies with UPSC-standard MCQs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Controls */}
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-navy-800"
              >
                <option>Indian Polity</option>
                <option>Modern History</option>
                <option>Indian Economy</option>
                <option>Geography</option>
                <option>Environment & Ecology</option>
                <option>Science & Technology</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Topic Theme</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Basic Structure, Monetary Policy"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-navy-800"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Generate Questions</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          {/* Score Banner when answers attempted */}
          {questions.length > 0 && Object.keys(selectedAnswers).length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-navy-950 text-white text-xs">
              <span className="text-slate-300">Your Current Score:</span>
              <span className="font-bold text-saffron-400 font-mono text-sm">
                {score} / {questions.length} Correct ({Math.round((score / questions.length) * 100)}%)
              </span>
            </div>
          )}

          {/* Question List */}
          {questions.length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500 text-xs">
              Click <strong className="text-slate-800">"Generate Questions"</strong> above to load standard UPSC Prelims MCQs.
            </div>
          )}

          {questions.map((q, qIdx) => {
            const userPick = selectedAnswers[qIdx];
            const isAnswered = !!userPick;
            const isCorrect = isAnswered && q.correct_option.toLowerCase().includes(userPick.toLowerCase());

            return (
              <div key={qIdx} className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                
                {/* Question Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Question {qIdx + 1}
                    </span>
                    {isAnswered && (
                      <span className={`text-[11px] font-semibold flex items-center gap-1 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isCorrect ? 'Correct' : `Incorrect (Correct: ${q.correct_option})`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-navy-950 leading-relaxed">
                    {q.question}
                  </p>
                  
                  {q.statements && q.statements.length > 0 && (
                    <div className="pl-3 space-y-1 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                      {q.statements.map((stmt, sIdx) => (
                        <div key={sIdx}>{stmt}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => {
                    const optLetter = opt.substring(0, 3);
                    const isSelected = userPick === optLetter;
                    const isTheCorrectOne = isAnswered && q.correct_option.toLowerCase().includes(optLetter.toLowerCase());

                    let btnStyle = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';
                    if (isAnswered) {
                      if (isTheCorrectOne) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                      } else if (isSelected && !isTheCorrectOne) {
                        btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(qIdx, opt)}
                        className={`p-2.5 text-left text-xs rounded-lg border transition-all flex items-start gap-2 ${btnStyle}`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Elimination Tip */}
                {isAnswered && (
                  <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <strong className="text-navy-900">Logical Reasoning:</strong> {q.explanation}
                    </div>

                    {q.elimination_tip && (
                      <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-800 font-semibold">Prelims Elimination Strategy:</strong> {q.elimination_tip}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};
