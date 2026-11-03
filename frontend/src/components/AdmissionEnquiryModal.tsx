import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course, AdmissionEnquiry } from '../types';
import { X, CheckCircle, ShieldCheck, PhoneCall, Loader2, Send } from 'lucide-react';

interface AdmissionEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCourseId?: string;
}

export const AdmissionEnquiryModal: React.FC<AdmissionEnquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedCourseId,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [courseId, setCourseId] = useState(preselectedCourseId || '');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCourses().then(setCourses).catch(console.error);
      if (preselectedCourseId) setCourseId(preselectedCourseId);
    }
  }, [isOpen, preselectedCourseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Please provide consent to allow an academic counselor to contact you.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitEnquiry({
        student_name: name,
        email,
        phone,
        course_id: courseId || undefined,
        message,
        consent_given: consent,
      });
      setSubmittedEnquiry(res);
    } catch (err: any) {
      setError(err.message || 'Failed to submit enquiry. Please verify your contact details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedEnquiry(null);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setConsent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              🏛️
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">Academic Counsellor Callback</h2>
              <p className="text-xs text-slate-500">Schedule a 1-on-1 batch counseling & scholarship consultation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedEnquiry ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-navy-950">Counsellor Callback Scheduled!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong className="text-navy-900">{submittedEnquiry.student_name}</strong>. An AntiGravity IAS senior academic counselor will call you within 2 business hours.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-1 text-slate-700">
                <div><strong>Enquiry Reference:</strong> <span className="font-mono text-saffron-600">{submittedEnquiry.id.slice(0, 8)}</span></div>
                <div><strong>Direct Admission Helpline:</strong> +91-98765-43210</div>
                <div><strong>Email:</strong> admissions@antigravityias.com</div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-navy-950 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aspirant@gmail.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course of Interest</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                >
                  <option value="">-- General UPSC Counselling --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.fee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Questions / Specific Goals (Optional)</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about scholarship test, offline center visit, demo class..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="consent_check"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-saffron-600 focus:ring-saffron-500"
                  required
                />
                <label htmlFor="consent_check" className="text-[11px] text-slate-600 leading-tight">
                  I give explicit consent for an AntiGravity IAS academic counsellor to call or message me regarding course admissions, fee structures, and scholarship options.
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
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
                  className="px-5 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Request Callback</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
