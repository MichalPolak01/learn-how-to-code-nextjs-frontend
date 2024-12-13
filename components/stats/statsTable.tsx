import React, { useMemo, useState } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Pagination } from "@nextui-org/pagination";
import { ArrowDown01, ArrowDownAz, ArrowUp10, ArrowUpZa } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

import { useAuth } from "@/providers/authProvider";


interface StatsTableProps {
    courseStats: Stats[];
    loading: boolean
}

export default function StatsTable({ courseStats, loading }: StatsTableProps) {
    const [page, setPage] = useState<number>(1);
    const [sortKey, setSortKey] = useState<keyof Stats | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const rowsPerPage = 10;
    const auth = useAuth();

    const sortData = (data: Stats[]) => {
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const valA = a[sortKey] ?? 0;
            const valB = b[sortKey] ?? 0;

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;

            return 0;
        });
    };

    const handleSort = (key: keyof Stats) => {
        if (sortKey === key) {
            setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const sortedStats = useMemo(() => sortData(courseStats), [courseStats, sortKey, sortOrder]);

    const paginatedStats = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedStats.slice(start, end);
    }, [page, sortedStats]);

    if (loading) {
        return (
            <div className="flex flex-row gap-4 h-full justify-center items-center">
                <Spinner />
                <p className="text-md">Ładowanie Zadania...</p>
            </div>
        );
    }

    return (
        <Table
            aria-label="Statystyki kursów"
            bottomContent={
                <div className="flex w-full justify-center">
                    <Pagination
                        key={`pagination-${page}`}
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={Math.ceil(courseStats.length / rowsPerPage)}
                        onChange={setPage}
                    />

                </div>
            }
            classNames={{
                wrapper: "min-h-[222px]",
            }}
            isStriped={true}
        >
            <TableHeader>
                <TableColumn key="username" onClick={() => handleSort("username")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                        Nazwa użytkownika
                        {sortKey === "username" && (sortOrder === "asc" ? <ArrowDownAz /> : <ArrowUpZa />)}
                    </div>
                </TableColumn>
                <TableColumn key="completed_lessons" onClick={() => handleSort("completed_lessons")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                        Ukończone lekcjie
                        {sortKey === "completed_lessons" && (sortOrder === "asc" ? <ArrowDown01 /> : <ArrowUp10 />)}
                    </div>
                </TableColumn>
                <TableColumn key="started_assignments" onClick={() => handleSort("started_assignments")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                        Rozpoczęte zadania
                        {sortKey === "started_assignments" && (sortOrder === "asc" ? <ArrowDown01 /> : <ArrowUp10/>)}
                    </div>
                </TableColumn>
                <TableColumn key="started_quizzes" onClick={() => handleSort("started_quizzes")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                        Rozpoczęte quizy
                        {sortKey === "started_quizzes" && (sortOrder === "asc" ? <ArrowDown01 /> : <ArrowUp10/>)}
                    </div>
                </TableColumn>
                <TableColumn key="assignment_score_percentage" onClick={() => handleSort("assignment_score_percentage")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                        Poprawność w zdaniach
                        {sortKey === "assignment_score_percentage" && (sortOrder === "asc" ? <ArrowDown01 /> : <ArrowUp10/>)}
                    </div>
                </TableColumn>
                <TableColumn key="quiz_score_percentage" onClick={() => handleSort("quiz_score_percentage")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                        Poprawność w quizach
                        {sortKey === "quiz_score_percentage" && (sortOrder === "asc" ? <ArrowDown01 /> : <ArrowUp10/>)}
                    </div>
                </TableColumn>
            </TableHeader>
            <TableBody items={paginatedStats}>
                {(item: Stats) => (
                    <TableRow
                        key={item.username}
                        className={auth.username === item.username ? "bg-primary-50 text-primary" : ""}
                    >
                        <TableCell>{item.username}</TableCell>
                        <TableCell>{item.completed_lessons}</TableCell>
                        <TableCell>{item.started_assignments}</TableCell>
                        <TableCell>{item.started_quizzes}</TableCell>
                        <TableCell>{item.assignment_score_percentage.toFixed(2)}%</TableCell>
                        <TableCell>{item.quiz_score_percentage.toFixed(2)}%</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
