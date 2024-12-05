"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";


interface LessonStat {
    lesson_id: string;
    introduction_completed: boolean;
    quiz_score: number | null;
    assignment_score: number | null;
    lesson_completed: boolean;
  }

  export default function Course({ params }: { params: { id: string } }) {
    const courseId = parseInt(params.id);
    const [course, setCourse] = useState<Course | undefined>(undefined);
    const [lessonStats, setLessonStats] = useState<LessonStat[]>([]);
  
    const auth = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      const loadCourse = async () => {
        if (!courseId) return;
  
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
            showToast("Nie udało się znaleźć kursu.", true);
            router.push("/courses");
            return;
          }
  
          const data = await response.json();
          setCourse(data);
        } catch (error) {
          showToast("Nie udało się wczytać kursu.", true);
          router.push("/teacher/course/wizard");
        }
      };
  
      const loadLessonStats = async () => {
        try {
          const response = await fetch(`/api/teacher/course/${courseId}/stats`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            console.error("Nie udało się pobrać statystyk.");
            return;
          }
  
          const stats = await response.json();
          setLessonStats(stats);
        } catch (error) {
          console.error("Błąd podczas pobierania statystyk.", error);
        }
      };
  
      loadCourse();
      loadLessonStats();
    }, [courseId, auth, router]);
  
    const getLessonStats = (lessonId: string) =>
      lessonStats.find((stat) => stat.lesson_id === lessonId);
  
    const handleNavigation = (
      moduleId: string,
      lessonId: string,
      section: "introduction" | "quiz" | "assignment"
    ) => {
      router.push(`/course/${course?.id}/module/${moduleId}/lesson/${lessonId}/${section}`);
    };
  
    const isLessonUnlocked = (moduleIndex: number, lessonIndex: number) => {
      if (moduleIndex === 0 && lessonIndex === 0) {
        return true;
      }
  
      const module = course?.modules[moduleIndex];
      const previousLessonStats = module?.lessons
        .slice(0, lessonIndex)
        .every((lesson) => getLessonStats(lesson.id)?.lesson_completed);
  
      if (!previousLessonStats) {
        return false;
      }
  
      const previousModulesCompleted = course?.modules
        .slice(0, moduleIndex)
        .every((mod) =>
          mod.lessons.every((lesson) => getLessonStats(lesson.id)?.lesson_completed)
        );
  
      return previousModulesCompleted;
    };
  
    if (!course) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-500">Ładowanie kursu...</h1>
        </div>
      );
    }
  
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-500">{course?.name}</h1>
          <p className="text-lg text-gray-600">{course?.description}</p>
        </div>
  
        {course?.modules.map((module, moduleIndex) => (
          <div key={module.id} className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-semibold text-primary-700 mb-4">{module.name}</h2>
  
            <ul className="space-y-4">
              {module.lessons.map((lesson, lessonIndex) => {
                const stats = getLessonStats(lesson.id);
  
                const introductionCompleted = stats?.introduction_completed || false;
                const quizPassed = stats?.quiz_score !== null && stats?.quiz_score !== undefined && stats.quiz_score >= 60;
                const assignmentPassed = stats?.assignment_score !== null && stats?.assignment_score !== undefined && stats.assignment_score >= 60;

                const lessonCompleted = stats?.lesson_completed || false;
  
                const lessonUnlocked = isLessonUnlocked(moduleIndex, lessonIndex);
  
                return (
                  <li
                    key={lesson.id}
                    className={`border rounded-lg p-4 shadow-sm ${
                      lessonCompleted ? "bg-green-50" : "bg-white"
                    } ${lessonUnlocked ? "" : "opacity-50 pointer-events-none"}`}
                  >
                    <h3 className="text-lg font-medium text-gray-700 mb-8">{lesson.topic}</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {lesson.introduction && (
                        <button
                          className={`px-4 py-2 ${
                            introductionCompleted
                              ? "bg-success-200 hover:bg-success-300"
                              : "bg-blue-500 hover:bg-blue-600"
                          } hover:scale-110 text-white rounded-lg`}
                          onClick={() =>
                            handleNavigation(module.id, lesson.id, "introduction")
                          }
                        >
                          Wprowadzenie
                        </button>
                      )}
  
                      {lesson.quiz.length > 0 && (
                        <button
                          className={`px-4 py-2 ${
                            quizPassed
                              ? "bg-success-200 hover:bg-success-300"
                              : "bg-secondary hover:bg-secondary-600"
                          } hover:scale-110 text-white rounded-lg`}
                          onClick={() => handleNavigation(module.id, lesson.id, "quiz")}
                        >
                          Quiz
                        </button>
                      )}
  
                      {lesson.assignment && (
                        <button
                          className={`px-4 py-2 ${
                            assignmentPassed
                              ? "bg-success-200 hover:bg-success-300"
                              : "bg-warning hover:bg-warning-600"
                          } hover:scale-110 text-white rounded-lg`}
                          onClick={() =>
                            handleNavigation(module.id, lesson.id, "assignment")
                          }
                        >
                          Zadanie
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  }