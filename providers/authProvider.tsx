"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react"

import { deleteTokens, getToken, setRefreshToken, setToken } from "@/lib/auth";

// interface AuthContextProps {
//     isAuthenticated: boolean
//     authToken: string | null
//     loading: boolean
//     username: string
//     login: (username?: string, authToken?: string, refreshToken?: string) => void
//     logout: () => void
//     loginRequired: () => void
// }

// const AuthContext = createContext<AuthContextProps | null>(null)
const AuthContext = createContext(null);

const LOGIN_REDIRECT_URL = "/"
const LOGOUT_REDIRECT_URL = "/login"
const LOGIN_REQUIRED_URL = "/login"

const LOCAL_STORAGE_KEY = "is-logged-in"
const LOCAL_USERNAME_KEY = "username"


interface AuthProviderProps {
    children: React.ReactNode
}


export function AuthProvider({children}: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = getToken();

        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }

        const storedUsername = localStorage.getItem(LOCAL_USERNAME_KEY);

        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // const login = async(username?: string, authToken?: string, refreshToken?: string) => {
    //     if (authToken) {
    //         setToken(authToken);
    //         setIsAuthenticated(true);
    //     }
    //     if (refreshToken) {
    //         setRefreshToken(refreshToken);
    //     }

    //     if (username) {
    //         localStorage.setItem(LOCAL_STORAGE_KEY, username);
    //         setUsername(username);
    //     } else {
    //         localStorage.removeItem(LOCAL_USERNAME_KEY);
    //         setUsername("");
    //     }

    //     const nextUrl = searchParams.get("next");
    //     const invalidNextUrls = ["/login", "/logout", "/register"];
    //     const nextValidUrl = nextUrl && nextUrl.startsWith("/") && !invalidNextUrls.includes(nextUrl);

    //     if (nextValidUrl) {
    //         router.replace(nextUrl);
    //     } else {
    //         router.replace(LOGIN_REDIRECT_URL);
    //     }
    // }

    const login = (username?: string) => {
        setIsAuthenticated(true)
        localStorage.setItem(LOCAL_STORAGE_KEY, "1")

        if (username) {
            localStorage.setItem(LOCAL_USERNAME_KEY, `${username}`)
            setUsername(username)
        } else {
            localStorage.removeItem(LOCAL_USERNAME_KEY)
            setUsername("")
        }

        const nextUrl = searchParams.get("next")
        const invalidNextUrl = ["/login", "/logout"]
        const nextUrlValid = nextUrl && nextUrl.startsWith('/') && !invalidNextUrl.includes(nextUrl)

        if (nextUrlValid) {
            router.replace(nextUrl)
            return
        } else {
            router.replace(LOGIN_REDIRECT_URL)
            return
        }
    }

    const logout = () => {
        setIsAuthenticated(false);
        deleteTokens();
        localStorage.setItem(LOCAL_STORAGE_KEY, "0");
        router.replace(LOGOUT_REDIRECT_URL);
    }

    const loginRequired = () => {
        setIsAuthenticated(false);
        deleteTokens();
        localStorage.setItem(LOCAL_STORAGE_KEY, "0");
        const loginWithNextUrl = `${LOGIN_REQUIRED_URL}?next=${pathname}`;

        router.replace(loginWithNextUrl);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loginRequired, username }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}