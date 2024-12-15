"use client";

import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { FileSpreadsheet, Pencil, StarIcon, Users } from "lucide-react";
import { Image } from "@nextui-org/image";
import { useRouter } from "next/navigation";
import { Chip } from "@nextui-org/chip";

import { useAuth } from "@/providers/authProvider";


interface CardProps {
  course: CoursePreview;
  isEnrolled: boolean
}

export default function CourseCard({ course, isEnrolled }: CardProps) {
  const auth = useAuth();
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/courses/${course.id}`);
  };

  const handleEditQuiz = () => {
    router.push(`/course-wizard/${course?.id}`);
  };

  return (
    <Card className="xl:w-[35rem] xl:h-[17rem] sm:h-[16rem] h-[20rem] sm:w-[30rem] w-full sm:scale-100 scale-90">
      <Link
        className="md:pt-4 pt-6 text-default-900 flex flex-col h-full cursor-pointer hover:bg-default-100"
        onClick={handleCardClick}
      >
        {isEnrolled ?
          <Chip className="z-10 absolute right-2 top-2 flex text-white italic" color="success" size="sm">
            Rozpoczety
          </Chip>
          :
          (new Date().getTime() - new Date(course.last_updated).getTime() < 2 * 24 * 60 * 60 * 1000) ?
            <Chip className="absolute right-2 top-2 flex text-white italic" color="warning" size="sm">
              Nowy
            </Chip>
            : null
        }
        <CardBody className="overflow-visible md:py-2 flex md:flex-row flex-col">
          {/* Course Image */}
          <div className="md:w-2/5 w-full md:h-full h-24 overflow-hidden">
            <Image
              isZoomed
              alt="Card image"
              className="object-cover w-full xl:h-[9rem] md:h-[8rem] rounded-xl"
              src={course.image != "" ? course.image : "/images/code.jpg"}
            />
          </div>

          {/* Course Details */}
          <div className="px-4 pt-2 md:w-3/5 w-full flex flex-col justify-between">
            <div className="flex flex-col">
              <h4 className="font-bold text-small sm:text-medium md:text-large mt-2 md:mt-0 md:line-clamp-2 line-clamp-1">
                {course.name}
              </h4>
              <div className="flex flex-row justify-between items-center gap-2">
                <small className="text-default-500">
                  Created by: {course.author.username}
                </small>
                {course.author.username === auth.username && (
                  <Button
                    className="hover:scale-110"
                    color="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditQuiz();
                    }}
                  >
                    <div className="flex items-center text-sm gap-1">
                      <Pencil />
                      Edit
                    </div>
                  </Button>
                )}
              </div>
            </div>

            {/* Course Stats */}
            <div className="flex flex-row justify-between items-end mt-4">
              <div className="flex flex-row gap-1 justify-center items-center">
                <FileSpreadsheet />
                <p className="font-bold text-large">{course.lesson_count}</p>
              </div>
              <div className="flex flex-row gap-1 justify-center items-center">
                <Users />
                <p className="font-bold text-large">{course.student_count}</p>
              </div>
              <div className="flex flex-row gap-1 justify-center items-center">
                <StarIcon />
                <p className="font-bold text-large">
                  {Math.round(course.rating * 10) / 10}/5
                </p>
              </div>
            </div>
          </div>
        </CardBody>

        {/* Footer Section */}
        <CardFooter className="flex flex-col md:gap-4 gap-0 items-start justify-between h-full">
          <p className="text-tiny px-2 overflow-hidden md:line-clamp-2 line-clamp-1">
            {course.description}
          </p>
          <small className="w-full pr-2 text-default-500 text-tiny font-extralight italic text-right">
            Last updated: {new Date(course.last_updated).toLocaleString()}
          </small>
        </CardFooter>
      </Link>
    </Card>
  );
}