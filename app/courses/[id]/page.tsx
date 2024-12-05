"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@nextui-org/card";
import Link from "next/link";
import { Computer, ScrollText, Trophy } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

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
            showToast("Nie udało się pobrać statystyk.", true);

            return;
          }
  
          const stats = await response.json();
          
          setLessonStats(stats);
        } catch (error) {
          showToast(`Błąd podczas pobierania statystyk.", ${error}`, true );
        }
      };
  
      loadCourse();
      loadLessonStats();
    }, [courseId, auth, router]);
  
    const getLessonStats = (lessonId: string) =>
      lessonStats.find((stat) => stat.lesson_id === lessonId);
  
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
        <div className="fixed inset-0 z-50 flex items-center justify-center pb-40 bg-black/70 backdrop-blur-sm">
          <Spinner color="primary" label="Ładowanie kursu.." labelColor="primary" size="lg" />
        </div>
      );
    }
  
    return (
      <div className="sm:p-6 p-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-500">{course?.name}</h1>
          <p className="text-lg text-default-600">{course?.description}</p>
        </div>
  
        {course?.modules.map((module, moduleIndex) => (
          <div key={module.id} className="mb-6 border border-default-200 rounded-lg p-4 ">
            <h2 className="text-xl font-semibold text-primary-600 mb-4">{module.name}</h2>
  
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
                      lessonCompleted ? "bg-success-100 border-success-700" : " border-default-300"
                    } ${lessonUnlocked ? "" : "opacity-40 pointer-events-none"}`}
                  >
                    <h3 className="text-lg font-medium text-default-800 mb-8">{lesson.topic}</h3>
                    <div className="flex flex-wrap flex-col sm:flex-row gap-4 mt-2">
                      {lesson.introduction && (
                        <Card className={`sm:w-[8rem] h-[4rem] hover:scale-110 ${introductionCompleted? "bg-success-300 border-success-700" : "border-warning-600 bg-warning-50"} border-2`}>
                        <Link className=" text-default-900 flex flex-col justify-center items-center h-full cursor-pointer" 
                            href={`/course/${course?.id}/module/${module.id}/lesson/${lesson.id}/introduction`}>
                          <ScrollText />
                          <h3 className={`text-sm text-center text-default-900 font-semibold`}>Wprowadzenie</h3>
                        </Link>
                      </Card>
                      )}
  
                      {lesson.quiz.length > 0 && (
                        <Card className={`sm:w-[8rem] h-[4rem] hover:scale-110 ${quizPassed? "bg-success-300 border-success-700" : "border-secondary-600 bg-secondary-50"} border-2`}>
                        <Link className=" text-default-900 flex flex-col justify-center items-center h-full cursor-pointer" 
                            href={`/course/${course?.id}/module/${module.id}/lesson/${lesson.id}/quiz`}>
                          <Trophy />
                          <h3 className={`text-sm text-center text-default-900 font-semibold`}>Quiz</h3>
                        </Link>
                      </Card>
                      )}
  
                      {lesson.assignment && (
                        <Card className={`sm:w-[8rem] h-[4rem] hover:scale-110 ${assignmentPassed? "bg-success-300 border-success-700" : "border-danger-600 bg-danger-50"} border-2`}>
                        <Link className=" text-default-900 flex flex-col justify-center items-center h-full cursor-pointer" 
                            href={`/course/${course?.id}/module/${module.id}/lesson/${lesson.id}/assignment`}>
                          <Computer />
                          <h3 className={`text-sm text-center  font-semibold`}>Zadanie</h3>
                        </Link>
                      </Card>
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