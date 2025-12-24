/**
 * Admin API Client with Mock Data Support
 * Backend бэлэн болтол mock data ашиглана
 */

import { mockAPI } from './mockApi';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

// Export бүх API-г
export const api = {
  dashboard: mockAPI.dashboard,
  users: mockAPI.users,
  rides: mockAPI.rides,
  sos: mockAPI.sos,
  moderation: mockAPI.moderation,
  reports: mockAPI.reports,
  system: mockAPI.system,
  auth: mockAPI.auth,
};

export default api;
