import { ApiResponse, AuthResponse } from "@/types";
import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001/api";

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.refreshToken
        ) {
          originalRequest._retry = true;

          try {
            const response = await axios.post<ApiResponse<AuthResponse>>(
              `${API_URL}/auth/refresh`,
              {
                refreshToken: this.refreshToken,
              }
            );

            if (response.data.success && response.data.data) {
              this.setTokens(
                response.data.data.accessToken,
                response.data.data.refreshToken
              );
              originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Load tokens from localStorage
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      {
        email,
        password,
      }
    );
    if (response.data.success && response.data.data) {
      this.setTokens(
        response.data.data.accessToken,
        response.data.data.refreshToken
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  }

  async register(data: any) {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    if (response.data.success && response.data.data) {
      this.setTokens(
        response.data.data.accessToken,
        response.data.data.refreshToken
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  }

  async logout() {
    await this.client.post("/auth/logout", { refreshToken: this.refreshToken });
    this.clearTokens();
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Roster endpoints
  async getRosters(params?: any) {
    const response = await this.client.get("/roster", { params });
    return response.data;
  }

  async getRosterById(id: string) {
    const response = await this.client.get(`/roster/${id}`);
    return response.data;
  }

  async createRoster(data: any) {
    const response = await this.client.post("/roster", data);
    return response.data;
  }

  async updateRoster(id: string, data: any) {
    const response = await this.client.patch(`/roster/${id}`, data);
    return response.data;
  }

  async deleteRoster(id: string) {
    const response = await this.client.delete(`/roster/${id}`);
    return response.data;
  }

  async publishRoster(id: string) {
    const response = await this.client.post(`/roster/${id}/publish`);
    return response.data;
  }

  // Shift endpoints
  async getShifts(params?: any) {
    const response = await this.client.get("/shift", { params });
    return response.data;
  }

  async getShiftById(id: string) {
    const response = await this.client.get(`/shift/${id}`);
    return response.data;
  }

  async createShift(data: any) {
    const response = await this.client.post("/shift", data);
    return response.data;
  }

  async updateShift(id: string, data: any) {
    const response = await this.client.patch(`/shift/${id}`, data);
    return response.data;
  }

  async deleteShift(id: string) {
    const response = await this.client.delete(`/shift/${id}`);
    return response.data;
  }

  async assignShift(id: string, userId: string) {
    const response = await this.client.post(`/shift/${id}/assign`, { userId });
    return response.data;
  }

  // User endpoints
  async getUsers(params?: any) {
    const response = await this.client.get("/user", { params });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/user/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.client.post("/user", data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.patch(`/user/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/user/${id}`);
    return response.data;
  }

  async getUserStats(id: string) {
    const response = await this.client.get(`/user/${id}/stats`);
    return response.data;
  }

  // Attendance endpoints
  async getAttendances(params?: any) {
    const response = await this.client.get("/attendance", { params });
    return response.data;
  }

  async getAttendanceById(id: string) {
    const response = await this.client.get(`/attendance/${id}`);
    return response.data;
  }

  async createAttendance(data: any) {
    const response = await this.client.post("/attendance", data);
    return response.data;
  }

  async updateAttendance(id: string, data: any) {
    const response = await this.client.patch(`/attendance/${id}`, data);
    return response.data;
  }

  async deleteAttendance(id: string) {
    const response = await this.client.delete(`/attendance/${id}`);
    return response.data;
  }

  async approveAttendance(id: string) {
    const response = await this.client.post(`/attendance/${id}/approve`);
    return response.data;
  }

  // Payroll endpoints
  async getPayrolls(params?: any) {
    const response = await this.client.get("/payroll", { params });
    return response.data;
  }

  async getPayrollById(id: string) {
    const response = await this.client.get(`/payroll/${id}`);
    return response.data;
  }

  async createPayroll(data: any) {
    const response = await this.client.post("/payroll", data);
    return response.data;
  }

  async updatePayroll(id: string, data: any) {
    const response = await this.client.patch(`/payroll/${id}`, data);
    return response.data;
  }

  async deletePayroll(id: string) {
    const response = await this.client.delete(`/payroll/${id}`);
    return response.data;
  }

  async generatePayroll(data: any) {
    const response = await this.client.post("/payroll/generate", data);
    return response.data;
  }

  async approvePayroll(id: string) {
    const response = await this.client.post(`/payroll/${id}/approve`);
    return response.data;
  }

  // Reports endpoints
  async exportEmployees() {
    const response = await this.client.get("/reports/employees/export", {
      responseType: "blob",
    });
    return response.data;
  }

  async importEmployees(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.client.post(
      "/reports/employees/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async exportPayroll(params?: any) {
    const response = await this.client.get("/reports/payroll/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  async exportAttendance(params?: any) {
    const response = await this.client.get("/reports/attendance/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  async importShifts(file: File, rosterId: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("rosterId", rosterId);
    const response = await this.client.post(
      "/reports/shifts/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Admin endpoints
  async getDashboardAnalytics() {
    const response = await this.client.get("/admin/analytics");
    return response.data;
  }

  async getCompanyStats() {
    const response = await this.client.get("/admin/company/stats");
    return response.data;
  }

  async getRecentActivity(params?: any) {
    const response = await this.client.get("/admin/activity", { params });
    return response.data;
  }

  async updateCompanySettings(data: any) {
    const response = await this.client.patch("/admin/company/settings", data);
    return response.data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
