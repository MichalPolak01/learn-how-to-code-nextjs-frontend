"use client"

import React, { FormEvent, useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { validateEmail, validatePassword } from "@/lib/formValidators";
import { useAuth } from "@/providers/authProvider";


const REGISTER_URL = "api/change-password"

export default function Page() {
    const [isOldPasswordVisible, setIsOldPasswordVisible] = React.useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = React.useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);

    const [passwordChangeError, setPasswordChangeError] = useState(0);
    const [passwordChangeMessage, setPasswordChangeMessage] = useState("Podaj obecne hasło oraz nowe, aby dokonać zmiany.");
    const [isOldPasswordInvalid, setIsOldPasswordInvalid] = useState(false);
    const [isNewPasswordsInvalid, setIsNewPasswordsInvalid] = useState(false);
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });

    const toggleVisibilityOldPassword = () => setIsOldPasswordVisible(!isOldPasswordVisible);
    const toggleVisibilityNewPassword = () => setIsNewPasswordVisible(!isNewPasswordVisible);
    const toggleVisibilityConfirmPassword = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsOldPasswordInvalid(false);
        setIsNewPasswordsInvalid(false);

        if (isInvalidPassword || formData.old_password == "" || formData.new_password == "" || formData.confirm_password == "") {
            setPasswordChangeError(1);
            setPasswordChangeMessage("Aby zmienić hasło musisz wprowadzić poprawnie wszystkie dane!");
        } else if (isInvalidConfirmPassword) {
            setPasswordChangeError(1);
            setPasswordChangeMessage("Podane hasła różnią się od siebie!");
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
                message?: string;
            }
            let data: RegisterResponse = {};
    
            try {
                data = await response.json();
            } catch (error) { }
    
            if (response.status == 200) {
                setPasswordChangeError(2);
                // TODO Add toast
                console.log("Password change success");
            } else if (response.status == 400) {
                setPasswordChangeError(1);
                const errorResponse = data?.message;

                if (errorResponse == "Old password incorrect.") {
                    setIsOldPasswordInvalid(true);
                    setPasswordChangeMessage("Obecne hasło, które podałeś jest niepoprawne.")
                } else if (errorResponse == "New passwords do not match.") {
                    setIsNewPasswordsInvalid(true);
                    setPasswordChangeMessage("Nowe hasła nie pasują do siebie.")
                } else {
                    setPasswordChangeMessage("Podczas zmiany hasła wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
                }
                
                // TODO Add toast
                console.log("Password change failed");
            } else {
                setPasswordChangeError(1)
                setPasswordChangeMessage("Podczas zmiany hasła wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie później.");
                console.log("Password change failed");
            }
        }
    }

    const isInvalidPassword = React.useMemo(() => {
        if (formData.new_password === "") return false;
    
        return validatePassword(formData.new_password) ? false : true;
    }, [formData.new_password]);

    const isInvalidConfirmPassword = React.useMemo(() => {
        if (formData.confirm_password === "") return false;

        return formData.new_password == formData.confirm_password ? false : true;
    }, [formData.confirm_password]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsOldPasswordInvalid(false);
        setIsNewPasswordsInvalid(false);

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
                        <h1 className="text-primary text-4xl font-semibold mb-2">Zmiana hasła</h1>
                        <p className={`${passwordChangeError? "text-danger-500": "text-default-600"}`}>{passwordChangeMessage}</p>
                    </CardHeader>
                    <CardBody className="overflow-visible flex flex-col gap-4 mt-2">
                    <Input
                        color="default"
                        endContent={
                            <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibilityOldPassword}>
                            {isOldPasswordVisible ? (
                                <EyeOff className={`text-2xl pointer-events-none ${isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`} />
                            ) : (
                                <Eye className={`text-2xl pointer-events-none ${isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`} />
                            )}
                            </button>
                        }
                        errorMessage="Hasło musi posiadać co najmniej 8 znaków, w tym 1 małą literę, 1 dużą literę, cyfrę oraz znak specjalny."
                        isInvalid={isOldPasswordInvalid}
                        isRequired={true}
                        label="Obecne Hasło"
                        labelPlacement="outside"
                        name="old_password"
                        placeholder="Hasło"
                        size="lg"
                        startContent={
                            <LockKeyhole className={`text-2xl  pointer-events-none flex-shrink-0 ${isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`}/>
                        }
                        type={isOldPasswordVisible ? "text" : "password"}
                        value={formData.old_password}
                        onChange={handleChange}
                        />
                    <Input
                        color="default"
                        endContent={
                            <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibilityNewPassword}>
                            {isNewPasswordVisible ? (
                                <EyeOff className={`text-2xl pointer-events-none ${isInvalidPassword || isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`} />
                            ) : (
                                <Eye className={`text-2xl pointer-events-none ${isInvalidPassword || isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`} />
                            )}
                            </button>
                        }
                        errorMessage="Hasło musi posiadać co najmniej 8 znaków, w tym 1 małą literę, 1 dużą literę, cyfrę oraz znak specjalny."
                        isInvalid={isInvalidPassword || isOldPasswordInvalid}
                        isRequired={true}
                        label="Nowe Hasło"
                        labelPlacement="outside"
                        name="new_password"
                        placeholder="Nowe hasło"
                        size="lg"
                        startContent={
                            <LockKeyhole className={`text-2xl  pointer-events-none flex-shrink-0 ${isInvalidPassword || isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`}/>
                        }
                        type={isNewPasswordVisible ? "text" : "password"}
                        value={formData.new_password}
                        onChange={handleChange}
                    />
                    <Input
                        color="default"
                        endContent={
                            <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibilityConfirmPassword}>
                            {isConfirmPasswordVisible ? (
                                <EyeOff className={`text-2xl pointer-events-none ${isInvalidConfirmPassword || isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`} />
                            ) : (
                                <Eye className={`text-2xl pointer-events-none ${isInvalidConfirmPassword || isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`} />
                            )}
                            </button>
                        }
                        errorMessage="Hasła nie mogą się od siebie różnić!"
                        isInvalid={isInvalidConfirmPassword || isOldPasswordInvalid}
                        isRequired={true}
                        label="Potwierdź Hasło"
                        labelPlacement="outside"
                        name="confirm_password"
                        placeholder="Potwierdź hasło"
                        size="lg"
                        startContent={
                            <LockKeyhole className={`text-2xl  pointer-events-none flex-shrink-0 ${isInvalidConfirmPassword || isOldPasswordInvalid? "text-danger-400" :"text-default-400"}`}/>
                        }
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        value={formData.confirm_password}
                        onChange={handleChange}
                    />
                    </CardBody>
                    <CardFooter className="flex flex-col">
                        <Button className="w-full" color="default" size="md" type="submit" variant="shadow">
                            Zmień hasło
                        </Button> 
                    </CardFooter>
                </Card>
            </form>
        </div>
      );
}