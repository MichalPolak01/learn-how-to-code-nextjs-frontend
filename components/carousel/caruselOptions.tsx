"use client"

import { BadgePlus, ChartSpline, Clock3, ScrollText, Trophy, PencilLine } from "lucide-react";

import OptionCard from "./optionCard";

import { useAuth } from "@/providers/authProvider";


export default function CarouselOptions() {

    const auth = useAuth();

    return (
        <div className="flex flex-row flex-wrap justify-center gap-3 py-5 mt-5">
            {auth.role === "TEACHER" && 
                <>
                    <OptionCard color="primary" href="course-wizard" icon={BadgePlus} text="Dodaj kurs" />
                    <OptionCard color="default-800" href="#my" icon={PencilLine} text="Moje kursy" />
                </>
            }
            <OptionCard color="default-800" href="#highest-rated" icon={Trophy} text="Najwyżej oceniane" />
            <OptionCard color="default-800" href="#most-popular" icon={ChartSpline} text="Najpopularniejsze" />
            <OptionCard color="default-800" href="#latest" icon={Clock3} text="Najnowsze" />
            <OptionCard color="default-800" href="/courses" icon={ScrollText} text="Wszystkie" />
    </div>
    )
}