"use server"

import { NextResponse } from "next/server"

import ApiProxy from "@/app/api/proxy";

const DJANGO_API_LESSONS_URL = "http://127.0.0.1:8000/api/lessons/"


export async function GET(request: Request, { params }: { params: { lessonId: string } }) {
    const { data, status } = await ApiProxy.get(`${DJANGO_API_LESSONS_URL}${params.lessonId}`, true);

    return NextResponse.json(data, { status: status });
}

