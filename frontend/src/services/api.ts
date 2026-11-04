import {
  User, Conversation, Message, Course, AdmissionEnquiry,
  KnowledgeDocument, AdminAnalytics, MainsEvaluationResult,
  MCQQuestion, StudyPlan, Citation
} from '../types';

// Configurable API base: supports production external backend via VITE_API_URL or local proxy via /api
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, '')}/api`
  : '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('upsc_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    preferred_language?: string;
    target_exam_year?: number;
    preparation_level?: string;
  }): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getProfile(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async createConversation(title?: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title: title || 'New UPSC Conversation' }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  },

  async getConversationDetail(id: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load conversation');
    return res.json();
  },

  async renameConversation(id: string, title: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to rename conversation');
    return res.json();
  },

  async deleteConversation(id: string): Promise<void> {
    await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  async submitMessageFeedback(conversationId: string, messageId: string, feedback: 'up' | 'down'): Promise<void> {
    await fetch(`${API_BASE}/conversations/${conversationId}/messages/${messageId}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ feedback }),
    });
  },

  // Chat Streaming via SSE
  async streamChat(
    params: {
      message: string;
      conversation_id?: string;
      subject_filter?: string;
      language_override?: string;
      use_rag?: boolean;
    },
    onToken: (token: string) => void,
    onCitations: (citations: Citation[]) => void,
    onDone: (data: { conversation_id?: string; message_id?: string }) => void,
    onError: (err: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
        signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      if (!res.body) throw new Error('ReadableStream not supported');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace('event:', '').trim();
          } else if (trimmed.startsWith('data:')) {
            const rawData = trimmed.replace('data:', '').trim();
            try {
              const parsed = JSON.parse(rawData);
              if (currentEvent === 'token' && parsed.text) {
                onToken(parsed.text);
              } else if (currentEvent === 'citations') {
                onCitations(parsed);
              } else if (currentEvent === 'done') {
                onDone(parsed);
              } else if (currentEvent === 'error') {
                onError(parsed.error || 'Chat stream error');
              }
            } catch (e) {
              // Plain text fallback
              if (currentEvent === 'token') onToken(rawData);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        onError(err.message || 'Error communicating with UPSC Mentor AI');
      }
    }
  },

  // Non-streaming Chat Completion
  async sendChat(params: {
    message: string;
    conversation_id?: string;
    subject_filter?: string;
    language_override?: string;
    use_rag?: boolean;
  }): Promise<{ response: string; citations: Citation[]; conversation_id?: string }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Chat request failed' }));
      throw new Error(err.detail || 'Chat request failed');
    }
    return res.json();
  },

  // Mains Evaluation
  async evaluateMains(question: string, user_answer: string, marks = 15): Promise<MainsEvaluationResult> {
    const res = await fetch(`${API_BASE}/chat/evaluate-mains`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question, user_answer, marks }),
    });
    if (!res.ok) throw new Error('Evaluation failed');
    return res.json();
  },

  // MCQ Generation
  async generateMCQs(topic: string, subject = 'General Studies', count = 4, difficulty = 'Moderate'): Promise<{ mcqs: MCQQuestion[] }> {
    const res = await fetch(`${API_BASE}/chat/generate-mcqs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ topic, subject, count, difficulty }),
    });
    if (!res.ok) throw new Error('Failed to generate MCQs');
    return res.json();
  },

  // Study Plans
  async generateStudyPlan(params: {
    preparation_level: string;
    target_exam_year: number;
    daily_available_hours: number;
    optional_subject: string;
    preferred_language: string;
    strong_subjects: string[];
    weak_subjects: string[];
    duration_days: number;
  }): Promise<StudyPlan> {
    const res = await fetch(`${API_BASE}/study-plans/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Study plan generation failed');
    return res.json();
  },

  async getStudyPlans(): Promise<StudyPlan[]> {
    const res = await fetch(`${API_BASE}/study-plans`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async updateStudyPlan(planId: string, data: { progress_status?: string; title?: string }): Promise<StudyPlan> {
    const res = await fetch(`${API_BASE}/study-plans/${planId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update study plan');
    return res.json();
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE}/courses`);
    if (!res.ok) return [];
    return res.json();
  },

  // Admissions & Counsellor
  async submitEnquiry(data: {
    student_name: string;
    email: string;
    phone: string;
    course_id?: string;
    message?: string;
    consent_given: boolean;
  }): Promise<AdmissionEnquiry> {
    const res = await fetch(`${API_BASE}/admissions/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit enquiry' }));
      throw new Error(err.detail || 'Failed to submit enquiry');
    }
    return res.json();
  },

  // Admin APIs
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getAdminDocuments(): Promise<KnowledgeDocument[]> {
    const res = await fetch(`${API_BASE}/admin/documents`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async uploadAdminDocument(file: File, title?: string): Promise<KnowledgeDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const token = localStorage.getItem('upsc_auth_token');
    const res = await fetch(`${API_BASE}/admin/documents`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload and process document');
    return res.json();
  },

  async deleteAdminDocument(id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  async getAdminEnquiries(): Promise<AdmissionEnquiry[]> {
    const res = await fetch(`${API_BASE}/admin/enquiries`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async updateEnquiryStatus(enquiryId: string, status: string): Promise<AdmissionEnquiry> {
    const res = await fetch(`${API_BASE}/admin/enquiries/${enquiryId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update enquiry status');
    return res.json();
  },

  async createCourse(data: any): Promise<Course> {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create course');
    return res.json();
  },

  async deleteCourse(courseId: string): Promise<void> {
    await fetch(`${API_BASE}/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};
