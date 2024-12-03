"use client"

import Image from 'next/image'

import { useAuth } from '@/providers/authProvider';
import CourseCarusel from '@/components/carousel/coursesCarusel';
import CarouselOptions from '@/components/carousel/caruselOptions';


export default function Home() {

    const auth = useAuth();

    return (
        <div>
            <div className="relative h-[30svh] w-full p-16 rounded-2xl overflow-hidden flex flex-col justify-start">
                <Image 
                    alt="Home background" 
                    className="absolute inset-0 object-cover w-full h-full blur-sm" 
                    height={100} 
                    src="/images/home.jpg"
                    width={100}
                />

                <div className="absolute inset-0 bg-black opacity-40" />

                <h1 className="relative z-10 text-white text-4xl font-semibold italic">
                    Witaj ponownie w <span className='text-primary-500 font-bold'>LearnHowToCode!</span> 
                </h1>
                <h2 className="relative z-10 text-white text-lg font-extralight italic">
                    Jakiego języka programowania się dziś nauczysz?
                </h2>
            </div>

            <CarouselOptions />

            {auth.role === "TEACHER" &&
                <CourseCarusel sortBy='my' title='Moje kursy' />
            }
            <CourseCarusel sortBy='highest-rated' title='Najwyżej oceniane' />
            <CourseCarusel sortBy='most-popular' title='Najpopularniejsze' />
            <CourseCarusel sortBy='latest' title='Najnowsze' />
        </div>
    )
}