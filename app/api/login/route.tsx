"use server"

import { NextResponse } from "next/server"

import ApiProxy from "../proxy";
import { setRefreshToken, setToken } from "@/lib/authServer";

const DJANGO_API_LOGIN_URL = "http://127.0.0.1:8000/api/login"

interface LoginResponse {
    access: string;
    refresh: string;
}

export async function POST(request: Request) {
    const requestData = await request.json();
    const {data, status} = await ApiProxy.post(DJANGO_API_LOGIN_URL, requestData, false);

    if (status === 200) {
        const loginData = data as LoginResponse;
        console.log("Setting tokens");
        setToken(loginData.access);
        console.log(loginData.access);
        setRefreshToken(loginData.refresh);
        console.log(loginData.refresh);
    }

    return NextResponse.json(data, {status: status});
}