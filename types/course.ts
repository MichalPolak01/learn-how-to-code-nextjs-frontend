interface Option {
    id: string;
    answer: string;
    is_correct: boolean;
  }
  
  interface Question {
    id: string;
    question: string;
    answers: Option[];
  }
  
  interface Quiz {
    id: string;
    questions: Question[];
  }
  
  interface Description {
    id: string;
    description: string;
  }
  
  interface Assignment {
    id: string;
    instructions: string;
  }
  
  interface Lesson {
    id: string;
    topic: string;
    order: number;
    introduction: Description;
    quiz: Question[];
    assignment: Assignment;
  }
  
  interface Module {
    id: string;
    name: string;
    order: number;
    is_visible: boolean;
    lessons: Lesson[];
  }
  
  interface Course {
    id: string;
    author: Author;
    creator_state: string;
    last_updated: string;
    name: string;
    description: string;
    is_public: boolean;
    modules: Module[];
  }

  interface Author {
    id: string;
    username: string;
    email: string
    role: string
  }

interface CoursePreview {
  id: string;
  name: string;
  description: string;
  author: Author;
  last_updated: string;
  is_public: boolean;
  rating: number;
  student_count: number;
  lesson_count: number;
  creator_state: string;
}


interface CourseStats {
  courses_count: number;
  students_count: number;
  completed_lessons: number;
}

interface LessonStat {
  lesson_id: string;
  introduction_completed: boolean;
  quiz_score: number | null;
  assignment_score: number | null;
  lesson_completed: boolean;
}

interface EvaluatedAssignment {
  assignment_score: number;
  message: string;
}

interface Stats {
  username: string;
  completed_lessons: number;
  started_assignments: number;
  started_quizzes: number;
  assignment_score_percentage: number;
  quiz_score_percentage: number;
  lesson_count: number;
}