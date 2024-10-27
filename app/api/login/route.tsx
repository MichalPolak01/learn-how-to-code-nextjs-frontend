"use server"

import { NextResponse } from "next/server"

import { setRefreshToken, setToken } from "@/lib/auth"

const DJANGO_API_LOGIN_URL = "http://127.0.0.1:8000/api/login"


export async function POST(request: Request) {
    const requestData = await request.json()
    const jsonData = JSON.stringify(requestData)

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: jsonData
    }

    const response = await fetch(DJANGO_API_LOGIN_URL, requestOptions)
    const responseData = await response.json()

    if (response.ok) {
        const {username, access, refresh} = responseData

        setToken(access)
        setRefreshToken(refresh)

        return NextResponse.json({"loggedIn": true, "username": username}, {status: 200})
    }

    const {detail} = responseData

    return NextResponse.json({"loggedIn": false, "detail": detail}, {status: 400})
}