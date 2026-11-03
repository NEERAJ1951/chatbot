import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  AdminAnalytics, KnowledgeDocument, AdmissionEnquiry, Course 
} from '../types';
import { 
  Shield, Users, MessageSquare, Database, PhoneCall, 
  Upload, Trash2, CheckCircle2, Clock, Plus, AlertCircle, Loader2 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'documents' | 'enquiries' | 'courses'>('analytics');

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Course State
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    duration: '12 Months',
    fee: '₹ 85,000',
    delivery_mode: 'Hybrid',
    batch_schedule: 'Morning: 8:00 AM - 11:30 AM',
    faculty: 'Eminent Senior Faculty',
  });

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsData, docsData, enquiriesData, coursesData] = await Promise.all([
        api.getAdminAnalytics().catch(() => null),
        api.getAdminDocuments().catch(() => []),
        api.getAdminEnquiries().catch(() => []),
        api.getCourses().catch(() => []),
      ]);
      setAnalytics(analyticsData);
      setDocuments(docsData);
      setEnquiries(enquiriesData);
      setCourses(coursesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const doc = await api.uploadAdminDocument(uploadFile, uploadTitle || uploadFile.name);
      setDocuments(prev => [doc, ...prev]);
      setUploadMsg({ type: 'success', text: `Document '${doc.title}' successfully parsed, chunked, and embedded into RAG vector repository!` });
      setUploadFile(null);
      setUploadTitle('');
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to remove this document and all vector chunks from RAG?')) return;
    try {
      await api.deleteAdminDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEnquiry = async (id: string, status: string) => {
    try {
      const updated = await api.updateEnquiryStatus(id, status);
      setEnquiries(prev => prev.map(e => e.id === id ? updated : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createCourse(courseForm);
      setCourses(prev => [...prev, created]);
      setShowAddCourse(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Deactivate this course?')) return;
    try {
      await api.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-[#080B12] text-slate-100">
        <div className="bg-[#0E1524] p-8 rounded-2xl border border-slate-800 text-center max-w-md shadow-xl space-y-3">
          <Shield className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-100">Administrative Access Required</h2>
          <p className="text-xs text-slate-400">
            This portal is restricted to AntiGravity IAS Academy directors and academic counselors.
          </p>
          <div className="p-3 rounded-lg bg-white/[0.03] border border-slate-800 text-xs text-slate-300 font-mono">
            Admin Demo: admin@antigravityias.com / Admin@123456
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#080B12] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-saffron-100 text-saffron-700">
                <Shield className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-serif font-bold text-navy-950">
                AntiGravity Academic Administration
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              RAG Knowledge Repository, Student Leads, Course Master, and AI Performance Telemetry
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-white text-navy-950 shadow-xs' : 'text-slate-600 hover:text-navy-950'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'documents' ? 'bg-white text-navy-950 shadow-xs' : 'text-slate-600 hover:text-navy-950'}`}
            >
              RAG Ingestion ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'enquiries' ? 'bg-white text-navy-950 shadow-xs' : 'text-slate-600 hover:text-navy-950'}`}
            >
              Student Leads ({enquiries.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'courses' ? 'bg-white text-navy-950 shadow-xs' : 'text-slate-600 hover:text-navy-950'}`}
            >
              Course Batches ({courses.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Analytics KPI */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Registered Aspirants</div>
                <div className="text-2xl font-bold font-serif text-navy-950 mt-1">{analytics.total_users}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Sessions</div>
                <div className="text-2xl font-bold font-serif text-navy-950 mt-1">{analytics.total_conversations}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">AI Exchanges</div>
                <div className="text-2xl font-bold font-serif text-navy-950 mt-1">{analytics.total_messages}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Admission Enquiries</div>
                <div className="text-2xl font-bold font-serif text-saffron-600 mt-1">{analytics.total_enquiries}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Vector Documents</div>
                <div className="text-2xl font-bold font-serif text-emerald-600 mt-1">{analytics.total_documents}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Avg AI Latency</div>
                <div className="text-2xl font-bold font-serif text-sky-600 mt-1">{analytics.avg_latency_ms} ms</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-navy-950 text-white border border-navy-800 space-y-2">
              <h3 className="font-serif font-bold text-base text-saffron-400">RAG Grounding & AI Telemetry Architecture</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                The platform utilizes a hybrid vector retrieval pipeline combining PyMuPDF document extraction, recursive semantic chunking (600 chars with 100 char overlap), and vector cosine similarity scoring. Prompts are sanitized with regex-based guardrails to prevent instruction injection.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: RAG Ingestion & Document Processing */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            
            {/* Upload Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-saffron-600" />
                <h3 className="text-sm font-bold text-navy-950">Ingest Official Document into RAG Knowledge Base</h3>
              </div>

              {uploadMsg && (
                <div className={`p-3 rounded-lg text-xs border ${uploadMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                  {uploadMsg.text}
                </div>
              )}

              <form onSubmit={handleFileUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Document Display Title (e.g. UPSC Prelims Scheme 2026, 2nd ARC Summary)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-navy-800"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.txt,.md"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-navy-900 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="px-5 py-2 bg-navy-950 hover:bg-navy-900 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing, Chunking & Embedding Vectors...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-saffron-400" />
                        <span>Ingest & Vectorize Document</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Document List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 font-bold text-xs text-navy-950 uppercase tracking-wider">
                Ingested Knowledge Documents ({documents.length})
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-6">Document Title</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Chunks Embedded</th>
                      <th className="py-3 px-4">Vector Status</th>
                      <th className="py-3 px-4">Uploaded</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-semibold text-navy-950">{doc.title}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{doc.document_type}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-saffron-600 font-semibold">{doc.chunk_count} chunks</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            doc.processing_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {doc.processing_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                        <td className="py-3 px-6 text-right">
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Remove Document from RAG"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Student Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-xs text-navy-950 uppercase tracking-wider">
              Student Admission Leads & Counsellor Callbacks ({enquiries.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Specific Query</th>
                    <th className="py-3 px-4">Lead Status</th>
                    <th className="py-3 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-6 font-semibold text-navy-950">{enq.student_name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">{enq.phone}</td>
                      <td className="py-3 px-4 text-slate-600">{enq.email}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{enq.message || 'General Counselling'}</td>
                      <td className="py-3 px-4">
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateEnquiry(enq.id, e.target.value)}
                          className="text-xs px-2 py-0.5 border border-slate-300 rounded bg-white font-medium"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="COUNSELED">COUNSELED</option>
                          <option value="ENROLLED">ENROLLED</option>
                        </select>
                      </td>
                      <td className="py-3 px-6 text-slate-500 text-[11px]">{new Date(enq.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Courses Management */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Course Master</span>
              <button
                onClick={() => setShowAddCourse(!showAddCourse)}
                className="px-3 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Course</span>
              </button>
            </div>

            {showAddCourse && (
              <form onSubmit={handleCreateCourse} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-navy-950 uppercase">Create New Batch Program</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g. GS Prelims Fast-Track Crash Course"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Fee</label>
                    <input
                      type="text"
                      required
                      value={courseForm.fee}
                      onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })}
                      placeholder="e.g. ₹ 25,000"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Batch Schedule</label>
                    <input
                      type="text"
                      value={courseForm.batch_schedule}
                      onChange={(e) => setCourseForm({ ...courseForm, batch_schedule: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      required
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddCourse(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-navy-950 text-white rounded-md text-xs font-semibold">Save Course</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => (
                <div key={c.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-navy-950">{c.title}</h4>
                      <span className="font-serif font-bold text-saffron-600 text-xs">{c.fee}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>{c.duration} • {c.delivery_mode}</span>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
