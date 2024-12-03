"use client"

import { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import Link from 'next/link';
import { Button } from '@nextui-org/button';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Pencil, StarIcon, Users } from 'lucide-react';
import { Image } from "@nextui-org/image";
import useEmblaCarousel from 'embla-carousel-react';

import { useAuth } from '@/providers/authProvider';
import { showToast } from '@/lib/showToast';


interface CourseCaruselProps {
  title: string;
  sortBy?: string;
}

const COURSE_URL = "/api/teacher/course";

export default function CourseCarusel({ title, sortBy }: CourseCaruselProps) {
  const [courses, setCourses] = useState<CoursePreview[]>([]);

  const auth = useAuth();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, 3000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const handleMouseEnter = () => stopAutoplay();
  const handleMouseLeave = () => startAutoplay();

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

    emblaApi.on("select", onSelect);

    startAutoplay();

    return () => {
      stopAutoplay();
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => {
    stopAutoplay();
    emblaApi?.scrollPrev();
  };
  const scrollNext = () => {
    stopAutoplay();
    emblaApi?.scrollNext();
  };


  useEffect(() => {
    const fetchCourses = async () => {
      const query = new URLSearchParams({
        limit: "5",
        ...(sortBy && { sortBy: sortBy })
      });

      const response = await fetch(`${COURSE_URL}?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: CoursePreview[] = await response.json();

        setCourses(data);
      } else if (response.status == 401) {
        auth.loginRequired();
      } else {
        showToast("Nie udało się wczytać kursów.", true);
      }
    };

    fetchCourses();
  }, [sortBy]);


  return (
    <div className="pt-20" id={sortBy}>
      <h2 className="text-2xl text-primary-500 text-center font-semibold">{title}</h2>

      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute left-0 top-8 h-[16rem] w-40 bg-gradient-to-r from-default-100 to-transparent z-10 pointer-events-none md:visible invisible" />
        <div className="absolute right-0 top-8 h-[16rem] w-40 bg-gradient-to-r from-transparent to-default-100 z-10 pointer-events-none md:visible invisible" />

        <div ref={emblaRef} className="embla__viewport w-full">
          <div className="embla__container flex items-center gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="embla__slide flex-[0_0_95%] px-[10%] md:py-8 py-4 md:flex-[0_0_40%] md:px-4"
              >
                <Card className="h-[16rem] sm:w-[30rem] sm:scale-100 scale-75">
                  <Link
                    className="pt-4 text-default-900 flex flex-col h-full cursor-pointer hover:bg-default-100"
                    href={""}
                  >
                    <CardBody className="overflow-visible py-2 flex flex-row">
                      <div className="w-2/5 h-full">
                        <Image
                          isZoomed
                          alt="Card image"
                          className="object-cover rounded-xl"
                          height={130}
                          src={"https://nextui.org/images/hero-card-complete.jpeg"}
                        />
                      </div>
                      <div className="px-4 w-3/5 flex flex-col justify-between">
                        <div className="flex flex-col">
                          <h4 className="font-bold text-large">{course.name}</h4>
                          <div className="flex flex-row justify-between items-center">
                            <small className="text-default-500">
                              Created by: {course.author.username}
                            </small>
                            {course.author.username === auth.username && (
                              <Button
                                className="hover:scale-110"
                                color="primary"
                                size="sm"
                                onClick={() => console.log("asd")}
                              >
                                <div className="flex items-center text-sm gap-1">
                                  <Pencil />
                                  Edit
                                </div>
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row justify-between items-end">
                          <div className="flex flex-row gap-1 justify-center items-center">
                            <FileSpreadsheet />
                            <p className="font-bold text-large">
                              {course.student_count}
                            </p>
                          </div>
                          <div className="mt-2 flex flex-row gap-1 justify-center items-center">
                            <Users />
                            <p className="font-bold text-large">
                              {course.student_count}
                            </p>
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
                    <CardFooter className="flex flex-col gap-4 items-start justify-between h-full">
                      <p className="text-tiny px-2 overflow-hidden">{course.description}</p>
                      <small className="w-full pr-2 text-default-500 text-tiny font-extralight italic text-right">
                        Last updated:{" "}
                        {new Date(course.last_updated).toLocaleString()}
                      </small>
                    </CardFooter>
                  </Link>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <button
          className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 p-2 bg-default-700 text-default-50 rounded-full hover:bg-default-500"
          onClick={scrollPrev}
        >
          <ChevronLeft />
        </button>
        <button
          className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 p-2 bg-default-700 text-default-50 rounded-full hover:bg-default-500"
          onClick={scrollNext}
        >
          <ChevronRight />
        </button>

        <div className="flex justify-center gap-2 mt-4">
          {courses.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === selectedIndex ? "bg-primary-500" : "bg-gray-400"
                }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>

    </div>
  );
}