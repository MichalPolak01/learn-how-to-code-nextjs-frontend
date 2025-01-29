"use server"
import { NextResponse } from "next/server";

import ApiProxy from "@/app/api/proxy";

const DJANGO_API_CREATE_COURSE_URL = "http://127.0.0.1:8000/api/courses";


export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const generate = searchParams.get("generate") === "true";
    const requestData = await request.json();

    const url = new URL(DJANGO_API_CREATE_COURSE_URL);

    if (generate) {
        url.searchParams.set("generate", "true");
    }

    const { data, status } = await ApiProxy.post(url.toString(), requestData, true);

    return NextResponse.json(data, { status: status });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy");
    const limit = searchParams.get("limit");

    const url = new URL(DJANGO_API_CREATE_COURSE_URL);

    if (limit) {
        url.searchParams.set("limit", limit);
    }
    if (sortBy) {
        url.searchParams.set("sortBy", sortBy);
    }

    const { data, status } = await ApiProxy.get(url.toString(), true);

    return NextResponse.json(data, { status: status });
}