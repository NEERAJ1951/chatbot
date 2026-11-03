export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  preferred_language: string;
  target_exam_year: number;
  preparation_level: string;
  created_at: string;
}

export interface Citation {
  document_title: string;
  page_number?: number;
  snippet: string;
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  feedback?: 'up' | 'down' | null;
  created_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  fee: string;
  delivery_mode: string;
  batch_schedule: string;
  faculty: string;
  active_status: boolean;
  created_at: string;
}

export interface AdmissionEnquiry {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  course_id?: string;
  message?: string;
  consent_given: boolean;
  status: 'NEW' | 'CONTACTED' | 'COUNSELED' | 'ENROLLED';
  created_at: string;
  course?: Course;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  document_type: string;
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  chunk_count: number;
  uploaded_at: string;
}

export interface AdminAnalytics {
  total_users: number;
  total_conversations: number;
  total_messages: number;
  total_enquiries: number;
  total_documents: number;
  active_courses: number;
  avg_latency_ms: number;
  error_count: number;
}

export interface MainsEvaluationResult {
  score_awarded: number;
  max_marks: number;
  intro_score: string;
  intro_feedback: string;
  body_score: string;
  body_feedback: string;
  conclusion_score: string;
  conclusion_feedback: string;
  overall_strengths: string[];
  critical_improvements: string[];
  model_points_missed: string[];
  syllabus_tag: string;
}

export interface MCQQuestion {
  question: string;
  statements?: string[];
  options: string[];
  correct_option: string;
  explanation: string;
  elimination_tip?: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  plan_data: {
    title: string;
    overview: string;
    daily_routine: Record<string, string>;
    phases: Array<{
      phase_name: string;
      focus_subjects: string[];
      weekly_targets: string[];
    }>;
    high_yield_recommendations: string[];
    resources_recommended: string[];
  };
  start_date: string;
  target_date?: string;
  progress_status: string;
  created_at: string;
}
