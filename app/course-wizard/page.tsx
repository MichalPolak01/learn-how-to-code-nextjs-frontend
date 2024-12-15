"use client"

import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { Input, Textarea } from "@nextui-org/input";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Reorder } from "motion/react"
import { Chip } from "@nextui-org/chip";
import { Tooltip } from "@nextui-org/tooltip";
import { Spinner } from "@nextui-org/spinner";

import { createCoursePath } from "@/config/data";
import { useAuth } from "@/providers/authProvider";
import "react-quill/dist/quill.snow.css";
import ModuleAccordionItem from "@/components/course_wizard/moduleAccordionItem";
import { validateCourseBeforePublication, validateCourseDetails, validateModules, validateModulesAndLessons } from "@/lib/formValidators";
import ErrorAlert from "@/components/errorAlert";
import { showToast } from "@/lib/showToast";
import RowSteps from "@/components/course_wizard/rowSteps";


const COURSE_URL = "/api/course";

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
    author: null,
    last_updated: null,
    image: ""
  });

  const [courseDataError, setCourseDataError] = useState({
    name: false,
    description: false,
    is_public: false,
  });

  const [loading, setLoading] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const auth = useAuth();
  const router = useRouter();

  const formattedCourse = (data: any): Course => {
    return {
      author: null,
      last_updated: null,
      image: data.image || "",
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
      image: course.image,
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

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      setLoading(true);

      try {
        const response = await fetch(`${COURSE_URL}/${courseId}`, {
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
          showToast("Nie udało się znaleźć kursu.", true);
          router.push("/course-wizard");

          return;
        }

        const data = await response.json();

        while (!auth.username) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (data.author.username !== auth.username) {
          showToast("Ten kurs nie należy do Ciebie.", true);
          router.push("/course-wizard");

          return;
        }

        const formatted = formattedCourse(data);

        setCourseData(formatted);

      } catch (error) {
        showToast("Nie udało się wczytać kursu.", true);
        router.push("/course-wizard");

        return;
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

  const handleCreateCourse = async (e: React.FormEvent, generate: boolean) => {
    e.preventDefault();

    const validationResponse = validateCourseDetails(courseData);

    if (validationResponse != "Walidacja powiodła się.") {
      setValidationMessage(validationResponse);
      setIsErrorOpen(true);

      const nameError = courseData.name === "";
      const descriptionError = courseData.description === "";

      setCourseDataError((prevErrors) => ({
        ...prevErrors,
        name: nameError,
        description: descriptionError,
      }));

      return;
    }

    try {
      setLoading(true);
      const nextState = handleNextState();
      const url = new URL(window.location.origin + COURSE_URL);

      if (generate) {
        url.searchParams.set("generate", "true");
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: courseData.name,
          description: courseData.description,
          image: courseData.image,
          creator_state: nextState,
        }),
      });

      if (response.status === 400) {
        interface ResponseMessage {
          message?: string
        };
        let data: ResponseMessage = {};

        try {
          data = await response.json();
        } catch { }

        if (data.message === "A course with this name already exists.") {
          showToast("Kurs z podaną nazwą już istnieje.", true);
        } else if (data.message === "Only teachers can create courses.") {
          showToast("Nie jesteś nauczycielem, a tylko nauczyciele mogą tworzyć kursy.", true);
          router.push("/");
        }

        return;
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
      showToast(`Utworzono nowy kurs`, false);

      router.push(`/course-wizard/${data.id}`);
    } catch (error) {
      showToast(`Nie udało się stworzyć kursu. ${error}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourseDetails = async (courseId: number | null | undefined, publish: boolean) => {
    const nextState = handleNextState();

    if (publish) {
      const validationResponse = validateCourseBeforePublication(courseData);

      if (validationResponse != "Walidacja powiodła się.") {
        setValidationMessage(validationResponse);
        setIsErrorOpen(true);

        return;
      } else {
        courseData.is_public = !courseData.is_public;
      }
    }

    try {
      setLoading(true);
      const response = await fetch(`${COURSE_URL}/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: courseData.name,
          image: courseData.image,
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
      showToast(`Kurs został zaktualizowany.`, false);
    } catch (error) {
      showToast(`Nie udało się zaktualizować kursu. ${error}`, true);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateModules = async (e: React.FormEvent, generate: boolean) => {
    e.preventDefault();

    const validationResponse = validateModules(courseData);

    if (validationResponse != "Walidacja powiodła się.") {
      setValidationMessage(validationResponse);
      setIsErrorOpen(true);

      return;
    }

    try {
      setLoading(true);
      const url = new URL(`${window.location.origin}${COURSE_URL}/${courseId}/module`);

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
        showToast(`Nie znaleziono kursu o id ${courseId}.`, true);
        router.push("/not-found");

        return;
      }

      if (response.status === 400 || response.status === 422) {
        showToast("Podane dane są w nieodpowiednim formacie.", true);

        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.status === 201) {
        handleUpdateCourseDetails(courseId, false);

        showToast(`Moduły zapisane pomyślnie.`, false);
      }
    } catch (error) {
      showToast(`Nie udało się stworzyć modułów. ${error}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLessons = async (e: React.FormEvent, generate: boolean) => {
    e.preventDefault();

    const validationResponse = validateModulesAndLessons(courseData);

    if (validationResponse != "Walidacja powiodła się.") {
      setValidationMessage(validationResponse);
      setIsErrorOpen(true);

      return;
    }

    try {
      for (const module of courseData.modules) {
        setLoading(true);
        if (module.lessons.length === 0) {
          setValidationMessage(`Moduł ${module.name} nie zawiera lekcji.`);
          setIsErrorOpen(true);

          continue;
        }

        const url = new URL(
          `${window.location.origin}${COURSE_URL}/${courseId}/module/${module.id}/lesson`
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
          showToast(`Nie znaleziono kursu o id ${courseId}.`, true);
          router.push("/not-found");

          return;
        }

        if (response.status === 400 || response.status === 422) {
          showToast("Podane dane są w nieodpowiednim formacie.", true);

          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response.status === 201) {
          showToast(`Lekcje zapisane pomyślnie.`, false);
          handleUpdateCourseDetails(courseId, false);
        }
      }
    } catch (error) {
      showToast(`Nie udało się stworzyć lekcji. ${error}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResponse = validateCourseDetails(courseData);

    if (validationResponse != "Walidacja powiodła się.") {
      setValidationMessage(validationResponse);
      setIsErrorOpen(true);

      const nameError = courseData.name === "";
      const descriptionError = courseData.description === "";

      setCourseDataError((prevErrors) => ({
        ...prevErrors,
        name: nameError,
        description: descriptionError,
      }));

      return;
    }

    if (courseData.is_public) {
      const validationResponse = validateCourseBeforePublication(courseData);

      if (validationResponse != "Walidacja powiodła się.") {

        courseData.is_public = !courseData.is_public;
      }
    }

    const payload = await prepareCourseForApi(courseData);

    try {
      setLoading(true);
      const url = `${window.location.origin}${COURSE_URL}/${courseData.id}`;
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
        showToast(`Nie znaleziono kursu o id ${courseData.id}.`, true);
        router.push("/not-found");

        return;
      }

      if (!response.ok) {
        const data = await response.json();

        throw new Error(`HTTP error! status: ${response.status} ${data.details}`);
      }

      if (response.status === 200) {
        const data = await response.json();

        setCourseData(data);
        showToast(`Kurs został zaktualizowany.`, false);
      }

    } catch (error) {
      showToast(`Nie udało się zaktualizować kursu. ${error}`, true);
    } finally {
      setLoading(false);
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
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pb-40 bg-black/70 backdrop-blur-sm">
          <Spinner color="primary" label="Ładowanie danych ..." labelColor="primary" size="lg" />
        </div>
      )}
      <div className="flex flex-col gap-8 mt-10">
        <Card className="p-8">
          <h1 className="text-3xl text-primary font-semibold">Kreator kursu</h1>
          <div className="flex flex-row mt-8 lg:justify-center items-center flex-wrap">
            <RowSteps
              currentStep={createCoursePath.findIndex(
                (step) => step.value === courseData.creator_state
              )}
              steps={createCoursePath.map((item, index) => ({
                title: `${index + 1}. ${item.label}`,
              }))}
            />
          </div>
        </Card>

        <Card className="p-8 flex flex-col gap-12">
          <div className="flex md:flex-row flex-col-reverse justify-between gap-4">
            <h2 className="text-3xl text-primary font-semibold">Podstawowe informacje o&nbsp;kursie</h2>
            <div className=" flex md:flex-col flex-row md:items-end items-center gap-2">
              <Tooltip
                content="Kurs można opublikować w ostatnim kroku kreatora."
                isDisabled={courseData.creator_state === "edit"}
                placement="top"
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
                <Button color="primary" variant="shadow" onClick={() => handleUpdateCourseDetails(courseId, true)}>
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
            <Input
              color={"default"}
              label="Okładka kursu"
              labelPlacement="outside"
              name="image"
              placeholder="Podaj link do okładki kursu"
              value={courseData.image}
              onChange={handleCourseChange}
            />

            {courseData.creator_state === "details" &&
              <div className="flex md:flex-row flex-col gap-4 mt-4">
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
                <ModuleAccordionItem
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
              <div className="flex md:flex-row flex-col gap-4 mt-4">
                <Button color="primary" variant="ghost" onClick={(e) => handleCreateModules(e, false)}>
                  Zapisz moduły i kontynuuj własnoręczne tworzenie kursu
                </Button>
                <Button color="secondary" variant="ghost" onClick={(e) => handleCreateModules(e, true)}>
                  Zapisz moduły i wygeneruj tematy lekcji
                </Button>
              </div>
            )}
            {courseData.creator_state === "lesson-topics" && (
              <div className="flex md:flex-row flex-col gap-4 mt-4">
                <Button color="primary" variant="ghost" onClick={(e) => handleCreateLessons(e, false)}>
                  Zapisz tematy lekcji i kontynuuj własnoręczne tworzenie kursu
                </Button>
                <Button color="secondary" variant="ghost" onClick={(e) => handleCreateLessons(e, true)}>
                  Zapisz tematy lekcji i wygeneruj zawartość lekcji
                </Button>
              </div>
            )}
            {(courseData.creator_state === "lesson-content" || courseData.creator_state === "edit") && (
              <div className="flex md:flex-row flex-col gap-4 mt-4">
                <Button color="primary" variant="ghost" onClick={(e) => handleUpdateCourse(e)}>
                  Zapisz zawartość lekcji
                </Button>
              </div>
            )}
          </Card>
        )}
        <ErrorAlert
          body={validationMessage}
          header="Walidacja kursu nie powiodła się"
          isOpen={isErrorOpen}
          onClose={() => setIsErrorOpen(false)}
        />
      </div>
    </div>
  );
};