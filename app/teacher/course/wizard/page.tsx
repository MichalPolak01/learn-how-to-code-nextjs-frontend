"use client"

import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { Input, Textarea } from "@nextui-org/input";
import { Switch } from "@nextui-org/switch";
import { CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Reorder } from "motion/react"
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Chip } from "@nextui-org/chip";
import { Tooltip } from "@nextui-org/tooltip";
import ReactQuill from "react-quill";

import { createCoursePath } from "@/config/data";
import { useAuth } from "@/providers/authProvider";
import "react-quill/dist/quill.snow.css";

const CREATE_COURSE_URL = "/api/teacher/course";


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



interface CoursePageProps {
  courseId?: number | null;
}

export default function CourseWizard({ courseId }: CoursePageProps) {
  const [courseData, setCourseData] = useState<Course>({
    id: "",
    name: "",
    description: "",
    is_public: false,
    creator_state: "details",
    modules: [],
  });

  const [courseDataError, setCourseDataError] = useState({
    name: false,
    description: false,
    is_public: false,
  });

  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  const formattedCourse = (data: any): Course => {
    return {
      id: data.id,
      name: data.name || "Nieznany kurs",
      description: data.description || "Brak opisu",
      is_public: data.is_public ?? false,
      creator_state: data.creator_state || "details",
      modules: (data.modules || []).map((module: any) => ({
        id: module.id,
        name: module.name || "Nieznany moduł",
        order: module.order || 0,
        is_visible: module.is_visible ?? true,
        lessons: (module.lessons || []).map((lesson: any) => ({
          id: lesson.id,
          topic: lesson.topic || "Nieznany temat",
          order: lesson.order || 0,
          introduction: {
            id: lesson.introduction?.id || "",
            description: lesson.introduction?.description || "Brak opisu",
          },
          quiz: (lesson.quiz || []).map((question: any) => ({
            id: question.id,
            question: question.question || "Pytanie bez treści",
            answers: (question.answers || []).map((answer: any) => ({
              id: answer.id,
              answer: answer.answer || "Brak odpowiedzi",
              is_correct: answer.is_correct ?? false,
            })),
          })),
          assignment: {
            id: lesson.assignment?.id || "",
            instructions: lesson.assignment?.instructions || "Brak instrukcji",
          },
        })),
      })),
    };
  };



  const prepareCourseForApi = (course: Course): any => {
    const nextState = handleNextState();

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      is_public: course.is_public,
      creator_state: nextState,
      modules: course.modules.map((module) => ({
        id: module.id,
        name: module.name,
        order: module.order,
        is_visible: module.is_visible,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          topic: lesson.topic,
          order: lesson.order,
          introduction: {
            id: lesson.introduction.id,
            description: lesson.introduction.description,
          },
          quiz: lesson.quiz.map((question) => ({
            id: question.id,
            question: question.question,
            answers: question.answers.map((answer) => ({
              id: answer.id,
              answer: answer.answer,
              is_correct: answer.is_correct,
            })),
          })),
          assignment: {
            id: lesson.assignment.id,
            instructions: lesson.assignment.instructions,
          },
        })),
      })),
    };
  };

  const validateCourseBeforePublish = (course: Course): boolean => {
    if (course.modules.length < 2) {
      console.error("Kurs musi zawierać co najmniej 2 moduły.");

      return false;
    }

    for (const module of course.modules) {
      if (module.lessons.length < 2) {
        console.error(`Moduł "${module.name}" musi zawierać co najmniej 2 lekcje.`);

        return false;
      }

      for (const lesson of module.lessons) {
        if (!lesson.introduction.description.trim()) {
          console.error(`Lekcja "${lesson.topic}" musi mieć uzupełnione wprowadzenie.`);

          return false;
        }

        if (!lesson.assignment.instructions.trim()) {
          console.error(`Lekcja "${lesson.topic}" musi mieć uzupełnione zadanie.`);

          return false;
        }

        if (lesson.quiz.length < 3) {
          console.error(`Lekcja "${lesson.topic}" musi mieć co najmniej 3 pytania w quizie.`);

          return false;
        }

        for (const question of lesson.quiz) {
          if (question.answers.length < 3) {
            console.error(
              `Pytanie "${question.question}" w lekcji "${lesson.topic}" musi mieć co najmniej 3 odpowiedzi.`
            );

            return false;
          }
        }
      }
    }

    console.log("Kurs przeszedł walidację.");

    return true;
  };


  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/teacher/course/${courseId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          auth.loginRequired();

          return;
        }

        if (!response.ok) {
          console.error("Nie udało się znaleźć kursu.");

          return;
        }

        const data = await response.json();

        const formatted = formattedCourse(data);

        setCourseData(formatted);

        console.log("Dane zwrócone z API:", data);
        console.log("Przetworzony kurs:", formatted);
      } catch (error) {
        console.error("Nie udało się wczytać kursu.", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, auth, router]);


  const handleNextState = () => {
    if (courseData.creator_state === "edit") {
      return courseData.creator_state;
    }
    const currentIndex = createCoursePath.findIndex(
      (item) => item.value === courseData.creator_state
    );
    const nextItem = createCoursePath[currentIndex + 1];

    return nextItem ? nextItem.value : courseData.creator_state;
  };

  const validateCourseDetails = () => {
    const nameError = courseData.name === "";
    const descriptionError = courseData.description === "";

    setCourseDataError((prevErrors) => ({
      ...prevErrors,
      name: nameError,
      description: descriptionError,
    }));

    return !nameError && !descriptionError;
  };

  const handleCreateCourse = async (e: React.FormEvent, generate: boolean) => {
    e.preventDefault();

    validateCourseDetails();

    try {
      const nextState = handleNextState();
      const url = new URL(window.location.origin + CREATE_COURSE_URL);

      if (generate) {
        url.searchParams.set("generate", "true");
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: courseData.name,
          description: courseData.description,
          creator_state: nextState,
        }),
      });

      if (response.status === 400) {
        console.error("Course with this name already exists!")
      }
      if (response.status === 401) {
        auth.loginRequired();

        return;
      }
      if (response.status === 404) {
        router.push("/not-found");

        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formatted = formattedCourse(data);

      setCourseData(formatted);

      console.log("Kurs został pomyślnie utworzony:", formatted);

      router.push(`/teacher/course/wizard/${data.id}`);
    } catch (error) {
      console.error("Nie udało się stworzyć kursu.", error);
    }
  };

  const handleUpdateCourseDetails = async (courseId: number | null | undefined, publish: boolean) => {
    const nextState = handleNextState();

    if (publish) {
      if (!validateCourseBeforePublish(courseData)) {
        return;
      } else {
        courseData.is_public = !courseData.is_public;
      }
    }

    try {
      const response = await fetch(`${CREATE_COURSE_URL}/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: courseData.name,
          is_public: courseData.is_public,
          description: courseData.description,
          creator_state: nextState,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const formatted = formattedCourse(data);

      setCourseData(formatted);

      console.log("Kurs został zaktualizowany utworzony:", formatted);

    } catch (error) {
      console.error("Nie udało się stworzyć kursu.", error);
    }
  }

  const validateModules = () => {
    return courseData.modules.length > 0 && courseData.modules.every((module) => module.name.trim() !== "");
  };

  const handleCreateModules = async (e: React.FormEvent, generate: boolean) => {
    e.preventDefault();

    if (!validateModules()) {
      console.error("Moduły nie są poprawne. Upewnij się, że wszystkie moduły mają nazwy.");

      return;
    }

    try {
      console.log("Moduły do zapisania:", courseData.modules);
      const url = new URL(`${window.location.origin}/api/teacher/course/${courseId}/module`);

      if (generate) {
        url.searchParams.set("generate", "true");
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          courseData.modules.map((module) => ({
            name: module.name,
            order: module.order,
            is_visible: module.is_visible,
          }))
        ),
      });

      if (response.status === 401) {
        auth.loginRequired();

        return;
      }

      if (response.status === 404) {
        console.error("Nie znaleziono kursu.");

        return;
      }

      if (response.status === 400 || response.status === 422) {
        console.error("Nieprawidłowe dane.");

        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.status === 201) {
        const data = await response.json();

        handleUpdateCourseDetails(courseId, false);

        console.log("Moduły zapisane pomyślnie:", data);
      }
    } catch (error) {
      console.error("Nie udało się stworzyć modułów.", error);
    }
  };

  const validateModulesAndLessons = () => {
    return courseData.modules.every((module) => {
      const validLessons = module.lessons.length >= 2 &&
        module.lessons.every((lesson) => lesson.topic.trim() !== "");

      return validLessons;
    });
  };


  const handleCreateLessons = async (e: React.FormEvent, generate: boolean) => {
    e.preventDefault();

    if (!validateModulesAndLessons()) {
      console.error("Nie wszystkie moduły mają co najmniej 2 lekcje z podanymi nazwami.");

      return;
    }

    try {
      for (const module of courseData.modules) {
        if (module.lessons.length === 0) {
          console.error(`Moduł ${module.name} nie zawiera lekcji.`);
          continue;
        }

        const url = new URL(
          `${window.location.origin}/api/teacher/course/${courseId}/module/${module.id}/lesson`
        );

        if (generate) {
          url.searchParams.set("generate", "true");
        }

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            module.lessons.map((lesson) => ({
              topic: lesson.topic,
              order: lesson.order
            }))
          ),
        });

        if (response.status === 401) {
          auth.loginRequired();

          return;
        }

        if (response.status === 404) {
          console.error(`Nie znaleziono modułu o ID ${module.id}.`);

          return;
        }

        if (response.status === 400 || response.status === 422) {
          console.error(`Nieprawidłowe dane dla modułu ${module.name}.`);

          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response.status === 201) {
          const data = await response.json();
          console.log(`Lekcje dla modułu ${module.name} zapisane pomyślnie:`, data);

          handleUpdateCourseDetails(courseId, false);
        }
      }
    } catch (error) {
      console.error("Nie udało się stworzyć lekcji.", error);
    }
  };


  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = prepareCourseForApi(courseData);

    console.log("Data wysyłane do API: ", payload);

    try {
      const url = `${window.location.origin}/api/teacher/course/${courseData.id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        auth.loginRequired();

        return;
      }

      if (response.status === 404) {
        console.error(`Nie znaleziono kursu o ID ${courseData.id}.`);

        return;
      }

      if (!response.ok) {
        const data = await response.json();

        throw new Error(`HTTP error! status: ${response.status} ${data.details}`);
      }

      if (response.status === 200) {
        const data = await response.json();

        setCourseData(data);
      }

    } catch (error) {
      console.error("Nie udało się zaktualizować kursu:", error);
    }
  };

  const handleCourseChange = (event: { target: { name: string; value: string } }) => {
    const { name, value } = event.target;

    setCourseData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleAddModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      name: "Nowy moduł",
      order: courseData.modules.length + 1,
      is_visible: true,
      lessons: [],
    };

    setCourseData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
  };


  const handleUpdateModuleName = (id: string, newName: string) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === id ? { ...module, name: newName } : module
      ),
    }));
  };

  const handleRemoveModule = (id: string) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module.id !== id),
    }));
  };

  const handleReorder = (newOrder: Module[]) => {
    setCourseData((prev) => ({
      ...prev,
      modules: newOrder.map((module, index) => ({
        ...module,
        order: index + 1,
      })),
    }));
  };

  const handleUpdateModuleLessons = (moduleId: string, updatedLessons: Lesson[]) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId ? { ...module, lessons: updatedLessons } : module
      ),
    }));
  };


  return (
    <div className="flex flex-col gap-8 mt-10">
      <Card className="p-8">
        <h1 className="text-3xl text-primary font-semibold">Kreator kursu</h1>
        <div className="flex flex-row mt-8">
          {createCoursePath.map((item, index) => (
            <div key={item.value} className="flex flex-row justify-center items-center gap-1">
              <p className={`text-center ${courseData.creator_state === item.value && "text-secondary font-semibold"}`}>{index + 1}. {item.label}</p>
              <ChevronRight />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8 flex flex-col gap-12">
        <div className="flex flex-row justify-between">
          <h2 className="text-3xl text-primary font-semibold">Podstawowe informacje o kursie</h2>
          <div className="flex flex-col gap-2">
            <Tooltip
              content="Kurs można opublikować w ostatnim kroku kreatora."
              isDisabled={courseData.creator_state === "edit"}
              placement="bottom"
            >
              <Chip
                color={courseData.is_public ? "success" : "danger"}
                size="lg"
                startContent={courseData.is_public ? <CheckCircle /> : <XCircle />}
              >
                {!courseData.is_public ? "Wersja robocza" : "Kurs publiczny"}
              </Chip>
            </Tooltip>
            {courseData.creator_state === "edit" &&
              <Button color="primary" variant="shadow" onClick={(e) => handleUpdateCourseDetails(courseId, true)}>
                {courseData.is_public ? "Wersja robocza" : "Opublikuj kurs"}
              </Button>
            }
          </div>
        </div>

        <form className="overflow-visible flex flex-col gap-5">
          <Input
            color={courseDataError.name ? "danger" : "default"}
            errorMessage="Podanie tematu kursu jest wymagane!"
            isInvalid={courseDataError.name}
            isRequired={true}
            label="Temat kursu"
            labelPlacement="outside"
            name="name"
            placeholder="Podaj temat kursu"
            value={courseData.name}
            onChange={handleCourseChange}
          />
          <Textarea
            color={courseDataError.description ? "danger" : "default"}
            errorMessage="Podanie opisu kursu jest wymagane!"
            isInvalid={courseDataError.description}
            isRequired={true}
            label="Opis kursu"
            labelPlacement="outside"
            name="description"
            placeholder="Przedstaw swój kurs, aby zachęcić osby do udziału w nim."
            value={courseData.description}
            onChange={handleCourseChange}
          />

          {courseData.creator_state === "details" &&
            <div className="flex flex-row gap-4 mt-4">
              <Button color="primary" variant="ghost" onClick={(e) => handleCreateCourse(e, false)}>
                Zapisz i kontynuuj własnoręczne tworzenie kursu
              </Button>
              <Button color="secondary" variant="ghost" onClick={(e) => handleCreateCourse(e, true)}>
                Zapisz i wygeneruj moduły kursu
              </Button>
            </div>
          }
        </form>
      </Card>

      {(courseData.creator_state != "details") && (
        <Card className="p-8 flex flex-col gap-4">
          <h2 className="text-3xl text-primary font-semibold mb-4">Zawartość kursu</h2>
          <h3 className="text-xl text-primary-600 font-semibold">Moduły</h3>
          <Reorder.Group
            axis="y"
            className="flex flex-col gap-5"
            values={courseData.modules}
            onReorder={handleReorder}
          >
            {courseData.modules.map((module) => (
              <CustomAccordionItem
                key={module.id}
                creator_state={courseData.creator_state}
                module={module}
                onRemove={() => handleRemoveModule(module.id)}
                onUpdateLessons={(updatedLessons) =>
                  handleUpdateModuleLessons(module.id, updatedLessons)
                }
                onUpdateName={(newName) => handleUpdateModuleName(module.id, newName)}
              />
            ))}
          </Reorder.Group>
          {(courseData.creator_state === "module-topics" || courseData.creator_state === "edit") &&
            <Button
              className="bg-default-200 border border-dashed border-default-600 rounded-xl p-4 text-center hover:text-black hover:border-black cursor-pointer"
              onClick={handleAddModule}
            >
              Dodaj nowy moduł
            </Button>
          }
          {courseData.creator_state === "module-topics" && (
            <div className="flex flex-row gap-4 mt-4">
              <Button color="primary" variant="ghost" onClick={(e) => handleCreateModules(e, false)}>
                Zapisz moduły i kontynuuj własnoręczne tworzenie kursu
              </Button>
              <Button color="secondary" variant="ghost" onClick={(e) => handleCreateModules(e, true)}>
                Zapisz moduły i wygeneruj tematy lekcji
              </Button>
            </div>
          )}
          {courseData.creator_state === "lesson-topics" && (
            <div className="flex flex-row gap-4 mt-4">
              <Button color="primary" variant="ghost" onClick={(e) => handleCreateLessons(e, false)}>
                Zapisz tematy lekcji i kontynuuj własnoręczne tworzenie kursu
              </Button>
              <Button color="secondary" variant="ghost" onClick={(e) => handleCreateLessons(e, true)}>
                Zapisz tematy lekcji i wygeneruj zawartość lekcji
              </Button>
            </div>
          )}
          {(courseData.creator_state === "lesson-content" || courseData.creator_state === "edit") && (
            <div className="flex flex-row gap-4 mt-4">
              <Button color="primary" variant="ghost" onClick={(e) => handleUpdateCourse(e)}>
                Zapisz zawartość lekcji
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

const CustomAccordionItem = ({
  module,
  creator_state,
  onUpdateName,
  onRemove,
  onUpdateLessons,
}: {
  module: Module;
  creator_state: string;
  onUpdateName: (newName: string) => void;
  onRemove: () => void;
  onUpdateLessons: (updatedLessons: Lesson[]) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // const handleAddLesson = () => {
  //   const newLesson: Lesson = {
  //     id: Date.now().toString(),
  //     name: "Nowa lekcja",
  //     order: module.lessons.length + 1,
  //     introduction: { id: Date.now().toString(), description: "" },
  //     quiz: { id: Date.now().toString(), questions: [] },
  //     assignment: { id: Date.now().toString(), instructions: "" },
  //   };

  //   onUpdateLessons([...module.lessons, newLesson]);
  // };

  const handleUpdateLessonName = (id: string, newName: string) => {
    onUpdateLessons(
      module.lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, name: newName } : lesson
      )
    );
  };

  const handleRemoveLesson = (id: string) => {
    onUpdateLessons(module.lessons.filter((lesson) => lesson.id !== id));
  };

  const handleReorderLessons = (newOrder: Lesson[]) => {
    onUpdateLessons(
      newOrder.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }))
    );
  };

  return (
    <Reorder.Item
      className="rounded-xl shadow p-4 bg-default-200"
      id={module.id}
      value={module}
    >
      <div className="flex items-center gap-2">
        <div className="cursor-grab flex items-center justify-center w-6 h-6 mr-2">
          <span className="icon text-xl text-default-600">⋮⋮</span>
        </div>
        <Input
          color="default"
          isDisabled={creator_state !== "module-topics" && creator_state !== "edit"}
          placeholder="Podaj nazwę modułu"
          type="text"
          value={module.name}
          onChange={(e) => onUpdateName(e.target.value)}
        />
        <Button
          color="danger"
          isDisabled={creator_state !== "module-topics" && creator_state !== "edit"}
          variant="shadow"
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
        <Button className="bg-default-400 text-white" variant="shadow" onClick={() => setIsExpanded((prev) => !prev)}>
          {isExpanded ? <ChevronDown /> : <ChevronLeft />}
        </Button>
      </div>

      {
        isExpanded && (
          <div className="mt-4 pl-16 flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-primary-600">Lekcje</h4>
            <Reorder.Group
              axis="y"
              className="flex flex-col gap-2"
              values={module.lessons}
              onReorder={(newOrder) =>
                onUpdateLessons(
                  newOrder.map((lesson, index) => ({
                    ...lesson,
                    order: index + 1,
                  }))
                )
              }
            >
              {module.lessons.map((lesson) => (
                <LessonAccordionItem
                  key={lesson.id}
                  creator_state={creator_state}
                  lesson={lesson}
                  onRemoveLesson={() =>
                    onUpdateLessons(
                      module.lessons.filter((l) => l.id !== lesson.id)
                    )
                  }
                  onUpdateLesson={(updatedLesson) =>
                    onUpdateLessons(
                      module.lessons.map((l) =>
                        l.id === lesson.id ? updatedLesson : l
                      )
                    )
                  }
                />
              ))}
            </Reorder.Group>
            {(creator_state === "lesson-topics" || creator_state === "edit") &&
              <Button
                className="bg-default-300 border border-dashed border-default-600 rounded-xl p-4 text-center hover:text-black hover:border-black cursor-pointer"
                onClick={() => {
                  const newLesson: Lesson = {
                    id: Date.now().toString(),
                    topic: "Nowa lekcja",
                    order: module.lessons.length + 1,
                    introduction: {
                      id: Date.now().toString(),
                      description: "Brak opisu",
                    },
                    quiz: [],
                    assignment: {
                      id: Date.now().toString(),
                      instructions: "Brak instrukcji",
                    },
                  };

                  onUpdateLessons([...module.lessons, newLesson]);
                }}
              >
                Dodaj nową lekcję
              </Button>
            }
          </div>
        )
      }
    </Reorder.Item>
  );
};




const LessonAccordionItem = ({
  creator_state,
  lesson,
  onUpdateLesson,
  onRemoveLesson,
}: {
  creator_state: string,
  lesson: Lesson;
  onUpdateLesson: (updatedLesson: Lesson) => void;
  onRemoveLesson: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Reorder.Item
      className="bg-default-300 rounded-xl shadow p-4 "
      id={lesson.id}
      value={lesson}
    >
      <div className="flex items-center gap-2">
        <div className="cursor-grab flex items-center justify-center w-6 h-6 mr-2">
          <span className="icon text-xl text-default-600">⋮⋮</span>
        </div>
        <Input
          color="default"
          isDisabled={creator_state != "lesson-topics" && creator_state != "edit"}
          placeholder="Podaj nazwę lekcji"
          type="text"
          value={lesson.topic}
          onChange={(e) =>
            onUpdateLesson({ ...lesson, topic: e.target.value })
          }
        />
        <Button color="danger" variant="shadow" onClick={onRemoveLesson}>
          <Trash2 />
        </Button>
        <Button
          className="bg-default-400 text-white"
          variant="shadow"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? <ChevronDown /> : <ChevronLeft />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-16">
          <Accordion
            isCompact={true}
            isDisabled={creator_state != "lesson-content" && creator_state != "edit"}
            variant="splitted"
          >
            <AccordionItem title="Wprowadzenie do lekcji">
              <ReactQuill
                theme="snow"
                value={lesson.introduction.description || ""}
                onChange={(content) =>
                  onUpdateLesson({
                    ...lesson,
                    introduction: {
                      id: lesson.introduction.id || Date.now().toString(),
                      description: content,
                    },
                  })
                }
              />
            </AccordionItem>

            <AccordionItem title="Quiz">
              <QuizEditor
                quiz={{
                  id: lesson.id,
                  questions: lesson.quiz,
                }}
                onUpdateQuiz={(updatedQuiz) =>
                  onUpdateLesson({
                    ...lesson,
                    quiz: updatedQuiz.questions,
                  })
                }
              />
            </AccordionItem>

            <AccordionItem title="Zadanie">
              <ReactQuill
                theme="snow"
                value={lesson.assignment.instructions || ""}
                onChange={(content) =>
                  onUpdateLesson({
                    ...lesson,
                    assignment: {
                      id: lesson.assignment?.id || Date.now().toString(),
                      instructions: content,
                    },
                  })
                }
              />
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Reorder.Item>
  );
};


const QuizEditor = ({
  quiz,
  onUpdateQuiz,
}: {
  quiz: Quiz;
  onUpdateQuiz: (updatedQuiz: Quiz) => void;
}) => {
  const handleAddQuestion = () => {
    onUpdateQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          id: Date.now().toString(),
          question: "Nowe pytanie",
          answers: [
            { id: Date.now().toString(), answer: "Odpowiedź 1", is_correct: false },
          ],
        },
      ],
    });
  };

  const handleQuestionChange = (qIndex: number, question: string) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex ? { ...q, question } : q
      ),
    });
  };

  const handleAddOption = (qIndex: number) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex
          ? {
            ...q,
            answers: [
              ...q.answers,
              {
                id: Date.now().toString(),
                answer: `Nowa odpowiedź ${q.answers.length + 1}`,
                is_correct: false,
              },
            ],
          }
          : q
      ),
    });
  };


  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex
          ? {
            ...q,
            answers: q.answers.map((a, j) =>
              j === oIndex ? { ...a, answer: value } : a
            ),
          }
          : q
      ),
    });
  };


  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex
          ? {
            ...q,
            answers: q.answers.map((a, j) => ({
              ...a,
              is_correct: j === oIndex,
            })),
          }
          : q
      ),
    });
  };


  return (
    <div>
      {quiz.questions.map((question, qIndex) => (
        <div key={question.id} className="mb-4 p-4 border rounded">
          <Input
            placeholder="Podaj pytanie"
            value={question.question}
            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
          />
          {question.answers.map((option, oIndex) => (
            <div key={option.id} className="flex items-center gap-2 mt-2">
              <Input
                placeholder={`Odpowiedź ${oIndex + 1}`}
                value={option.answer}
                onChange={(e) =>
                  handleOptionChange(qIndex, oIndex, e.target.value)
                }
              />
              <Switch
                isSelected={option.is_correct}
                onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
              />
            </div>
          ))}
          <Button
            className="mt-2"
            onClick={() => handleAddOption(qIndex)}
          >
            Dodaj Odpowiedź
          </Button>
        </div>
      ))}
      <Button
        className="mt-4"
        onClick={handleAddQuestion}
      >
        Dodaj Pytanie
      </Button>
    </div>
  );
};