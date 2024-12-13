"use server"
import { NextResponse } from "next/server";

import ApiProxy from "@/app/api/proxy";

const DJANGO_API_COURSE_URL = "http://127.0.0.1:8000/api/courses";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const generate = searchParams.get("generate") === "true";
  const requestData = await request.json();

    const url = new URL( `${DJANGO_API_COURSE_URL}/${params.id}/modules`);


  if (generate) {
    url.searchParams.set("generate", "true");
    }

    const { data, status } = await ApiProxy.post(url.toString(), requestData, true);

    return NextResponse.json(data, { status: status });
}