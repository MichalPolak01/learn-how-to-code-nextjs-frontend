"use client"

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ChevronDown, ChevronLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { Reorder } from "motion/react"

import "react-quill/dist/quill.snow.css";
import LessonAccordionItem from "@/components/course_wizard/lessonAccordionItem";


export default function ModuleAccordionItem({
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
}) {
  const [isExpanded, setIsExpanded] = useState(false);

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