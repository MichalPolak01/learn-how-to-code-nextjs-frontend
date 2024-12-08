"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useAuth } from "@/providers/authProvider";
import { showToast } from "@/lib/showToast";


const COURSE_URL = "/api/course";

export default function QuizPage({ params }: { params: { id: string; lessonId: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [lessonStats, setLessonStats] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(0.0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const auth = useAuth();
  const router = useRouter();
  const { id, lessonId } = params;


  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const [response, response2] = await Promise.all([
          fetch(`${COURSE_URL}/${id}/module/0/lesson/${lessonId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`${COURSE_URL}/${id}/stats`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (response.status === 401 || response2.status === 401) {
          auth.loginRequired();

          return;
        }

        if (response.status === 403) {
          showToast("Nie masz odpowiednich uprawnień aby zobaczyć tą lekcję.", true);
          router.push(id ? `/courses/${id}` : `/courses`);

          return;
        }

        if (!response.ok || !response2.ok) {
          throw new Error("Response not ok.");
        }

        const [data, stats] = await Promise.all([response.json(), response2.json()]);

        setQuiz({ id: lessonId, questions: data.quiz });

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
        showToast("Nie udało się pobrać quizu.", true);
        router.push(id ? `/courses/${id}` : `/courses`);
      }
    };

    fetchQuizData();
  }, [id, lessonId, auth, router]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = async () => {
    if (!quiz?.questions || !quiz.questions.length || !selectedOption) {
      return;
    }

    if (selectedOption) {
      const isCorrect = currentQuestion?.answers.find(
        (option) => option.id === selectedOption
      )?.is_correct;

      if (isCorrect) {
        setScore((prevScore) => prevScore + 1);
      }

      setSelectedOption(null);

      if (currentQuestionIndex + 1 < quiz?.questions.length!) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        const finalResult = Math.round(((score + (isCorrect ? 1 : 0)) / quiz?.questions?.length) * 100);

        setResult(finalResult);
        setShowSummary(true);
        await updateLessonStats(finalResult);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowSummary(false);
  };

  const updateLessonStats = async (finalResult: number) => {
    try {
      const response = await fetch(`${COURSE_URL}/${id}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId,
          quiz_score: finalResult
        }),
      });

      if (response.status === 401) {
        auth.loginRequired();

        return;
      }

      if (!response.ok) {
        throw new Error("Response not ok.")
      }

    } catch {}
  }

  const handleBackToCourse = () => {
    router.push(`/courses/${id}`);
  };

  const handleCompleteQuiz = async () => {
    
    router.push(`/courses/${id}/lesson/${lessonId}/assignment`);
  };

  if (!quiz) {
    return (
      <div className="flex flex-row gap-4 h-full justify-center items-center">
        <Spinner />
        <p className="text-md">Ładowanie Quiu...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center pb-32 items-center h-full">
      <Card className="p-8 w-full">
        {!showSummary ? (
          <>
            <div className="flex justify-between">
              <h1 className="text-2xl text-primary-500 font-bold">{`Pytanie ${currentQuestionIndex + 1}/${quiz.questions.length}`}</h1>
              <div className="text-md text-default-600 font-light">
                {(lessonStats && lessonStats.quiz_score != 0) && <p>Najlepszy wynik: {Math.max(lessonStats.quiz_score, result)}%</p>}
              </div>
            </div>
            <p className="mt-4 text-lg">{currentQuestion?.question}</p>
            <div className="options-container mt-4">
              {currentQuestion?.answers.map((option) => (
                <button
                  key={option.id}
                  className={`option-button ${selectedOption === option.id
                      ? "bg-blue-500 text-white"
                      : "bg-default-200"
                    } p-2 rounded-lg my-2 w-full text-left`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  {option.answer}
                </button>
              ))}
            </div>
            <Button
              className="next-button bg-blue-500 text-white p-2 rounded-lg mt-4"
              disabled={!selectedOption}
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex + 1 === quiz.questions.length
                ? "Finish Quiz"
                : "Next Question"}
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            <h2 className="text-3xl text-primary font-bold mb-8">Podsumowanie Quizu</h2>
            <h3 className="text-3xl text-primary">
              Zdobyto:{" "}
              <span
                className={`${result >= 75
                    ? "text-success"
                    : result >= 0.5
                      ? "text-warning"
                      : "text-danger"
                  } font-bold`}
              >
                {result}%
              </span>
            </h3>
            <p className="text-xl font-semibold">
              Punkty:{" "}
              <span
                className={`${result >= 75
                    ? "text-success"
                    : result >= 0.5
                      ? "text-warning"
                      : "text-danger"
                  } font-bold`}
              >
                {score}/{quiz.questions.length}
              </span>
            </p>

            <Button className="mt-8 hover:scale-105" color="primary" variant="shadow" onClick={handleRestartQuiz}>
              Uruchom ponownie quiz
            </Button>

            <div className="w-full flex sm:flex-row flex-col-reverse gap-2 justify-between mt-8">
              <Button className="hover:scale-105" color="default" variant="light" onClick={handleBackToCourse}>
                <ChevronLeft /><span className="underline text-md font-semibold underline-offset-1">Powrót do strony kursu</span>
              </Button>
              <Button className="hover:scale-105" color="primary" variant="light" onClick={handleCompleteQuiz}>
                <span className="underline text-md font-semibold underline-offset-1">Przejdź do Zadania</span><ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}