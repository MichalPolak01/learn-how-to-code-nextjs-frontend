"use client"

import dynamic from "next/dynamic";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { ChevronDown, ChevronLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { Reorder } from "motion/react"
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import QuizEditor from "@/components/course_wizard/quizEditor";


export default function LessonAccordionItem({
  creator_state,
  lesson,
  onUpdateLesson,
  onRemoveLesson,
}: {
  creator_state: string,
  lesson: Lesson;
  onUpdateLesson: (updatedLesson: Lesson) => void;
  onRemoveLesson: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Reorder.Item
      className="bg-default-300 rounded-xl shadow p-4 "
      id={lesson.id}
      value={lesson}
    >
      <div className="flex items-center gap-2">
        <div className="cursor-grab flex items-center justify-center w-6 h-6 mr-2">
          <span className="icon text-xl text-default-600">⋮⋮</span>
        </div>
        <Input
          color="default"
          isDisabled={creator_state != "lesson-topics" && creator_state != "edit"}
          placeholder="Podaj nazwę lekcji"
          type="text"
          value={lesson.topic}
          onChange={(e) =>
            onUpdateLesson({ ...lesson, topic: e.target.value })
          }
        />
        <Button color="danger" variant="shadow" onClick={onRemoveLesson}>
          <Trash2 />
        </Button>
        <Button
          className="bg-default-400 text-white"
          variant="shadow"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? <ChevronDown /> : <ChevronLeft />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-16">
          <Accordion
            isCompact={true}
            isDisabled={creator_state != "lesson-content" && creator_state != "edit"}
            selectionMode="multiple"
            variant="splitted"
          >
            <AccordionItem title="Wprowadzenie do lekcji">
              <ReactQuill
                theme="snow"
                value={lesson.introduction.description || ""}
                onChange={(content) =>
                  onUpdateLesson({
                    ...lesson,
                    introduction: {
                      id: lesson.introduction.id || Date.now().toString(),
                      description: content,
                    },
                  })
                }
              />
            </AccordionItem>

            <AccordionItem title="Quiz">
              <QuizEditor
                quiz={{
                  id: lesson.id,
                  questions: lesson.quiz,
                }}
                onUpdateQuiz={(updatedQuiz) =>
                  onUpdateLesson({
                    ...lesson,
                    quiz: updatedQuiz.questions,
                  })
                }
              />
            </AccordionItem>

            <AccordionItem title="Zadanie">
              <ReactQuill
                theme="snow"
                value={lesson.assignment.instructions || ""}
                onChange={(content) =>
                  onUpdateLesson({
                    ...lesson,
                    assignment: {
                      id: lesson.assignment?.id || Date.now().toString(),
                      instructions: content,
                    },
                  })
                }
              />
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Reorder.Item>
  );
};