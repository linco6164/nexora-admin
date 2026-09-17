const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5173";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

async function request(
  endpoint,
  options = {},
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Eroare la comunicarea cu serverul.",
    );
  }

  return data;
}


/*
|--------------------------------------------------------------------------
| STAFF INFO
|--------------------------------------------------------------------------
*/

export async function getSupportStaffInfo() {
  return request("/support/staff/info");
}


/*
|--------------------------------------------------------------------------
| STATS
|--------------------------------------------------------------------------
*/

export async function getSupportStats() {
  return request("/support/staff/stats");
}


/*
|--------------------------------------------------------------------------
| TICKETS
|--------------------------------------------------------------------------
*/

export async function getSupportTickets({
  status,
  department,
  assignedTo,
  priority,
} = {}) {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (department) {
    params.set("department", department);
  }

  if (assignedTo) {
    params.set("assignedTo", assignedTo);
  }

  if (priority) {
    params.set("priority", priority);
  }

  const query = params.toString();

  return request(
    `/support/staff/tickets${
      query ? `?${query}` : ""
    }`,
  );
}


export async function getSupportTicket(
  ticketId,
) {
  return request(
    `/support/staff/tickets/${ticketId}`,
  );
}


/*
|--------------------------------------------------------------------------
| ASSIGNMENT
|--------------------------------------------------------------------------
*/

export async function assignSupportTicket(
  ticketId,
) {
  return request(
    `/support/staff/tickets/${ticketId}/assign`,
    {
      method: "POST",
    },
  );
}


export async function unassignSupportTicket(
  ticketId,
) {
  return request(
    `/support/staff/tickets/${ticketId}/unassign`,
    {
      method: "POST",
    },
  );
}


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

export async function updateSupportTicketStatus(
  ticketId,
  status,
) {
  return request(
    `/support/staff/tickets/${ticketId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );
}


/*
|--------------------------------------------------------------------------
| PRIORITY
|--------------------------------------------------------------------------
*/

export async function updateSupportTicketPriority(
  ticketId,
  priority,
) {
  return request(
    `/support/staff/tickets/${ticketId}/priority`,
    {
      method: "PATCH",
      body: JSON.stringify({
        priority,
      }),
    },
  );
}


/*
|--------------------------------------------------------------------------
| MESSAGE
|--------------------------------------------------------------------------
*/

export async function sendSupportMessage(
  ticketId,
  message,
) {
  return request(
    `/support/staff/tickets/${ticketId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
      }),
    },
  );
}