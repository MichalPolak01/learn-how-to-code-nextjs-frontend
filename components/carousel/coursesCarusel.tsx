"use client"

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Spinner } from '@nextui-org/spinner';

import CourseCard from './courseCard';

import { useAuth } from '@/providers/authProvider';
import { showToast } from '@/lib/showToast';


interface CourseCaruselProps {
  title: string;
  sortBy?: string;
}

const COURSE_URL = "/api/course";

export default function CourseCarusel({ title, sortBy }: CourseCaruselProps) {
  const [courses, setCourses] = useState<CoursePreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      setLoading(true);
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

      setLoading(false);
    };

    fetchCourses();
  }, [sortBy]);

  return (
    <div className="pt-16" id={sortBy}>
      <div className="flex md:flex-row gap-2 flex-col items-center justify-center relative">
        <div className="flex-1" />
        <h2 className="text-2xl text-primary-500 font-semibold text-center">
          {title}
        </h2>
        <div className='flex-1 flex justify-end flex-row items-center'>
          <Link
            className="underline text-default-500 hover:text-default-800 hover:scale-105"
            href={`/courses?filter=${sortBy}`}
            title="Zobacz wszystkie"
          >
            Zobacz wszystkie
          </Link>
          <ChevronRight />
        </div>

      </div>
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        <div className="absolute left-0 top-6 xl:h-[17rem] md:h-[16rem] sm:h=[14rem] h-[20rem] md:w-40 w-10 bg-gradient-to-r from-default-50 to-transparent z-10 pointer-events-none md:visible invisible" />
        <div className="absolute right-0 top-6 xl:h-[17rem] md:h-[16rem] sm:h=[14rem] h-[20rem] md:w-40 w-10 bg-gradient-to-r from-transparent to-default-50 z-10 pointer-events-none md:visible invisible" />

        {loading &&
          <div className="h-[17rem] flex flex-row gap-4 justify-center items-center">
            <Spinner />
            <p className="text-md">Loading courses...</p>
          </div>
        }

        <div ref={emblaRef} className="embla__viewport w-full">
          <div className="embla__container flex items-center gap-1">

            {courses.map((course) => (
              <div
                key={course.id}
                className="embla__slide px-0 sm:py-6 py-1 sm:flex-[0_0_40%] flex-[0_0_70%] sm:px-4"
              >
                <CourseCard course={course} loading={loading} />
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