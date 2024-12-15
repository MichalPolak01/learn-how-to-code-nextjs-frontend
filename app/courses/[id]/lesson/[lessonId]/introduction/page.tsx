"use client";

import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { Spinner } from "@nextui-org/spinner";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";

interface IntroductionPageProps {
  params: {
    id: string;
    lessonId: string;
  };
}

const COURSE_URL = "/api/course";

export default function IntroductionPage({ params }: IntroductionPageProps) {
  const { id, lessonId } = params;
  const router = useRouter();
  const [introduction, setIntroduction] = useState<string | null>(null);
  const [lessonStats, setLessonStats] = useState<any>(null);

  const auth = useAuth();

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`${COURSE_URL}/${id}/module/0/lesson/${lessonId}`);

        if (response.status === 401) {
          auth.loginRequired();

          return;
        }

        if (response.status === 403) {
          showToast("Nie masz odpowiednich uprawnień aby zobaczyć tą lekcję.", true);
          if (id) {
            router.push(`/courses/${id}`);
          } else {
            router.push(`/courses`);
          }

          return;
        }

        if (!response.ok) {
          throw new Error("Response not ok.")
        }

        const data = await response.json();

        setIntroduction(data.introduction?.description || null);
      } catch (error) {
        showToast("Nie udało się pobrać wstępu do lekcji.", true);
        if (id) {
          router.push(`/courses/${id}`);
        } else {
          router.push(`/courses`);
        }

        return;
      }
    };

    const fetchLessonStats = async () => {
      try {
        const response = await fetch(`${COURSE_URL}/${id}/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const stats = await response.json();

        if (response.status === 401) {
          auth.loginRequired();

          return;
        }

        if (!response.ok) {
          throw new Error("Response not ok.")
        }

        const currentLessonStats = stats.find((stat: any) => stat.lesson_id === parseInt(lessonId));

        if (!currentLessonStats.introduction_completed) {
          await updateLessonStats();
        }

        if (!currentLessonStats) {
          showToast("Ta lekcja jest jeszcze zablokowana.\nWykonaj poprzednie lekcje, aby ją odblokować.", true);
          if (id) {
            router.push(`/courses/${id}`);
          } else {
            router.push(`/courses`);
          }

          return;
        }

        setLessonStats(currentLessonStats);
      } catch (error) {
        showToast("Nie udało się pobrać wstępu do lekcji.", true);
        if (id) {
          router.push(`/courses/${id}`);
        } else {
          router.push(`/courses`);
        }

        return;
      }
    };

    fetchLessonData();
    fetchLessonStats();
  }, [id, lessonId]);

  const updateLessonStats = async () => {
    try {
      const response = await fetch(`${COURSE_URL}/${id}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId,
          introduction_completed: true,
        }),
      });

      if (response.status === 401) {
        auth.loginRequired();

        return;
      }

      if (!response.ok) {
        throw new Error("Response not ok.")
      }
    } catch { }
  }

  const handleNext = () => {
    router.push(`/courses/${id}/lesson/${lessonId}/quiz`);
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${id}`);
  };

  if (!introduction) {
    return (
      <div className="flex flex-row gap-4 h-full justify-center items-center">
        <Spinner />
        <p className="text-md">Loading introduction...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex sm:flex-row flex-col gap-2 justify-between items-center mb-6 px-4">
        <h1 className="text-3xl text-primary font-bold">Wprowadzenie</h1>
        {(lessonStats && lessonStats.introduction_completed) && <div className="flex items-center gap-2 text-success"><BadgeCheck /><span>Ukończono</span></div>}
      </div>
      <Card className="p-8">
        <div
          dangerouslySetInnerHTML={{ __html: introduction }}
          className="prose max-w-none"
        />
      </Card>
      <div className="flex sm:flex-row flex-col-reverse gap-2 justify-between mt-8">
        <Button className="hover:scale-105" color="default" variant="light" onClick={handleBackToCourse}>
          <ChevronLeft /><span className="underline text-md font-semibold underline-offset-1">Powrót do strony kursu</span>
        </Button>
        <Button className="hover:scale-105" color="primary" variant="light" onClick={handleNext}>
          <span className="underline text-md font-semibold underline-offset-1">Przejdź do Quizu</span><ChevronRight />
        </Button>
      </div>
    </div>
  );
}
