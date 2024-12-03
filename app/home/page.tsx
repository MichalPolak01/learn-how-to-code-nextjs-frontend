"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Divider } from '@nextui-org/divider';
import CountUp from 'react-countup';
import { Button } from '@nextui-org/button';
import { ChevronRight } from 'lucide-react';

import { useAuth } from '@/providers/authProvider';
import CourseCarusel from '@/components/carousel/coursesCarusel';
import CarouselOptions from '@/components/carousel/caruselOptions';
import { showToast } from '@/lib/showToast';


const COURSES_STATS_URL = "/api/teacher/course/stats";

export default function Home() {
    const [coursesStats, setCoursesStats] = useState<CourseStats>();

    const auth = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
    
          const response = await fetch(COURSES_STATS_URL, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          if (response.ok) {
            const data: CourseStats = await response.json();
    
            setCoursesStats(data);
          } else if (response.status == 401) {
            auth.loginRequired();
          } else {
            showToast("Nie udało się wczytać statystyk.", true);
          }
        };
    
        fetchCourses();
      }, []);

    return (
        <div>
            <div className="relative h-[32svh] w-full sm:py-8 py-3 sm:px-16 px-0 rounded-2xl overflow-hidden flex flex-col justify-between">
                <Image 
                    alt="Home background" 
                    className="absolute inset-0 object-cover w-full h-full blur-sm" 
                    height={100} 
                    src="/images/home.jpg"
                    width={100}
                />

                <div className="absolute inset-0 bg-black opacity-65" />

                <div className='flex flex-col gap-2 sm:scale-100 scale-80'>
                    <h1 className="relative z-10 text-white text-4xl font-semibold italic">
                        Witaj ponownie w <span className='text-primary-500 font-bold'>LearnHowToCode!</span> 
                    </h1>
                    <h2 className="relative z-10 text-white text-lg font-extralight italic">
                        Jakiego języka programowania się dziś nauczysz?
                    </h2>
                </div>
                <div className='relative z-10 w-full flex flex-col sm:items-end items-center sm:scale-100 scale-80'>
                    <div className='flex flex-col'>
                        <h3 className='text-xl mb-4 text-white font-bold text-center'><span className='text-primary'>LearnHowToCode</span> w liczbach:</h3>
                        <div className='flex flex-row gap-6'>
                            <div className='flex flex-col  items-center'>
                                <h4 className='text-2xl text-success font-bold'>
                                <CountUp duration={5} end={coursesStats?.courses_count || 0} start={0} />
                                </h4>
                                <h5 className='text-sm uppercase font-light text-white'>Kursów</h5>
                            </div>
                            <Divider className='bg-white' orientation='vertical' />
                            <div className='flex flex-col  items-center'>
                                <h4 className='text-2xl text-success font-bold'>
                                <CountUp duration={5} end={coursesStats?.students_count || 0} start={0} />
                                </h4>
                                <h5 className='text-sm uppercase font-light text-white text-center'>Zadowolonych<br/>kursantów</h5>
                            </div>
                            <Divider className='bg-white' orientation='vertical' />
                            <div className='flex flex-col  items-center'>
                                <h4 className='text-2xl text-success font-bold'>
                                    <CountUp duration={5} end={coursesStats?.completed_lessons || 0} start={0} />
                                </h4>
                                <h5 className='text-sm uppercase font-light text-white text-center'>Ukończonych<br/>lekcji</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CarouselOptions />

            {auth.role === "TEACHER" &&
                <CourseCarusel sortBy='my' title='Moje kursy' />
            }
            <CourseCarusel sortBy='highest-rated' title='Najwyżej oceniane' />
            <CourseCarusel sortBy='most-popular' title='Najpopularniejsze' />
            <CourseCarusel sortBy='latest' title='Najnowsze' />

            <div className='flex justify-center pt-24 pb-8'>
                <Button className='hover:scale-110' color='primary' radius='full' size="lg" variant='shadow' onClick={() => "click"}>
                    Zobacz wszytkie kursy
                    <ChevronRight />
                </Button>
            </div>

        </div>
    )
}