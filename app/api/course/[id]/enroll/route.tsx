"use server"

import { NextResponse } from "next/server"

import ApiProxy from "@/app/api/proxy";

const DJANGO_API_COURSE_STATS_URL = "http://127.0.0.1:8000/api/courses/"


export async function POST(request: Request, { params }: { params: { id: string } }) {
    const requestData = await request.json();
    const { data, status } = await ApiProxy.post(`${DJANGO_API_COURSE_STATS_URL}${params.id}/enroll`, requestData, true);

    return NextResponse.json(data, { status: status });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { data, status } = await ApiProxy.get(`${DJANGO_API_COURSE_STATS_URL}enrolled`, true);

    return NextResponse.json(data, { status: status });
}