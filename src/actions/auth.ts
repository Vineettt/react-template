"use server"

import { apiFetch, ApiError, getErrorMessage } from "@/utils/api"
import { Endpoint, HttpMethod } from "@/constants/route"

export async function loginAction(prevState: string | undefined, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return JSON.stringify({ 
      success: false, 
      message: "Invalid credentials" 
    })
  }

  try {
    const response = await apiFetch(`${Endpoint.LOGIN}`, { 
      method: HttpMethod.POST, 
      body: JSON.stringify({ email, password }) 
    })
    
    if (response.success && response.data) {
      return JSON.stringify({ 
        success: true, 
        message: response.data.message || "Login successful!",
        user: response.data.user,
        token: response.data.token,
        redirectTo: "/dashboard"
      })
    }
    
    return JSON.stringify({ 
      success: false, 
      message: getErrorMessage(response.data) || "Login failed" 
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return JSON.stringify({ 
        success: false, 
        message: getErrorMessage(error.message) 
      })
    }
    return JSON.stringify({ 
      success: false, 
      message: getErrorMessage(error) 
    })
  }
}
