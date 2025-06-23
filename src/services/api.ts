import axios, { AxiosResponse } from "axios";
import { useAuthStore } from "../store/authStore";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const refreshed = await useAuthStore.getState().refreshAccessToken();
          if (refreshed) {
            const newToken = useAuthStore.getState().accessToken;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          useAuthStore.getState().clearAuth();
          window.location.href = "/login";
        }
      } else {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }): Promise<ApiResponse> =>
    api
      .post("/auth/register", data)
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  login: (data: { email: string; password: string }): Promise<ApiResponse> =>
    api
      .post("/auth/login", data)
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  logout: (refreshToken: string): Promise<ApiResponse> =>
    api
      .post("/auth/logout", { refreshToken })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  refreshToken: (refreshToken: string): Promise<ApiResponse> =>
    api
      .post("/auth/refresh-token", { refreshToken })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  forgotPassword: (email: string): Promise<ApiResponse> =>
    api
      .post("/auth/password-reset/request", { email })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  resetPassword: (token: string, password: string): Promise<ApiResponse> =>
    api
      .post("/auth/password-reset/verify", { token, password })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  requestMagicLink: (email: string): Promise<ApiResponse> =>
    api
      .post("/auth/magic-link/request", { email })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  verifyMagicLink: (token: string): Promise<ApiResponse> =>
    api
      .post("/auth/magic-link/verify", { token })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  requestEmailVerification: (): Promise<ApiResponse> =>
    api
      .post("/auth/email/request-verification")
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  verifyEmail: (token: string): Promise<ApiResponse> =>
    api
      .post("/auth/email/verify", { token })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  requestPhoneOTP: (phoneNumber: string): Promise<ApiResponse> =>
    api
      .post("/auth/phone/request-otp", { phoneNumber })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  verifyPhoneOTP: (otp: string): Promise<ApiResponse> =>
    api
      .post("/auth/phone/verify-otp", { otp })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  setup2FA: (): Promise<ApiResponse> =>
    api
      .post("/auth/2fa/setup")
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  verify2FA: (token: string): Promise<ApiResponse> =>
    api
      .post("/auth/2fa/verify", { token })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  disable2FA: (token: string): Promise<ApiResponse> =>
    api
      .post("/auth/2fa/disable", { token })
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  generateBackupCodes: (): Promise<ApiResponse> =>
    api
      .post("/auth/2fa/backup-codes")
      .then((res: AxiosResponse<ApiResponse>) => res.data),
};

// User API
export const userAPI = {
  getProfile: (): Promise<ApiResponse> =>
    api
      .get("/user/profile")
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  updateProfile: (data: any): Promise<ApiResponse> =>
    api
      .put("/user/profile", data)
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  deleteAccount: (): Promise<ApiResponse> =>
    api
      .delete("/user/account")
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  getSessions: (): Promise<ApiResponse> =>
    api
      .get("/user/sessions")
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  revokeSession: (sessionId: string): Promise<ApiResponse> =>
    api
      .delete(`/user/sessions/${sessionId}`)
      .then((res: AxiosResponse<ApiResponse>) => res.data),

  revokeAllSessions: (currentRefreshToken?: string): Promise<ApiResponse> =>
    api
      .delete("/user/sessions", { data: { currentRefreshToken } })
      .then((res: AxiosResponse<ApiResponse>) => res.data),
};

export default api;
