/**
 * Admin API Client - Uses Real Backend APIs via API Gateway
 * All requests go through http://localhost:3000/api/v1
 */

// Import the real API from api.ts
import {
  dashboardAPI,
  usersAPI,
  ridesAPI,
  sosAPI,
  moderationAPI,
  reportsAPI,
  systemAPI,
} from './api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth API (not proxied through admin routes)
const authAPI = {
  login: async (phone: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Admin login failed' }));
      throw new Error(error.message || 'Admin login failed');
    }
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Logout failed');
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    
    return response.json();
  },
};

// Export unified API client
export const api = {
  auth: authAPI,
  dashboard: dashboardAPI,
  users: usersAPI,
  rides: ridesAPI,
  sos: sosAPI,
  moderation: moderationAPI,
  reports: reportsAPI,
  system: systemAPI,
};

export default api;
