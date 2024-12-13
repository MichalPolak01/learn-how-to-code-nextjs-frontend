"use client"

import { ChartSpline, Clock3, ScrollText, Trophy, PencilLine, Bookmark } from "lucide-react";

import { useAuth } from "@/providers/authProvider";


export default function FilterCarousel({
    activeFilter,
    onFilterChange,
}: {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}) {
    const auth = useAuth();

    const options = [
        { filter: "", icon: ScrollText, text: "Wszystkie" },
        { filter: "enrolled", icon: Bookmark, text: "Zapisane" },
        { filter: "most-popular", icon: ChartSpline, text: "Najpopularniejsze" },
        { filter: "highest-rated", icon: Trophy, text: "Najwyżej oceniane" },
        { filter: "latest", icon: Clock3, text: "Najnowsze" },
    ];

    if (auth.role === "TEACHER") {
        options.unshift(
            { filter: "my", icon: PencilLine, text: "Moje kursy" },
        );
    }

    return (
        <div className="flex flex-row flex-wrap justify-center gap-3 py-5 mt-5">
            {options.map(({ filter, icon: Icon, text }) => (
                <button
                    key={filter}
                    className={`px-4 py-2 rounded ${
                        activeFilter === filter ? "bg-primary text-white" : "bg-default-300 text-default-700"
                    }`}
                    onClick={() => {
                        onFilterChange(filter);
                    }}
                >
                    <Icon className="inline-block mr-2" />
                    {text}
                </button>
            ))}
        </div>
    );
}