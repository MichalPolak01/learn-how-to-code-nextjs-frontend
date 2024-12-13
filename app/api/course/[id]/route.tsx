"use server"

import { NextResponse } from "next/server";

import ApiProxy from "@/app/api/proxy";

const DJANGO_API_COURSE_URL = "http://127.0.0.1:8000/api/courses/"


export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    const {data, status} = await ApiProxy.get(`${DJANGO_API_COURSE_URL}${id}`, true);

    return NextResponse.json(data, {status: status});
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const requestData = await request.json();

    const {data, status} = await ApiProxy.patch(`${DJANGO_API_COURSE_URL}${id}`, requestData, true);

    return NextResponse.json(data, {status: status});
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const requestData = await request.json();

    const {data, status} = await ApiProxy.put(`${DJANGO_API_COURSE_URL}${id}`, requestData, true);

    return NextResponse.json(data, {status: status});
}