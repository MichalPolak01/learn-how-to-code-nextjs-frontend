"use client"

import { useEffect, useState } from "react"

import StatsTable from "./statsTable";
import StatsCharts from "./statsCharts";

import { showToast } from "@/lib/showToast";
import { useAuth } from "@/providers/authProvider";


const STATS_URL = "/api/course/stats/overall"

export default function OverallStats() {
    const [stats, setStats] = useState<Stats[]>([]);
    const [currentStats, setCurrentStats] = useState<Stats | undefined>();
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
                
                if (response.status === 401) {
                  auth.loginRequired();
                    
                  return;
                }
        
                if (!response.ok) {
                  throw new Error("Response not ok.")
                }

                const stats: Stats[] = await response.json();
                const currentStats = stats.find((stat) => stat.username === auth.username)
    
                setStats(stats);
                setCurrentStats(currentStats);
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
            <h2 className="text-primary font-semibold text-2xl my-4 ml-4">Twoje statystyki:</h2>
            {currentStats ? (
              <StatsCharts stats={currentStats} />
            ) : (
              <p className="ml-6 mb-8 text-light italic text-md">Brak statystyk. Kiedy ukończysz lekcję tu pojawią się twoeje statystyki.</p>
            )}

            <h3 className="text-primary font-semibold text-xl my-4 ml-4">Ranking ogólny:</h3>
            <StatsTable courseStats={stats} loading={loading}/>
        </div>
    )
}