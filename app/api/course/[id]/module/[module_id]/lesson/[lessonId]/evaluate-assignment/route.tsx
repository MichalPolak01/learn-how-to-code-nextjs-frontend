"use server"

import { NextResponse } from "next/server"

import ApiProxy from "@/app/api/proxy";


const DJANGO_API_EVALUATE_ASSIGNMENT_URL = "http://127.0.0.1:8000/api/lessons/assignments/evaluate"

export async function POST(request: Request) {
    const requestData = await request.json();
    const {data, status} = await ApiProxy.post(DJANGO_API_EVALUATE_ASSIGNMENT_URL, requestData, true);

    return NextResponse.json(data, {status: status});
}