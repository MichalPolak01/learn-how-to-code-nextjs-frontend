"use client"

import React, { FormEvent, useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { validateEmail, validatePassword } from "@/lib/formValidators";


const REGISTER_URL = "api/register"
const LOGIN_URL = "/login"

export default function Page() {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);
    const [registerMessage, setRegisterMessage] = useState("Aby stworzyć nowe konto wprowadź nazwę użytkownika, adres email oraz hasło.");
    const [registerError, setRegisterError] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const router = useRouter();
    const toggleVisibilityPassword = () => setIsPasswordVisible(!isPasswordVisible);
    const toggleVisibilityConfirmPassword = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formData.username == "" || isInvalidEmail || isInvalidPassword || formData.confirmPassword == "") {
            setRegisterError(true);
            setRegisterMessage("Aby założyć konto musisz wprowadzić poprawnie wszystkie dane!");
        } else if (isInvalidConfirmPassword) {
            setRegisterError(true);
            setRegisterMessage("Podane hasła różnią się od siebie!");
        } else {
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            };
    
            const response = await fetch(REGISTER_URL, requestOptions);
    
            interface RegisterResponse {
                data?: {
                    message?: string;
                };
            }
            let data: RegisterResponse = {};
    
            try {
                data = await response.json();
            } catch (error) { }
    
            if (response.status == 201) {
                setRegisterError(false);
                // TODO Add toast
                console.log("Register success");
                router.push(LOGIN_URL);
            } else if (response.status == 400 || response.status == 422) {
                setRegisterError(true);
                setRegisterMessage(data.data?.message?? "Podana nazwa użytkownika lub adres email są już używane.");
                // TODO Add toast
                console.log("Register failed");
            } else {
                setRegisterError(true);
                setRegisterMessage("Podczas logowania wystąpił nieoczekiwany błąd servera. Spróbuj ponownie później.");
                console.log("Register failed");
            }
        }
    }

    const isInvalidEmail = React.useMemo(() => {
      if (formData.email === "") return false;
  
      return validateEmail(formData.email) ? false : true;
    }, [formData.email]);

    const isInvalidPassword = React.useMemo(() => {
        if (formData.password === "") return false;
    
        return validatePassword(formData.password) ? false : true;
    }, [formData.password]);

    const isInvalidConfirmPassword = React.useMemo(() => {
        if (formData.confirmPassword === "") return false;
    
        return formData.password == formData.confirmPassword ? false : true;
    }, [formData.confirmPassword]);

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
                    <p className={`text-default-600 ${registerError? "text-danger-500": ""}`}>{registerMessage}</p>
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
                    value={formData.username}
                    onChange={handleChange}
                />
                <Input
                    color="default"
                    errorMessage="Podany adres email jest niepoprawny!"
                    isInvalid={isInvalidEmail}
                    isRequired={true}
                    label="Email"
                    labelPlacement="outside"
                    name="email"
                    placeholder="Email"
                    size="lg"
                    startContent={
                        <Mail className={`text-2xl  pointer-events-none flex-shrink-0 ${isInvalidEmail? "text-danger-400" :"text-default-400"}`}/>
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
                            <EyeOff className={`text-2xl pointer-events-none ${isInvalidPassword? "text-danger-400" :"text-default-400"}`} />
                        ) : (
                            <Eye className={`text-2xl pointer-events-none ${isInvalidPassword? "text-danger-400" :"text-default-400"}`} />
                        )}
                        </button>
                    }
                    errorMessage="Hasło musi posiadać co najmniej 8 znaków, w tym 1 małą literę, 1 dużą literę, cyfrę oraz znak specjalny."
                    isInvalid={isInvalidPassword}
                    isRequired={true}
                    label="Hasło"
                    labelPlacement="outside"
                    name="password"
                    placeholder="Hasło"
                    size="lg"
                    startContent={
                        <LockKeyhole className={`text-2xl  pointer-events-none flex-shrink-0 ${isInvalidPassword? "text-danger-400" :"text-default-400"}`}/>
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
                            <EyeOff className={`text-2xl pointer-events-none ${isInvalidConfirmPassword? "text-danger-400" :"text-default-400"}`} />
                        ) : (
                            <Eye className={`text-2xl pointer-events-none ${isInvalidConfirmPassword? "text-danger-400" :"text-default-400"}`} />
                        )}
                        </button>
                    }
                    errorMessage="Hasła nie mogą się od siebie różnić!"
                    isInvalid={isInvalidConfirmPassword}
                    isRequired={true}
                    label="Potwierdź Hasło"
                    labelPlacement="outside"
                    name="confirmPassword"
                    placeholder="Potwierdź hasło"
                    size="lg"
                    startContent={
                        <LockKeyhole className="text-2xl text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    value={formData.confirmPassword}
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