"use server"

import { NextResponse } from "next/server"

import ApiProxy from "@/app/api/proxy";

const DJANGO_API_COURSE_STATS_URL = "http://127.0.0.1:8000/api/courses/stats"


export async function GET() {
    const {data, status} = await ApiProxy.get(DJANGO_API_COURSE_STATS_URL, true);

    return NextResponse.json(data, {status: status});
}