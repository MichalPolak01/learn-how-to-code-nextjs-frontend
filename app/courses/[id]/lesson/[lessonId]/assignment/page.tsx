"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Editor } from "@monaco-editor/react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { BadgeCheck, BadgeX, ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";


const COURSE_URL = "/api/course";

const languages = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "TypeScript", value: "typescript" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Plain Text", value: "plaintext" },
];


export default function AssignmentPage({ params }: { params: { id: string; lessonId: string } }) {
  const { id, lessonId } = params;
  const router = useRouter();
  const [assignment, setAssignment] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [lessonStats, setLessonStats] = useState<any>(null);
  const [allLessonStats, setAllLessonStats] = useState<any>(null);
  const [evaluatedAssignment, setEvaluatedAssignment] = useState<EvaluatedAssignment | null>(null);
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCongratulationModal, setShowCongratulationModal] = useState(false);

  const auth = useAuth();

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`${COURSE_URL}/${id}/module/0/lesson/${lessonId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 401) {
        auth.loginRequired();

        return null;
      }

      if (response.status === 403) {
        showToast("Nie masz odpowiednich uprawnień, aby zobaczyć tę lekcję.", true);
        router.push(id ? `/courses/${id}` : `/courses`);

        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch assignment.");
      }

      const data = await response.json();

      setAssignment(data.assignment?.instructions || null);
    } catch (error) {
      showToast("Nie udało się pobrać zadania.", true);
      router.push(id ? `/courses/${id}` : `/courses`);

      return null;
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${COURSE_URL}/${id}/stats`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 401) {
        auth.loginRequired();

        return null;
      }

      if (response.status === 403) {
        showToast("Nie masz odpowiednich uprawnień, aby zobaczyć statystyki.", true);
        router.push(id ? `/courses/${id}` : `/courses`);

        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch stats.");
      }

      const stats = await response.json();

      setAllLessonStats(stats);

      const currentLessonStats = stats.find((stat: any) => stat.lesson_id === parseInt(lessonId));

      if (!currentLessonStats) {
        showToast(
          "Ta lekcja jest jeszcze zablokowana.\nWykonaj poprzednie lekcje, aby ją odblokować.",
          true
        );
        router.push(id ? `/courses/${id}` : `/courses`);

        return;
      }

      setLessonStats(currentLessonStats);
    } catch (error) {
      showToast("Nie udało się pobrać statystyk.", true);
      router.push(id ? `/courses/${id}` : `/courses`);

      return null;
    }
  };

  const loadCourse = async () => {
    try {
      const response = await fetch(`${COURSE_URL}/${id}`, {
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
        router.push("/courses");

        return;
      }

      const data = await response.json();

      setCourse(data);
    } catch (error) {
      showToast("Nie udało się wczytać kursu.", true);
      router.push("/courses");
    }
  };

  useEffect(() => {
    fetchAssignment();
    fetchStats();
    loadCourse();
  }, [id, lessonId, auth, router]);

  const handleRunCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${COURSE_URL}/${id}/module/0/lesson/${lessonId}/evaluate-assignment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: lessonId,
            user_code: code,
          }),
        }
      );

      if (response.status === 401) {
        auth.loginRequired();
        setLoading(false);

        return;
      }

      if (!response.ok) {
        throw new Error("Response not ok.");
      }

      const data = await response.json();

      setEvaluatedAssignment(data);
      setShowModal(true);
      fetchAssignment();
      setLoading(false);
    } catch {
      showToast("Nie udało się wysłać odpowiedzi do zadania.", true);
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleNext = () => {
    if (!course) return;

    const numericLessonId = Number(lessonId);

    const currentModuleIndex = course.modules.findIndex((module) =>
      module.lessons.some((lesson) => Number(lesson.id) === numericLessonId)
    );

    if (currentModuleIndex === -1) {
      return;
    }

    const currentModule = course.modules[currentModuleIndex];
    const currentLessonIndex = currentModule.lessons.findIndex(
      (lesson) => Number(lesson.id) === numericLessonId
    );

    if (currentLessonIndex === -1) {
      return;
    }

    const isLessonUnlocked = (lessonId: string) => allLessonStats.some((stat: any) => stat.lesson_id == lessonId);

    if (currentLessonIndex + 1 < currentModule.lessons.length) {
      const nextLesson = currentModule.lessons[currentLessonIndex + 1];

      if (isLessonUnlocked((nextLesson.id))) {
        router.push(`/courses/${course.id}/lesson/${nextLesson.id}/introduction`);
      } else {
        showToast("Ta lekcja jest jeszcze zablokowana.", true);
      }

      return;
    }

    for (let i = currentModuleIndex + 1; i < course.modules.length; i++) {
      const nextModule = course.modules[i];

      if (nextModule.lessons.length > 0) {
        const nextLesson = nextModule.lessons[0];

        if (isLessonUnlocked(nextLesson.id)) {
          router.push(`/courses/${course.id}/lesson/${nextLesson.id}/introduction`);
        } else {
          showToast("Następna lekcja jest jeszcze zablokowana.", true);
        }

        return;
      }
    }

    setShowCongratulationModal(true);
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${id}`);
  };

  if (!assignment) {
    return (
      <div className="flex flex-row gap-4 h-full justify-center items-center">
        <Spinner />
        <p className="text-md">Ładowanie Zadania...</p>
      </div>
    );
  }

  return (
    <div className="relative p-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pb-40 bg-black/70 backdrop-blur-sm">
          <Spinner color="primary" label="Sprawdzanie przesłanej odpowiedzi ..." labelColor="primary" size="lg" />
        </div>
      )}
      {showCongratulationModal && (
        <Modal
          aria-labelledby="gratulacje"
          isOpen={showCongratulationModal}
          onOpenChange={(open) => setShowCongratulationModal(open)}
        >
          <ModalContent>
            <ModalHeader>Gratulacje!</ModalHeader>
            <ModalBody>
              <p>Ukończyłeś cały kurs! Świetna robota!</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => {
                  setShowCongratulationModal(false);
                  router.push(`/courses/${id}`);
                }}
              >
                Powrót do strony kursu
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <div className="flex sm:flex-row flex-col gap-2 justify-between items-center mb-6 px-4">
        <h1 className="text-3xl text-primary font-bold">Zadanie</h1>
        {lessonStats && lessonStats.assignment_score && (
          <div
            className={`flex items-center gap-2 ${lessonStats.assignment_score > 70 ? "text-success" : "text-danger"
              }`}
          >
            {lessonStats.assignment_score > 70 ? <BadgeCheck /> : <BadgeX />}
            <span>Najlepszy wynik: {lessonStats.assignment_score}%</span>
          </div>
        )}
      </div>
      <Card className="p-8 mb-8">
        <div dangerouslySetInnerHTML={{ __html: assignment }} className="prose max-w-none" />
      </Card>
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Odpowiedź do zadania</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-default-700" htmlFor="language">
            Wybierz język:
          </label>
          <select
            className="border rounded px-4 py-2 w-full"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <p className="block mb-2 mt-2 font-medium text-default-700">
          Napisz kod lub wklej kod napisany we własnym środowiksku:
        </p>
        <Editor
          defaultLanguage={language}
          height="400px"
          language={language}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            autoClosingBrackets: "always",
            suggestOnTriggerCharacters: true,
          }}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
        <div className="mt-4 flex gap-4">
          <Button color="primary" onClick={handleRunCode}>
            Sprawdź poprawność kodu
          </Button>
          {evaluatedAssignment &&
            <Button className="hover:scale-105" color="default" variant="light" onClick={() => setShowModal(true)}>
              <span className="underline text-md font-semibold underline-offset-1">Pokaż ponownie odpowiedź</span>
            </Button>
          }
        </div>
      </Card>

      {showModal && evaluatedAssignment && (
        <Modal
          backdrop="opaque"
          isDismissable={false}
          isKeyboardDismissDisabled={true}
          isOpen={showModal}
          size="5xl"
          onOpenChange={handleModalClose}
        >
          <ModalContent>
            <>
              <ModalHeader>
                <h2 className="text-2xl text-primary font-bold">Wynik Twojego zadania</h2>
              </ModalHeader>
              <ModalBody className="mt-4">
                {Math.max(lessonStats.assignment_score, evaluatedAssignment.assignment_score) > 70 ?
                  <h2 className="text-xl text-success">Zadanie Zaliczone</h2>
                  :
                  <h2 className="text-xl text-danger">Zadanie niezaliczone</h2>
                }
                <p className="text-small font-light text-default-500">*Aby zadanie było zaliczone, należy osiągnąć co najmniej 70% w najlepszym wyniku.</p>
                <h2 className="text-lg ">Twój wynik to:{" "}
                  <span
                    className={`${evaluatedAssignment.assignment_score >= 75
                      ? "text-success"
                      : evaluatedAssignment.assignment_score >= 0.5
                        ? "text-warning"
                        : "text-danger"
                      } font-bold`}
                  >
                    {evaluatedAssignment.assignment_score}%
                  </span>
                </h2>
                <h2 className="text-lg ">Najlepszy twój wynik to:{" "}
                  <span
                    className={`${Math.max(lessonStats.assignment_score, evaluatedAssignment.assignment_score) >= 75
                      ? "text-success"
                      : Math.max(lessonStats.assignment_score, evaluatedAssignment.assignment_score) >= 0.5
                        ? "text-warning"
                        : "text-danger"
                      } font-bold`}
                  >
                    {Math.max(lessonStats.assignment_score, evaluatedAssignment.assignment_score)}%
                  </span>
                </h2>
                <div dangerouslySetInnerHTML={{ __html: evaluatedAssignment.message }} className="prose max-w-none mt-4" />
              </ModalBody>
              <ModalFooter>
                <Button className="mt-4" color="default" onClick={handleModalClose}>
                  Zamknij
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>
      )}

      <div className="flex sm:flex-row flex-col-reverse gap-2 justify-between mt-8">
        <Button className="hover:scale-105" color="default" variant="light" onClick={handleBackToCourse}>
          <ChevronLeft /><span className="underline text-md font-semibold underline-offset-1">Powrót do strony kursu</span>
        </Button>
        <Button className="hover:scale-105" color="primary" variant="light" onClick={handleNext}>
          <span className="underline text-md font-semibold underline-offset-1">Przejdź do Następnej Lekcji</span><ChevronRight />
        </Button>
      </div>
    </div>
  );
}