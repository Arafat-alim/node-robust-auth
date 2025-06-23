import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI, userAPI } from "../services/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  requestEmailVerification: () => Promise<boolean>;
  requestMagicLink: (email: string) => Promise<boolean>;
  verifyMagicLink: (token: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  fetchProfile: () => Promise<boolean>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });

          if (response.success) {
            const { user, accessToken, refreshToken } = response.data;

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });

            toast.success("Login successful!");
            return true;
          } else {
            toast.error(response.message || "Login failed");
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          console.error("Login error:", error);
          toast.error(error.response?.data?.message || "Login failed");
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);

          if (response.success) {
            const { user, accessToken, refreshToken } = response.data;

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });

            toast.success(
              "Registration successful! Please check your email for verification."
            );
            return true;
          } else {
            toast.error(response.message || "Registration failed");
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          console.error("Registration error:", error);
          toast.error(error.response?.data?.message || "Registration failed");
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await authAPI.logout(refreshToken);
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          toast.success("Logged out successfully");
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) return false;

          const response = await authAPI.refreshToken(refreshToken);

          if (response.success) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data;

            set({
              accessToken,
              refreshToken: newRefreshToken,
            });

            return true;
          }

          return false;
        } catch (error) {
          console.error("Token refresh error:", error);
          get().clearAuth();
          return false;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          const response = await authAPI.forgotPassword(email);

          if (response.success) {
            toast.success(response.message);
            return true;
          } else {
            toast.error(response.message || "Failed to send reset email");
            return false;
          }
        } catch (error: any) {
          console.error("Forgot password error:", error);
          toast.error(
            error.response?.data?.message || "Failed to send reset email"
          );
          return false;
        }
      },

      resetPassword: async (token: string, password: string) => {
        try {
          const response = await authAPI.resetPassword(token, password);

          if (response.success) {
            toast.success("Password reset successful!");
            return true;
          } else {
            toast.error(response.message || "Password reset failed");
            return false;
          }
        } catch (error: any) {
          console.error("Reset password error:", error);
          toast.error(error.response?.data?.message || "Password reset failed");
          return false;
        }
      },

      verifyEmail: async (token: string) => {
        try {
          const response = await authAPI.verifyEmail(token);

          if (response.success) {
            // Update user's email verification status
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  isEmailVerified: true,
                },
              });
            }

            toast.success("Email verified successfully!");
            return true;
          } else {
            toast.error(response.message || "Email verification failed");
            return false;
          }
        } catch (error: any) {
          console.error("Email verification error:", error);
          toast.error(
            error.response?.data?.message || "Email verification failed"
          );
          return false;
        }
      },

      requestEmailVerification: async () => {
        try {
          const response = await authAPI.requestEmailVerification();

          if (response.success) {
            toast.success("Verification email sent!");
            return true;
          } else {
            toast.error(
              response.message || "Failed to send verification email"
            );
            return false;
          }
        } catch (error: any) {
          console.error("Request email verification error:", error);
          toast.error(
            error.response?.data?.message || "Failed to send verification email"
          );
          return false;
        }
      },

      requestMagicLink: async (email: string) => {
        try {
          const response = await authAPI.requestMagicLink(email);

          if (response.success) {
            toast.success(response.message);
            return true;
          } else {
            toast.error(response.message || "Failed to send magic link");
            return false;
          }
        } catch (error: any) {
          console.error("Request magic link error:", error);
          toast.error(
            error.response?.data?.message || "Failed to send magic link"
          );
          return false;
        }
      },

      verifyMagicLink: async (token: string) => {
        try {
          const response = await authAPI.verifyMagicLink(token);

          if (response.success) {
            const { user, accessToken, refreshToken } = response.data;

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });

            toast.success("Magic link verification successful!");
            return true;
          } else {
            toast.error(response.message || "Magic link verification failed");
            return false;
          }
        } catch (error: any) {
          console.error("Magic link verification error:", error);
          toast.error(
            error.response?.data?.message || "Magic link verification failed"
          );
          return false;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await userAPI.updateProfile(data);

          if (response.success) {
            set({
              user: response.data.user,
            });

            toast.success("Profile updated successfully!");
            return true;
          } else {
            toast.error(response.message || "Profile update failed");
            return false;
          }
        } catch (error: any) {
          console.error("Profile update error:", error);
          toast.error(error.response?.data?.message || "Profile update failed");
          return false;
        }
      },

      fetchProfile: async () => {
        try {
          const response = await authAPI.getProfile();

          if (response.success) {
            set({
              user: response.data.user,
            });
            return true;
          }

          return false;
        } catch (error) {
          console.error("Fetch profile error:", error);
          return false;
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
