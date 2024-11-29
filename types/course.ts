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
    creator_state: string;
    name: string;
    description: string;
    is_public: boolean;
    modules: Module[];
  }