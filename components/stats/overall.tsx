"use client"

import { useEffect, useState } from "react"

import StatsTable from "./statsTable";
import StatsCharts from "./statsCharts";

import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";


const STATS_URL = "/api/course/stats/overall"

export default function OverallStats() {
    const [stats, setStats] = useState<Stats[]>([]);
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
                    
                  setLoading(false);

                  return;
                }
        
                if (!response.ok) {
                  throw new Error("Response not ok.")
                }
    
                setStats(stats);
                setLoading(false);
            } catch (error) {
                showToast("Nie udało się pobrać statystyk.", true);
    
                setLoading(false);

                return;
            }
        }

        fetchStats();
    }, [auth]);

    return (
        <div>
            <h2 className="text-primary font-semibold text-2xl my-4 ml-4">Twoje statystyki:</h2>
            <StatsCharts stats={stats} username={auth.username} />

            <h3 className="text-primary font-semibold text-xl my-4 ml-4">Ranking ogólny:</h3>
            <StatsTable courseStats={stats} loading={loading}/>
        </div>
    )
}