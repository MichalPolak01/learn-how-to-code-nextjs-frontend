"use client"

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Switch } from "@nextui-org/switch";
import "react-quill/dist/quill.snow.css";


export default function QuizEditor({
  quiz,
  onUpdateQuiz,
}: {
  quiz: Quiz;
  onUpdateQuiz: (updatedQuiz: Quiz) => void;
}) {
  const handleAddQuestion = () => {
    onUpdateQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          id: Date.now().toString(),
          question: "Nowe pytanie",
          answers: [
            { id: Date.now().toString(), answer: "Odpowiedź 1", is_correct: false },
          ],
        },
      ],
    });
  };

  const handleRemoveQuestion = (qIndex: number) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.filter((_, i) => i !== qIndex),
    });
  };

  const handleQuestionChange = (qIndex: number, question: string) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex ? { ...q, question } : q
      ),
    });
  };

  const handleAddOption = (qIndex: number) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              answers: [
                ...q.answers,
                {
                  id: Date.now().toString(),
                  answer: `Nowa odpowiedź ${q.answers.length + 1}`,
                  is_correct: false,
                },
              ],
            }
          : q
      ),
    });
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              answers: q.answers.filter((_, j) => j !== oIndex),
            }
          : q
      ),
    });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === oIndex ? { ...a, answer: value } : a
              ),
            }
          : q
      ),
    });
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) => ({
                ...a,
                is_correct: j === oIndex,
              })),
            }
          : q
      ),
    });
  };

  return (
    <div>
      {quiz.questions.map((question, qIndex) => (
        <div key={question.id} className="mb-4 p-4 border rounded">
          <div className="flex justify-between items-center mb-2 gap-2">
            <Input
              placeholder="Podaj pytanie"
              value={question.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
            />
            <Button
              color="danger"
              size="md"
              onClick={() => handleRemoveQuestion(qIndex)}
            >
              Usuń Pytanie
            </Button>
          </div>
          {question.answers.map((option, oIndex) => (
            <div key={option.id} className="flex items-center gap-2 mt-2 ml-8">
              <Input
                placeholder={`Odpowiedź ${oIndex + 1}`}
                value={option.answer}
                onChange={(e) =>
                  handleOptionChange(qIndex, oIndex, e.target.value)
                }
              />
              <Switch
                isSelected={option.is_correct}
                onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
              />
              <Button
                color="danger"
                size="sm"
                onClick={() => handleRemoveOption(qIndex, oIndex)}
              >
                Usuń
              </Button>
            </div>
          ))}
          <Button
            className="ml-8 mt-4"
            size="sm"
            onClick={() => handleAddOption(qIndex)}
          >
            Dodaj Odpowiedź
          </Button>
        </div>
      ))}
      <Button className="my-4 ml-1" onClick={handleAddQuestion}>
        Dodaj Pytanie
      </Button>
    </div>
  );
}
