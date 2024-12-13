"use client"

import { useEffect, useState } from "react";

import StatsCharts from "./statsCharts";
import StatsTable from "./statsTable";

import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";


const STATS_URL = "/api/course/stats/enrolled"

export default function CoursesStats() {
    const [stats, setStats] = useState<EnrolledStats[]>([]);
    const [loading, setLoading] = useState(false);

    const auth = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(STATS_URL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const stats = await response.json();

                if (response.status === 401) {
                    auth.loginRequired();

                    return;
                }

                if (!response.ok) {
                    throw new Error("Response not ok.")
                }

                setStats(stats);
            } catch (error) {
                showToast("Nie udało się pobrać statystyk.", true);

                return;
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [auth]);

    return (
        <div>
            {loading && <p className="text-center text-default-500">Ładowanie...</p>}
            {!loading && stats.length === 0 && (
                <p className="text-center text-default-500">Brak statystyk do wyświetlenia.</p>
            )}
            {stats.map((course_stats) => (
                <div key={course_stats.course_id} className="mb-16">
                    <h2 className="text-primary font-semibold text-2xl my-4 ml-4">
                        {course_stats.course_name}
                    </h2>
                    <div>
                        <h3 className="font-semibold text-lg my-4 ml-4">
                            Twoje statystyki:
                        </h3>
                        <StatsCharts
                            stats={course_stats.users_progress}
                            username={auth.username}
                        />
                        <h3 className="font-semibold text-lg my-4 ml-4">
                            Ranking ogólny:
                        </h3>
                        <StatsTable
                            courseStats={course_stats.users_progress}
                            loading={loading}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}