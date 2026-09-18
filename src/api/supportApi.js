import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const supportClient = axios.create({
  baseURL: API_URL,
});

supportClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getSupportStaffInfo() {
  const response = await supportClient.get("/support/staff/info");

  return response.data;
}

export async function getSupportStats() {
  const response = await supportClient.get("/support/staff/stats");

  return response.data;
}

export async function getSupportTickets(params = {}) {
  const response = await supportClient.get("/support/staff/tickets", {
    params,
  });

  const data = response.data;

  return {
    ...data,
    tickets: Array.isArray(data.tickets)
      ? data.tickets
      : Array.isArray(data.tickets?.tickets)
        ? data.tickets.tickets
        : [],
  };
}

export async function getSupportTicket(id) {
  const response = await supportClient.get(`/support/staff/tickets/${id}`);

  return response.data;
}

export async function assignSupportTicket(id) {
  const response = await supportClient.post(
    `/support/staff/tickets/${id}/assign`,
  );

  return response.data;
}

export async function unassignSupportTicket(id) {
  const response = await supportClient.post(
    `/support/staff/tickets/${id}/unassign`,
  );

  return response.data;
}

export async function updateSupportTicketStatus(id, status) {
  const response = await supportClient.patch(
    `/support/staff/tickets/${id}/status`,
    {
      status,
    },
  );

  return response.data;
}

export async function updateSupportTicketPriority(id, priority) {
  const response = await supportClient.patch(
    `/support/staff/tickets/${id}/priority`,
    {
      priority,
    },
  );

  return response.data;
}

export async function sendSupportMessage(id, message) {
  const response = await supportClient.post(
    `/support/staff/tickets/${id}/messages`,
    {
      message,
    },
  );

  return response.data;
}

export const supportApi = {
  getStaffInfo: getSupportStaffInfo,
  getStats: getSupportStats,
  getTickets: getSupportTickets,
  getTicket: getSupportTicket,
  assignToMe: assignSupportTicket,
  unassign: unassignSupportTicket,
  updateStatus: updateSupportTicketStatus,
  updatePriority: updateSupportTicketPriority,
  sendMessage: sendSupportMessage,
};

export default supportApi;
