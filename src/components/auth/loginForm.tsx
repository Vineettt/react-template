"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { loginAction } from "@/actions/auth"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Eye, EyeOff } from "lucide-react"
import { useAppLoad } from "@/hooks/useAppload"

export function LoginForm() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(loginAction, undefined)
    const [showPassword, setShowPassword] = useState(false)
    const { storeUserData } = useAppLoad()

    useEffect(() => {
        if (state) {
            try {
                const response = JSON.parse(state)
                
                if (response.success) {
                    if (response.user && response.token) {
                        storeUserData(response.user, response.token)
                    }
                    
                    toast.success(response.message)
                    if (response.redirectTo) {
                        router.push(response.redirectTo)
                    }
                } else {
                    toast.error(response.message)
                }
            } catch (error) {
                toast.error("Invalid response from server")
            }
        }
    }, [state])

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Login</CardTitle>
            </CardHeader>
            <form action={formAction} className="flex flex-col gap-4 p-4">              
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="password">Password</label>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="flex justify-between gap-2">
                        <Button type="submit" variant="outline" disabled={isPending}>
                            {isPending ? "Logging in..." : "Login"}
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}