import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course } from '../types';
import { AdmissionEnquiryModal } from '../components/AdmissionEnquiryModal';
import { BookOpen, Clock, Users, Calendar, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
  const [showEnquiry, setShowEnquiry] = useState(false);

  useEffect(() => {
    api.getCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEnquire = (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowEnquiry(true);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#080B12] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>AntiGravity IAS Academy Flagship Batches</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Civil Services Preparation Programs
          </h1>

          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Comprehensive foundation modules, Mains answer-writing mentorship test series, and optional subjects guided by eminent faculty and AI mentors.
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            Loading active course batches...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#0E1524] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg hover:border-blue-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="p-5 border-b border-slate-800/60 bg-white/[0.02]">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {course.delivery_mode}
                    </span>
                    <h3 className="text-base font-semibold text-slate-100 mt-2 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span><strong className="text-slate-200">Duration:</strong> {course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span><strong className="text-slate-200">Schedule:</strong> {course.batch_schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span><strong className="text-slate-200">Faculty:</strong> {course.faculty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Fee & CTA */}
                <div className="p-5 bg-white/[0.02] border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Investment Fee</span>
                    <span className="text-lg font-bold text-slate-100">{course.fee}</span>
                  </div>

                  <button
                    onClick={() => handleEnquire(course.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <span>Enrol / Consult</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Scholarship & Free Demo Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AntiGravity All-India Scholarship Test (AIST)</span>
            </div>
            <h3 className="text-lg font-bold">Up to 50% Merit-Based Fee Concession</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Qualify our monthly scholarship assessment to secure merit waivers on Foundation and Mains Mentorship batches. Free demo access provided to all applicants.
            </p>
          </div>

          <button
            onClick={() => setShowEnquiry(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs transition-colors shrink-0 shadow-lg shadow-blue-500/25"
          >
            Claim Scholarship Counseling
          </button>
        </div>

      </div>

      <AdmissionEnquiryModal
        isOpen={showEnquiry}
        onClose={() => setShowEnquiry(false)}
        preselectedCourseId={selectedCourseId}
      />
    </div>
  );
};

export default CoursesPage;
