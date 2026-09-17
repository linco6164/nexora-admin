import axios from "axios";

const API_URL = "https://api.nx-store.com";

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email, password) => client.post("/auth/login", { email, password }),
};

export const adminApi = {
  createUser: (data) => client.post("/admin/users", data),
  getStats: () => client.get("/admin/stats"),
  getUsers: (page = 1, search = "") =>
    client.get(`/admin/users?page=${page}&search=${search}`),
  updateUserRole: (id, role) =>
    client.patch(`/admin/users/${id}/role`, { role }),
  updateUserDepartment: (id, department) =>
    client.patch(`/admin/users/${id}/department`, {
      department,
    }),
  toggleBanUser: (id, reason) =>
    client.patch(`/admin/users/${id}/ban`, { reason }),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),
  getListings: (page = 1) => client.get(`/admin/listings?page=${page}`),
  deleteListing: (id) => client.delete(`/admin/listings/${id}`),
  sendBroadcast: (title, body) =>
    client.post("/admin/broadcast", { title, body }),
  getUserDetails: (id) => client.get(`/admin/users/${id}`),
  resetUserPassword: (id, newPassword) =>
    client.patch(`/admin/users/${id}/password`, { newPassword }),
  updateUserEmail: (id, email) =>
    client.patch(`/admin/users/${id}/email`, { email }),
  disableUserTwoFactor: (id) => client.patch(`/admin/users/${id}/2fa/disable`),
  getWithdrawals: (page = 1, status = "pending") =>
    client.get(`/admin/withdrawals?page=${page}&status=${status}`),

  approveWithdrawal: (id) => client.post(`/admin/withdrawals/${id}/approve`),

  rejectWithdrawal: (id) => client.post(`/admin/withdrawals/${id}/reject`),

  getSupportTickets: (status = "", category = "") => {
    const params = new URLSearchParams();

    if (status) {
      params.append("status", status);
    }

    if (category) {
      params.append("category", category);
    }

    const query = params.toString();

    return client.get(`/support/admin/tickets${query ? `?${query}` : ""}`);
  },

  getSupportTicket: (id) => client.get(`/support/admin/tickets/${id}`),

  sendSupportMessage: (id, message) =>
    client.post(`/support/admin/tickets/${id}/messages`, {
      message,
    }),

  updateSupportTicketStatus: (id, status) =>
    client.patch(`/support/admin/tickets/${id}/status`, {
      status,
    }),
};

export default client;
