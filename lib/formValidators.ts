export const validateEmail = (value: string) => {
  return value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
};

export const validatePassword = (value: string) => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  return passwordPattern.test(value);
};

export const validateModules = (courseData: Course): string => {
  if (courseData.modules.length > 0 && courseData.modules.every((module) => module.name.trim() !== "")) {
    return "Walidacja powiodła się.";
  }

  return "Moduły nie są poprawne. Upewnij się, że wszystkie moduły mają nazwy.";
};

export const validateModulesAndLessons = (courseData: Course): string => {
  return courseData.modules.every((module) => {
    const validLessons = module.lessons.length >= 2 &&
      module.lessons.every((lesson) => lesson.topic.trim() !== "");

    return validLessons;
  }) ? "Walidacja powiodła się." : "Wszystkie moduły  muszą mieć co najmniej 2 lekcje, a każda z lekcji musi posiadać nazwę.";
};

export const validateCourseBeforePublication = (course: Course): string => {
  if (course.modules.length < 2) {
    return "Kurs musi zawierać co najmniej 2 moduły.";
  }

  for (const module of course.modules) {
    if (module.lessons.length < 2) {
      return `Moduł "${module.name}" musi zawierać co najmniej 2 lekcje.`;
    }

    for (const lesson of module.lessons) {
      if (!lesson.introduction.description.trim()) {
        return `Lekcja "${lesson.topic}" musi mieć uzupełnione wprowadzenie.`;
      }

      if (!lesson.assignment.instructions.trim()) {
        return `Lekcja "${lesson.topic}" musi mieć uzupełnione zadanie.`;
      }

      if (lesson.quiz.length < 3) {
        return `Lekcja "${lesson.topic}" musi mieć co najmniej 3 pytania w quizie.`;
      }

      for (const question of lesson.quiz) {
        if (question.answers.length < 3) {
          return `Pytanie "${question.question}" w lekcji "${lesson.topic}" musi mieć co najmniej 3 odpowiedzi.`;
        }
      }
    }
  }

  return "Walidacja powiodła się.";
};

export const validateCourseDetails = (courseData: Course): string => {
  if (courseData.name === "") {
    return "Temat kursu nie może być pusty.";
  }

  if (courseData.name === "") {
    return "Opis kursu nie może być pusty.";
  }

  return "Walidacja powiodła się.";
};