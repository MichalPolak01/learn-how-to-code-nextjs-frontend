"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import FilterCarousel from "@/components/filterCarousel";
import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";
import CourseCard from "@/components/carousel/courseCard";

const COURSE_URL = "/api/course";


export default function CoursesPage() {
    const searchParams = useSearchParams();
    const filter = searchParams.get("filter");
    const [activeFilter, setActiveFilter] = useState<string>(filter? filter : "");
    const [courses, setCourses] = useState<CoursePreview[]>([]);
    const auth = useAuth();

    const fetchCourses = async (filter: string) => {
        const query = new URLSearchParams({
            ...(filter && { sortBy: filter })
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
        } else if (response.status === 401) {
            auth.loginRequired();
        } else {
            showToast("Nie udało się wczytać kursów.", true);
        }
    };

    useEffect(() => {
        fetchCourses(activeFilter);
    }, [activeFilter]);

    return (
        <>
            <FilterCarousel activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <div className="flex flex-row flex-wrap gap-2 justify-center">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="embla__slide px-2 md:py-8 py-4 md:flex-[0_0_40%] flex-[0_0_70%] md:px-4"
                    >
                        <CourseCard course={course} />
                    </div>
                ))}
            </div>
        </>
    );
}