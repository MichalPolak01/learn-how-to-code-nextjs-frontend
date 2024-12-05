"use server"

import { NextResponse } from "next/server"

import ApiProxy from "@/app/api/proxy";


const DJANGO_API_COURSE_STATS_URL = "http://127.0.0.1:8000/api/student-progress/"


export async function GET(request: Request, { params }: { params: { id: string } }) {
    const {data, status} = await ApiProxy.get(`${DJANGO_API_COURSE_STATS_URL}${params.id}`, true);

    return NextResponse.json(data, {status: status});
}

