from sqlalchemy.orm import Session
from app.models.models import User, Course, KnowledgeDocument, DocumentChunk, Conversation, Message
from app.core.security import get_password_hash
from app.services.rag_service import generate_embedding, chunk_text_with_overlap

def seed_initial_data(db: Session):
    """Seeds default admin, student, courses, and knowledge documents if not already present."""
    
    # 1. Admin User
    admin = db.query(User).filter(User.email == "admin@antigravityias.com").first()
    if not admin:
        admin = User(
            name="Chief Academic Director",
            email="admin@antigravityias.com",
            password_hash=get_password_hash("Admin@123456"),
            role="admin",
            preferred_language="English",
            target_exam_year=2026,
            preparation_level="Advanced"
        )
        db.add(admin)

    # 2. Demo Student User
    student = db.query(User).filter(User.email == "student@antigravityias.com").first()
    if not student:
        student = User(
            name="Aarav Sharma",
            email="student@antigravityias.com",
            password_hash=get_password_hash("Student@123456"),
            role="student",
            preferred_language="Hinglish",
            target_exam_year=2026,
            preparation_level="Beginner"
        )
        db.add(student)

    db.commit()

    # 3. Courses
    existing_courses = db.query(Course).count()
    if existing_courses == 0:
        sample_courses = [
            Course(
                title="GS Comprehensive Integrated Foundation (Prelims + Mains + CSAT)",
                description="Our flagship 12-month classroom & live-interactive program covering NCERT fundamentals, standard textbooks, daily current affairs analysis, and continuous answer writing practice.",
                duration="12 Months",
                fee="₹ 85,000",
                delivery_mode="Hybrid (Online + Offline)",
                batch_schedule="Morning: 8:00 AM - 11:30 AM | Evening: 4:00 PM - 7:30 PM",
                faculty="Eminent Senior Faculty & Ex-Civil Servants",
                active_status=True
            ),
            Course(
                title="Mains Mentorship & Answer Writing Test Series (MMTS)",
                description="Intensive 16-week answer writing program featuring 24 full-length sectional and simulation tests with personalized 1-on-1 copy evaluation and mentor review within 72 hours.",
                duration="4 Months",
                fee="₹ 28,000",
                delivery_mode="Hybrid (Online + Offline)",
                batch_schedule="Weekends: Saturday & Sunday 9:00 AM - 1:00 PM",
                faculty="Mains Rankholders & Evaluation Specialists",
                active_status=True
            ),
            Course(
                title="Prelims Precision Crash Course & Simulated Mock Tests",
                description="Targeted 90-day program designed to master syllabus high-yield themes, CSAT quantitative reasoning, and scientific statement-elimination logic across 45 full-length mock tests.",
                duration="3 Months",
                fee="₹ 18,500",
                delivery_mode="Online Live",
                batch_schedule="Daily: 6:00 PM - 8:30 PM",
                faculty="Prelims Specialists & Senior Academic Mentors",
                active_status=True
            ),
            Course(
                title="Public Administration Optional Comprehensive Batch",
                description="Complete coverage of Paper 1 (Administrative Theory, Behavioral Science) and Paper 2 (Indian Administration) with case studies, 2nd ARC mapping, and 12 dedicated tests.",
                duration="5 Months",
                fee="₹ 35,000",
                delivery_mode="Hybrid (Online + Offline)",
                batch_schedule="Tuesday to Friday: 2:00 PM - 5:00 PM",
                faculty="Dr. R. K. Mukherjee (25+ Yrs Academic Experience)",
                active_status=True
            ),
            Course(
                title="GS Paper 4 Ethics, Integrity & Aptitude Masterclass",
                description="Decode theoretical frameworks, Western and Indian ethical thinkers, and master the 7-step case study stakeholder framework with real-world administrative dilemmas.",
                duration="6 Weeks",
                fee="₹ 15,000",
                delivery_mode="Online Live",
                batch_schedule="Monday, Wednesday, Friday: 5:00 PM - 7:30 PM",
                faculty="Ethics Panel & Retired Bureaucrats",
                active_status=True
            )
        ]
        for c in sample_courses:
            db.add(c)
        db.commit()

    # 4. Official Knowledge Documents for RAG
    existing_docs = db.query(KnowledgeDocument).count()
    if existing_docs == 0:
        doc1 = KnowledgeDocument(
            title="Official UPSC CSE Scheme & Syllabus Notification 2026",
            document_type="TXT",
            storage_path="system_embedded_upsc_syllabus.txt",
            processing_status="COMPLETED",
            chunk_count=3
        )
        db.add(doc1)
        db.flush()

        doc1_chunks = [
            (
                "UPSC Civil Services Examination consists of three successive stages: 1. Preliminary Examination (Objective type) for the selection of candidates for Main Examination; 2. Main Examination (Written and Interview) for the selection of candidates for the various Services and posts. Prelims has Paper I (General Studies, 200 marks) and Paper II (CSAT, 200 marks, qualifying with minimum 33% marks).",
                1
            ),
            (
                "General Studies Mains syllabus is structured into 4 Papers: GS Paper 1 covers Indian Heritage and Culture, History and Geography of the World and Society. GS Paper 2 covers Governance, Constitution, Polity, Social Justice and International Relations. GS Paper 3 covers Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management. GS Paper 4 covers Ethics, Integrity and Aptitude.",
                2
            ),
            (
                "Mains Answer Evaluation Criteria: Candidates are evaluated on clear, logical exposition and relevant citations. Answers should be structured with a balanced Introduction (context/article), comprehensive Body highlighting multi-dimensional aspects (political, administrative, socio-economic), and a constructive Way Forward. Irrelevant padding leads to penalty marks.",
                3
            )
        ]

        for text, page in doc1_chunks:
            emb = generate_embedding(text)
            chunk = DocumentChunk(
                document_id=doc1.id,
                chunk_text=text,
                embedding=emb,
                page_number=page,
                chunk_metadata={"doc_title": doc1.title, "page": page}
            )
            db.add(chunk)

        doc2 = KnowledgeDocument(
            title="AntiGravity IAS Academy Prospectus & Admission Guidelines",
            document_type="TXT",
            storage_path="system_embedded_academy_guide.txt",
            processing_status="COMPLETED",
            chunk_count=2
        )
        db.add(doc2)
        db.flush()

        doc2_chunks = [
            (
                "AntiGravity IAS Academy offers fee concessions and merit scholarships of up to 50% for deserving aspirants qualifying our All-India Scholarship Test (AIST) held monthly. Free demo classes are available for all GS Foundation and Optional subjects prior to formal registration.",
                1
            ),
            (
                "Admission procedure: Aspirants may enroll directly through our academic counselor portal or visit our central campus. 1-on-1 personalized academic mentorship is provided to every enrolled student, led by rankholders and retired civil service mentors. Helpline: +91-98765-43210 / admissions@antigravityias.com.",
                2
            )
        ]

        for text, page in doc2_chunks:
            emb = generate_embedding(text)
            chunk = DocumentChunk(
                document_id=doc2.id,
                chunk_text=text,
                embedding=emb,
                page_number=page,
                chunk_metadata={"doc_title": doc2.title, "page": page}
            )
            db.add(chunk)

        db.commit()
