"use client"

import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import React, { FormEvent, useState } from "react";

import { EyeFilledIcon } from "./EyeFilledIcon";
import { EyeSlashFilledIcon } from "./EyeSlashFilledIcon";
import { useAuth } from "@/providers/authProvider";

const LOGIN_URL = "api/login"

export default function Page() {
    const [isVisible, setIsVisible] = React.useState(false);
    const [loginError, setLoginError] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const auth = useAuth();
    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData)
        };

        const response = await fetch(LOGIN_URL, requestOptions);

        interface LoginResponse {
            username?: string,
            detail?: string
        };
        let data: LoginResponse = {};

        try {
            data = await response.json();
        } catch (error) { }

        if (response.ok) {
            auth.login(data?.username);
            console.log("Login success");
        } else {
            setLoginError(true);
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
                <h1 className="text-primary text-4xl font-semibold mb-2">Logowanie</h1>
                <p className="text-default-600">Wprowadź adres email oraz hasło, aby uzyskać dostęp do swojego konta.</p>
            </CardHeader>
            <CardBody className="overflow-visible flex flex-col gap-4">
            <Input
                color="default"
                isRequired={true}
                label="Email"
                labelPlacement="outside"
                name="email"
                size="lg"
                type="email"
                value={formData.email}
                onChange={handleChange}
                />
            <Input
                color="default"
                endContent={
                    <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                    </button>
                }
                isRequired={true}
                label="Hasło"
                labelPlacement="outside"
                name="password"
                size="lg"
                type={isVisible ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                />
            </CardBody>
            <CardFooter className="flex flex-col">
                <Link className="self-end mb-2" color="primary" href="#" size="md" underline="hover">
                    Zapomniałeś hasła?
                </Link>
                <Button className="w-full" color="default" size="md" type="submit" variant="shadow">
                    Zaloguj się
                </Button> 
                <div className="flex gap-2 mt-4">
                    <p>Lub jeśli nie masz konta</p>
                    <Link color="primary" href="#" size="md" underline="hover">
                        Zarejestruj się
                    </Link>
                </div>

            </CardFooter>
            </Card>
        </form>
    </div>
  );
}
