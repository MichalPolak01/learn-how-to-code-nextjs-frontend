"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@nextui-org/card";
import { Spinner } from "@nextui-org/spinner";
import { BookmarkPlus, Computer, ScrollText, Star, Trophy } from "lucide-react";

import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";


const COURSE_URL = "/api/course";

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
    const [isEnrolled, setIsEnrolled] = useState(true);
    const [rating, setRating] = useState(3);
  
    const auth = useAuth();
    const router = useRouter();
  
    const loadCourse = async () => {
      if (!courseId) return;

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

    const loadLessonStats = async () => {
      try {
        const response = await fetch(`${COURSE_URL}/${courseId}/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 404) {
          setIsEnrolled(false);

          return;
        }

        if (!response.ok) {
          throw new Error("Response not ok.")
        }

        const stats = await response.json();
        
        setIsEnrolled(true);
        setLessonStats(stats);
      } catch (error) {
        showToast(`Błąd podczas pobierania statystyk. ${error}`, true );
      }
    };

    useEffect(() => {
      loadCourse();
      loadLessonStats();
    }, [courseId, auth, router]);

    const handleEnrollToCourse = async () => {
      try {
        const response = await fetch(`${COURSE_URL}/${courseId}/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({

          }),
        });
  
        if (response.status === 401) {
          auth.loginRequired();
  
          return;
        }
  
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData?.message || "Nieznany błąd.";

          throw new Error(errorMessage);
        }

        showToast("Pomyślnie zapisano do kursu!", false);
        showToast("Odblokowano pierwszą lekcję w kursie!", false);
        await loadLessonStats();
      } catch (error) {
        showToast(`Błąd podczas zapisywania do kursu. ${error}`, true );
      }
    }

  const handleRating = (index: number) => {
    setRating(index);
    updateCourseRating(index);
  };
  
  const updateCourseRating = async (ratingValue: number) => {
    try {
      const response = await fetch(`${COURSE_URL}/${courseId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: ratingValue,
        }),
      });
  
      if (response.status === 401) {
        auth.loginRequired();

        return;
      }
  
      if (!response.ok) {
        throw new Error("Response not ok.");
      }
  
      showToast(`Ustawiono ocenę kursu na ${ratingValue}!`, false);
      await loadLessonStats();
    } catch (error) {
      showToast(`Błąd podczas ustawiania oceny kursu. ${error}`, true);
    }
  };
  

    const getLessonStats = (lessonId: string) =>
      lessonStats.find((stat) => stat.lesson_id === lessonId);
  
    const isLessonUnlocked = (lessonId: string) => {
      return !!getLessonStats(lessonId);
    };
  
    if (!course) {
      return (
        <div className="flex flex-row gap-4 h-full justify-center items-center">
          <Spinner />
          <p className="text-md">Ładowanie kursu...</p>
        </div>
      );
    }
  
    return (
      <div className="sm:p-6 p-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-500">{course?.name}</h1>
          <p className="text-lg text-default-600">{course?.description}</p>

          {!isEnrolled ?
            <Card className={`mt-4 sm:w-[12rem] h-[5rem] hover:scale-110 border-primary-600 bg-primary-50 border-2`}>
            <button className="flex flex-col justify-center items-center h-full cursor-pointer" onClick={handleEnrollToCourse}
                >
                 <BookmarkPlus className="text-primary-600" />
                 <h3 className={`text-sm text-center text-primary-600 font-semibold`}>Zapisz się do kursu</h3>
            </button>
          </Card>
          :
          <div>
            <p className="mt-8 mb-2 text-lg text-primary font-semibold">Ocneń kurs:</p>
          <div className="flex flex-row gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                  key={index}
                  className={`w-8 h-8 cursor-pointer ${index < rating ? "text-warning" : "text-default-300"}`}
                  onClick={() => handleRating(index + 1)}
              />
            ))}
          </div>
          </div>
          }

        </div>

        {course?.modules.map((module) => (
          <div key={module.id} className="mb-6 border border-default-200 rounded-lg p-4 ">
            <h2 className="text-xl font-semibold text-primary-600 mb-4">{module.name}</h2>
  
            <ul className="space-y-4">
              {module.lessons.map((lesson) => {
                const stats = getLessonStats(lesson.id);
  
                const introductionCompleted = stats?.introduction_completed || false;
                const quizPassed = stats?.quiz_score !== null && stats?.quiz_score !== undefined && stats.quiz_score >= 60;
                const assignmentPassed = stats?.assignment_score !== null && stats?.assignment_score !== undefined && stats.assignment_score >= 60;

                const lessonCompleted = stats?.lesson_completed || false;
                const lessonUnlocked = isLessonUnlocked(lesson.id);
  
                return (
                  <li
                    key={lesson.id}
                    className={`border rounded-lg p-4 shadow-sm ${
                      lessonCompleted ? "bg-success-100 border-success-700" : " border-default-300"
                    } ${lessonUnlocked ? "bg-success-100 border-success-700" : "opacity-40 pointer-events-none"}`}
                  >
                    <h3 className="text-lg font-medium text-default-800 mb-8">{lesson.topic}</h3>
                    <div className="flex flex-wrap flex-col sm:flex-row gap-4 mt-2">
                      {lesson.introduction && (
                        <Card className={`sm:w-[8rem] h-[4rem] hover:scale-110 ${introductionCompleted? "bg-success-300 border-success-700" : "border-warning-600 bg-warning-50"} border-2`}>
                        <Link className=" text-default-900 flex flex-col justify-center items-center h-full cursor-pointer" 
                            href={`/courses/${course?.id}/lesson/${lesson.id}/introduction`}>
                          <ScrollText />
                          <h3 className={`text-sm text-center text-default-900 font-semibold`}>Wprowadzenie</h3>
                        </Link>
                      </Card>
                      )}
  
                      {lesson.quiz.length > 0 && (
                        <Card className={`sm:w-[8rem] h-[4rem] hover:scale-110 ${quizPassed? "bg-success-300 border-success-700" : "border-secondary-600 bg-secondary-50"} border-2`}>
                        <Link className=" text-default-900 flex flex-col justify-center items-center h-full cursor-pointer" 
                            href={`/courses/${course?.id}/lesson/${lesson.id}/quiz`}>
                          <Trophy />
                          <h3 className={`text-sm text-center text-default-900 font-semibold`}>Quiz</h3>
                        </Link>
                      </Card>
                      )}
  
                      {lesson.assignment && (
                        <Card className={`sm:w-[8rem] h-[4rem] hover:scale-110 ${assignmentPassed? "bg-success-300 border-success-700" : "border-danger-600 bg-danger-50"} border-2`}>
                        <Link className=" text-default-900 flex flex-col justify-center items-center h-full cursor-pointer" 
                            href={`/courses/${course?.id}/lesson/${lesson.id}/assignment`}>
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