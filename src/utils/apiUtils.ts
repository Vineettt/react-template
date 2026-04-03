const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, '')}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': 'eu',
    ...options.headers as Record<string, string>,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = token?.replaceAll('"', '');
  }

  const requestInit: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, requestInit);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Request failed');
    }
    
    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error');
  }
}

export const api = {
  get: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiFetch<T>(endpoint, { method: 'GET', headers }),
    
  post: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    }),
    
  put: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiFetch<T>(endpoint, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    }),
    
  patch: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiFetch<T>(endpoint, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    }),
    
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiFetch<T>(endpoint, { method: 'DELETE', headers }),
};

export const useApi = () => {
  return {
    get: api.get,
    post: api.post,
    put: api.put,
    patch: api.patch,
    delete: api.delete,
  };
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (parsed.errors) {
        const errorMessages = Object.values(parsed.errors) as string[];
        return errorMessages[0] || 'An error occurred';
      }
      return parsed.message || error;
    } catch {
      return error;
    }
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.errors) {
    const errorMessages = Object.values(error.errors) as string[];
    return errorMessages[0] || 'An error occurred';
  }
  
  return 'An unexpected error occurred';
};
