"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@nextui-org/spinner";

import FilterCarousel from "@/components/filterCarousel";
import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";
import CourseCard from "@/components/carousel/courseCard";

const COURSE_URL = "/api/course";


export default function CoursesPage() {
    const searchParams = useSearchParams();
    const filter = searchParams.get("filter");
    const [activeFilter, setActiveFilter] = useState<string>(filter ? filter : "enrolled");
    const [courses, setCourses] = useState<CoursePreview[]>([]);
    const [isEnrolled, setIsEnrolled] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const auth = useAuth();

    const fetchCourses = async (filter: string) => {
        setLoading(true);

        setCourses([]);
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

        setLoading(false);
    };

    const checkIsEnrolled = async () => {

        const response = await fetch(`${COURSE_URL}/0/enroll`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data: number[] = await response.json();

            setIsEnrolled(data)
        } else if (response.status == 401) {
            auth.loginRequired();
        } else {
            // Do nothing
        }
    }

    useEffect(() => {
        fetchCourses(activeFilter);
        checkIsEnrolled();
    }, [activeFilter]);

    return (
        <>
            <FilterCarousel activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            {loading &&
                <div className="flex flex-row gap-4 h-full pb-80 justify-center items-center">
                    <Spinner />
                    <p className="text-md">Loading courses...</p>
                </div>
            }
            <div className="flex flex-row flex-wrap gap-2 justify-center mt-4">
                {courses.length === 0 &&
                    <p className="font-semibold italic mt-8">Nie zapisałeś się jeszcze do żadnego kursu!</p>
                }
                {courses.map((course) => {
                    const enrolled = isEnrolled.includes(Number(course.id));

                    return (
                        <div key={course.id} className="px-2 sm:py-4 py-1 md:px-4">
                            <CourseCard course={course} isEnrolled={enrolled} />
                        </div>
                    )
                })}
            </div>
        </>
    );
}