"use client";

import { Card } from "@nextui-org/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function IntroductionPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const { id, lessonId } = params;
  const router = useRouter();
  const [introduction, setIntroduction] = useState<string | null>(null);
  const [lessonStats, setLessonStats] = useState<any>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`/api/teacher/course/${id}/module/134/lesson/${lessonId}`);
        const data = await response.json();
        setIntroduction(data.introduction?.description || null);
      } catch (error) {
        console.error("Error fetching lesson data:", error);
      }
    };

    const fetchLessonStats = async () => {
      try {
        const response = await fetch(`/api/teacher/course/${id}/stats`);
        const stats = await response.json();
        setLessonStats(stats.find((stat: any) => stat.lesson_id === parseInt(lessonId)));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchLessonData();
    fetchLessonStats();
  }, [id, lessonId]);

  const handleNext = () => {
    router.push(`/course/${id}/module/lesson/${lessonId}/quiz`);
  };
  

  if (!introduction) {
    return <p>Loading introduction...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Wprowadzenie</h1>
      <Card className="p-4">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: introduction }}
        />
      </Card>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleNext}
      >
        Przejdź do Quizu
      </button>
    </div>
  );
}
