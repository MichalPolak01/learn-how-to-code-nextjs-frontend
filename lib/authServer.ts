"use server"

import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

const TOKEN_AGE = 3600;
const TOKEN_NAME = "auth-token";
const TOKEN_REFRESH_NAME = "auth-refresh-token";


export async function getToken() {
    const myAuthToken = cookies().get(TOKEN_NAME)?.value;

    if (myAuthToken) {
        return myAuthToken;
    }

    return null;
}

export async function getRefreshToken() {
    return cookies().get(TOKEN_REFRESH_NAME)?.value;
}

export async function setToken(authToken: string | null | undefined) {
    return cookies().set({
        name: TOKEN_NAME,
        value: authToken ?? "",
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: TOKEN_AGE
    });
}

export async function setRefreshToken(authRefreshToken: string | null | undefined) {
    return cookies().set({
        name: TOKEN_REFRESH_NAME,
        value: authRefreshToken ?? "",
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: TOKEN_AGE * 7
    });
}

export async function deleteTokens() {
    cookies().delete(TOKEN_NAME);
    cookies().delete(TOKEN_REFRESH_NAME);
}

export async function isTokenExpired(token: string) {
    const decoded = jwtDecode(token);

    return decoded.exp? decoded.exp < Date.now() /1000 : false;
}