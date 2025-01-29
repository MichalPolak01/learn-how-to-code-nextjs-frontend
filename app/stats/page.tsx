"use client"

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Tab, Tabs } from "@nextui-org/tabs";
import React, { Key, useState } from "react";

import { useAuth } from "@/providers/authProvider";
import OverallStats from "@/components/stats/overall";
import CoursesStats from "@/components/stats/courses";
import TeacherLessonStats from "@/components/stats/teacher-courses";


export default function Page() {
  const [selected, setSelected] = useState("account-settings");

  const handleSelectionChange = (key: Key) => {
    setSelected(key as string);
  };

  const auth = useAuth();

  return (
    <div className="flex flex-col justify-center mt-10">
      <Card className="w-full p-8">
        <CardHeader className="p-2 flex-col items-start border-b-2 border-default-200 mb-4">
          <h1 className="text-primary text-4xl font-semibold mb-2">Witaj {auth.username}</h1>
          <h2 className="text-default-500 text-md italic">Poniżej znajdziesz ranking osiągnięć w kursach - nie poddawaj się, bo to właśnie Ty możesz zostać numerem jeden! Każda wykonana lekcja przybliża Cię do tego celu!</h2>
        </CardHeader>
        <CardBody className="overflow-hidden flex flex-col">
          <Tabs
            aria-label="Tabs form"
            className="vertical-tabs"
            isVertical={false}
            selectedKey={selected}
            size="md"
            onSelectionChange={handleSelectionChange}
          >
            <Tab key="overall" title="Ogólne">
              <OverallStats />
            </Tab>
            <Tab key="course" title="Statystyki kursów">
              <CoursesStats />
            </Tab>
            {auth.role === "TEACHER" &&
              <Tab key="lessons" title="Statystyki lekcji">
                <TeacherLessonStats />
              </Tab>
            }
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}