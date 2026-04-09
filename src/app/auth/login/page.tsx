"use client";

import { LoginForm } from "@/components/auth/loginForm";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}