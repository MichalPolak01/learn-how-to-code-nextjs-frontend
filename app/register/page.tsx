"use client"

import React, { FormEvent, useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { useAuth } from "@/providers/authProvider";
import { useRouter } from "next/navigation";


const REGISTER_URL = "api/register"
const LOGIN_URL = "/login"

export default function Page() {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);
    const [registerMessage, setRegisterMessage] = useState("Aby stworzyć nowe konto wprowadź nazwę użytkownika, adres email oraz hasło.");
    const [registerError, setRegisterError] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const router = useRouter();
    // const auth = useAuth();
    const toggleVisibilityPassword = () => setIsPasswordVisible(!isPasswordVisible);
    const toggleVisibilityConfirmPassword = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData)
        };

        const response = await fetch(REGISTER_URL, requestOptions);

        interface RegisterResponse {
            username?: string,
            emial?: string,
            password?: string
        };
        let data: RegisterResponse = {};

        try {
            data = await response.json();
        } catch (error) { }

        if (response.status == 200) {
            setRegisterError(false);
            // TODO Add toast
            console.log("Login success");
            router.push(LOGIN_URL);
        } else if (response.status == 400 || response.status == 401) {
            setRegisterError(true);
            setRegisterMessage("Podany adres email lub hasło są niepoprawne. Sprawdź poprawność wprowadzoanych danych i spróbuj ponownie.");
            // setLoginError(true);
            // TODO Add toast
            console.log("Login failed");
        } else {
            setRegisterError(true);
            setRegisterMessage("Podczas logowania wystąpił nieoczekiwany błąd servera. Spróbuj ponownie później.");
            console.log("Login failed");
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    }
    
  return (
    <div className="flex justify-center items-center h-full">
        <form onSubmit={handleSubmit}>
            <Card className="sm:w-[32rem] w-full p-4">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                    <h1 className="text-primary text-4xl font-semibold mb-2">Rejestracja</h1>
                    <p className={`text-default-600 ${registerError? "text-red-600": ""}`}>{registerMessage}</p>
                </CardHeader>
                <CardBody className="overflow-visible flex flex-col gap-4 mt-2">
                <Input
                    color="default"
                    isRequired={true}
                    label="Nazwa"
                    labelPlacement="outside"
                    name="username"
                    placeholder="Nazwa"
                    size="lg"
                    startContent={
                        <Mail className="text-2xl text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                />
                <Input
                    color="default"
                    isRequired={true}
                    label="Email"
                    labelPlacement="outside"
                    name="email"
                    placeholder="Email"
                    size="lg"
                    startContent={
                        <Mail className="text-2xl text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    />
                <Input
                    color="default"
                    endContent={
                        <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibilityPassword}>
                        {isPasswordVisible ? (
                            <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                            <Eye className="text-2xl text-default-400 pointer-events-none" />
                        )}
                        </button>
                    }
                    isRequired={true}
                    label="Hasło"
                    labelPlacement="outside"
                    name="password"
                    placeholder="Hasło"
                    size="lg"
                    startContent={
                        <LockKeyhole className="text-2xl text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    type={isPasswordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    />
                <Input
                    color="default"
                    endContent={
                        <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibilityConfirmPassword}>
                        {isConfirmPasswordVisible ? (
                            <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                            <Eye className="text-2xl text-default-400 pointer-events-none" />
                        )}
                        </button>
                    }
                    isRequired={true}
                    label="Potwierdź Hasło"
                    labelPlacement="outside"
                    name="confirmPassword"
                    placeholder="Potwierdź hasło"
                    size="lg"
                    startContent={
                        <LockKeyhole className="text-2xl text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    type={isPasswordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                />
                </CardBody>
                <CardFooter className="flex flex-col">
                    <Button className="w-full" color="default" size="md" type="submit" variant="shadow">
                        Zaloguj się
                    </Button> 
                    <div className="flex gap-2 mt-4">
                        <p>Lub jeśli masz już konto</p>
                        <Link color="primary" href="/login" size="md" underline="hover">
                            Zaloguj się
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </form>
    </div>
  );
}
