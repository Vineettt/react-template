"use client";

import { LoginForm } from "@/components/auth/loginForm";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <LoginForm />
        </div>
    );
}