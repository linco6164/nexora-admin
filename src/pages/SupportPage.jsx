import { useEffect, useMemo, useState } from "react";

import {
  getSupportStaffInfo,
  getSupportStats,
  getSupportTickets,
  getSupportTicket,
  assignSupportTicket,
  updateSupportTicketStatus,
  updateSupportTicketPriority,
  sendSupportMessage,
} from "../api/supportApi";

import {
  connectSupportSocket,
  disconnectSupportSocket,
} from "../api/supportSocket";

import "./css/SupportPage.css";

const DEPARTMENT_LABELS = {
  general: "General",
  call_center: "Call Center",
  it: "IT",
  payments: "Payments",
  orders: "Orders",
  logistics: "Logistics",
  moderation: "Moderation",
  account_security: "Account & Security",
};

const STATUS_LABELS = {
  open: "Open",
  pending: "On Hold",
  closed: "Resolved",
};

const PRIORITY_LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTicketPreview(ticket) {
  if (!ticket?.messages || ticket.messages.length === 0) {
    return "No messages";
  }

  const message = ticket.messages[ticket.messages.length - 1];

  return message?.message || "No messages";
}

export default function SupportPage() {
  const [staff, setStaff] = useState(null);
  const [stats, setStats] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [activeFilter, setActiveFilter] = useState("unassigned");

  const [activeDepartment, setActiveDepartment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [ticketLoading, setTicketLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD STAFF
  |--------------------------------------------------------------------------
  */

  async function loadStaff() {
    const response = await getSupportStaffInfo();

    setStaff(response);
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD STATS
  |--------------------------------------------------------------------------
  */

  async function loadStats() {
    const response = await getSupportStats();

    setStats(response.stats);
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD TICKETS
  |--------------------------------------------------------------------------
  */

  async function loadTickets() {
    try {
      setLoading(true);
      setError("");

      const filters = {};

      if (
        activeFilter !== "all" &&
        activeFilter !== "my" &&
        activeFilter !== "unassigned" &&
        activeFilter !== "open" &&
        activeFilter !== "pending" &&
        activeFilter !== "closed"
      ) {
        filters.status = activeFilter;
      }

      if (
        activeFilter === "open" ||
        activeFilter === "pending" ||
        activeFilter === "closed"
      ) {
        filters.status = activeFilter;
      }

      if (activeFilter === "unassigned") {
        filters.assignedTo = "unassigned";
      }

      if (activeFilter === "my" && staff?.id) {
        filters.assignedTo = staff.id;
      }

      if (activeDepartment) {
        filters.department = activeDepartment;
      }

      const response = await getSupportTickets(filters);

      setTickets(response.tickets || []);
    } catch (err) {
      console.error(err);

      setError(err.message || "Nu s-au putut încărca ticketurile.");
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function init() {
      try {
        await loadStaff();
        await loadStats();
      } catch (err) {
        console.error(err);

        setError(err.message || "Nu s-au putut încărca datele Support.");
      }
    }

    init();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD TICKETS AFTER STAFF
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!staff) return;

    loadTickets();
  }, [staff, activeFilter, activeDepartment]);

  /*
  |--------------------------------------------------------------------------
  | SUPPORT SOCKET
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!staff) {
      return;
    }

    const socket = connectSupportSocket();

    function handleTicketNew(data) {
      const ticket = data?.ticket;

      if (!ticket) {
        return;
      }

      setTickets((current) => {
        const exists = current.some((item) => item._id === ticket._id);

        if (exists) {
          return current;
        }

        return [ticket, ...current];
      });

      setStats((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          open: (current.open || 0) + 1,
          unassigned: ticket.assignedTo
            ? current.unassigned || 0
            : (current.unassigned || 0) + 1,
        };
      });
    }

    function handleTicketUpdated(data) {
      const ticket = data?.ticket;

      if (!ticket) {
        return;
      }

      setTickets((current) =>
        current.map((item) => (item._id === ticket._id ? ticket : item)),
      );

      setSelectedTicket((current) => {
        if (!current || current._id !== ticket._id) {
          return current;
        }

        return ticket;
      });
    }

    function handleTicketAssigned(data) {
      const ticket = data?.ticket;

      if (!ticket) {
        return;
      }

      setTickets((current) =>
        current.map((item) => (item._id === ticket._id ? ticket : item)),
      );

      setSelectedTicket((current) => {
        if (!current || current._id !== ticket._id) {
          return current;
        }

        return ticket;
      });
    }

    function handleMessageNew(data) {
      const ticketId = data?.ticketId;
      const newMessage = data?.message;

      if (!ticketId || !newMessage) {
        return;
      }

      setTickets((current) =>
        current.map((ticket) => {
          if (ticket._id !== ticketId) {
            return ticket;
          }

          const alreadyExists = ticket.messages?.some(
            (item) => item._id && newMessage._id && item._id === newMessage._id,
          );

          if (alreadyExists) {
            return ticket;
          }

          return {
            ...ticket,
            messages: [...(ticket.messages || []), newMessage],
          };
        }),
      );

      setSelectedTicket((current) => {
        if (!current || current._id !== ticketId) {
          return current;
        }

        const alreadyExists = current.messages?.some(
          (item) => item._id && newMessage._id && item._id === newMessage._id,
        );

        if (alreadyExists) {
          return current;
        }

        return {
          ...current,
          messages: [...(current.messages || []), newMessage],
        };
      });
    }

    socket.on("support:ticket:new", handleTicketNew);

    socket.on("support:ticket:updated", handleTicketUpdated);

    socket.on("support:ticket:assigned", handleTicketAssigned);

    socket.on("support:message:new", handleMessageNew);

    return () => {
      socket.off("support:ticket:new", handleTicketNew);

      socket.off("support:ticket:updated", handleTicketUpdated);

      socket.off("support:ticket:assigned", handleTicketAssigned);

      socket.off("support:message:new", handleMessageNew);

      disconnectSupportSocket();
    };
  }, [staff]);

  /*
  |--------------------------------------------------------------------------
  | OPEN TICKET
  |--------------------------------------------------------------------------
  */

  async function openTicket(ticketId) {
    try {
      setTicketLoading(true);
      setError("");

      const response = await getSupportTicket(ticketId);

      setSelectedTicket(response.ticket);
    } catch (err) {
      console.error(err);

      setError(err.message || "Ticketul nu a putut fi încărcat.");
    } finally {
      setTicketLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ASSIGN
  |--------------------------------------------------------------------------
  */

  async function assignToMe() {
    if (!selectedTicket) return;

    try {
      const response = await assignSupportTicket(selectedTicket._id);

      setSelectedTicket(response.ticket);

      await loadTickets();
    } catch (err) {
      console.error(err);

      setError(err.message || "Ticketul nu a putut fi preluat.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  async function changeStatus(status) {
    if (!selectedTicket) return;

    try {
      const response = await updateSupportTicketStatus(
        selectedTicket._id,
        status,
      );

      setSelectedTicket(response.ticket);

      await loadTickets();
      await loadStats();
    } catch (err) {
      console.error(err);

      setError(err.message || "Statusul nu a putut fi schimbat.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PRIORITY
  |--------------------------------------------------------------------------
  */

  async function changePriority(priority) {
    if (!selectedTicket) return;

    try {
      const response = await updateSupportTicketPriority(
        selectedTicket._id,
        priority,
      );

      setSelectedTicket(response.ticket);

      await loadTickets();
    } catch (err) {
      console.error(err);

      setError(err.message || "Prioritatea nu a putut fi schimbată.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  async function sendMessage() {
    if (!selectedTicket || !message.trim() || sending) {
      return;
    }

    try {
      setSending(true);

      const response = await sendSupportMessage(
        selectedTicket._id,
        message.trim(),
      );

      setSelectedTicket(response.ticket);

      setMessage("");
      await loadTickets();
    } catch (err) {
      console.error(err);

      setError(err.message || "Mesajul nu a putut fi trimis.");
    } finally {
      setSending(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DEPARTMENTS
  |--------------------------------------------------------------------------
  */

  const departments = useMemo(() => {
    return staff?.departments || [];
  }, [staff]);

  if (loading && !staff) {
    return <div className="support-page-loading">Se încarcă Support...</div>;
  }

  return (
    <div className="support-page">
      {/* SIDEBAR */}

      <aside className="support-sidebar">
        <div className="support-sidebar-header">
          <div>
            <h1>Support</h1>

            <span>{staff?.role || "Support"}</span>
          </div>
        </div>

        <div className="support-sidebar-section">
          <button
            className={
              activeFilter === "my"
                ? "support-nav-item active"
                : "support-nav-item"
            }
            onClick={() => {
              setActiveFilter("my");
              setActiveDepartment(null);
            }}
          >
            <span>My Tickets</span>

            <strong>{stats?.my ?? 0}</strong>
          </button>

          <button
            className={
              activeFilter === "unassigned"
                ? "support-nav-item active"
                : "support-nav-item"
            }
            onClick={() => {
              setActiveFilter("unassigned");
              setActiveDepartment(null);
            }}
          >
            <span>Unassigned</span>

            <strong>{stats?.unassigned ?? 0}</strong>
          </button>

          <button
            className={
              activeFilter === "open"
                ? "support-nav-item active"
                : "support-nav-item"
            }
            onClick={() => {
              setActiveFilter("open");
              setActiveDepartment(null);
            }}
          >
            <span>Open</span>

            <strong>{stats?.open ?? 0}</strong>
          </button>

          <button
            className={
              activeFilter === "pending"
                ? "support-nav-item active"
                : "support-nav-item"
            }
            onClick={() => {
              setActiveFilter("pending");
              setActiveDepartment(null);
            }}
          >
            <span>On Hold</span>

            <strong>{stats?.pending ?? 0}</strong>
          </button>

          <button
            className={
              activeFilter === "closed"
                ? "support-nav-item active"
                : "support-nav-item"
            }
            onClick={() => {
              setActiveFilter("closed");
              setActiveDepartment(null);
            }}
          >
            <span>Resolved</span>

            <strong>{stats?.closed ?? 0}</strong>
          </button>
        </div>

        <div className="support-sidebar-title">DEPARTMENTS</div>

        <div className="support-departments">
          {departments.map((department) => (
            <button
              key={department}
              className={
                activeDepartment === department
                  ? "support-department active"
                  : "support-department"
              }
              onClick={() => {
                setActiveDepartment(department);

                setActiveFilter("all");
              }}
            >
              <span className="department-dot" />

              <span>{DEPARTMENT_LABELS[department] || department}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* TICKET LIST */}

      <section className="support-ticket-list">
        <div className="support-list-header">
          <div>
            <h2>
              {activeDepartment
                ? DEPARTMENT_LABELS[activeDepartment]
                : activeFilter === "my"
                  ? "My Tickets"
                  : activeFilter === "unassigned"
                    ? "Unassigned"
                    : activeFilter === "open"
                      ? "Open"
                      : activeFilter === "pending"
                        ? "On Hold"
                        : activeFilter === "closed"
                          ? "Resolved"
                          : "Tickets"}
            </h2>

            <span>{tickets.length} ticketuri</span>
          </div>
        </div>

        {error && <div className="support-error">{error}</div>}

        <div className="support-tickets">
          {loading ? (
            <div className="support-empty">Se încarcă...</div>
          ) : tickets.length === 0 ? (
            <div className="support-empty">Nu există ticketuri.</div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket._id}
                className={
                  selectedTicket?._id === ticket._id
                    ? "support-ticket active"
                    : "support-ticket"
                }
                onClick={() => openTicket(ticket._id)}
              >
                <div className="ticket-top">
                  <div className="ticket-title-row">
                    <span className="ticket-number">
                      #{ticket.ticketNumber}
                    </span>

                    <span className="ticket-subject">{ticket.subject}</span>
                  </div>

                  <span className="ticket-date">
                    {formatDate(ticket.updatedAt)}
                  </span>
                </div>

                <div className="ticket-preview">{getTicketPreview(ticket)}</div>

                <div className="ticket-meta">
                  <span className={`ticket-status status-${ticket.status}`}>
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </span>

                  <span
                    className={`ticket-priority priority-${ticket.priority}`}
                  >
                    {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                  </span>

                  <span className="ticket-department">
                    {DEPARTMENT_LABELS[ticket.department] || ticket.department}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* CONVERSATION */}

      <main className="support-conversation">
        {!selectedTicket ? (
          <div className="support-no-ticket">
            <div className="support-no-ticket-icon">?</div>

            <h2>Selectează un ticket</h2>

            <p>Selectează un ticket din listă pentru a vedea conversația.</p>
          </div>
        ) : ticketLoading ? (
          <div className="support-no-ticket">Se încarcă ticketul...</div>
        ) : (
          <>
            <header className="conversation-header">
              <div>
                <span className="conversation-department">
                  {DEPARTMENT_LABELS[selectedTicket.department] ||
                    selectedTicket.department}
                </span>

                <h2>
                  #{selectedTicket.ticketNumber}{" "}
                  {selectedTicket.subject}
                </h2>

                <span className="conversation-category">
                  {selectedTicket.category}
                </span>
              </div>

              <div className="conversation-actions">
                {!selectedTicket.assignedTo && (
                  <button onClick={assignToMe} className="button-primary">
                    Assign to me
                  </button>
                )}

                <select
                  value={selectedTicket.status}
                  onChange={(event) => changeStatus(event.target.value)}
                >
                  <option value="open">Open</option>

                  <option value="pending">On Hold</option>

                  <option value="closed">Resolved</option>
                </select>

                <select
                  value={selectedTicket.priority}
                  onChange={(event) => changePriority(event.target.value)}
                >
                  <option value="low">Low</option>

                  <option value="normal">Normal</option>

                  <option value="high">High</option>

                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </header>

            <div className="conversation-messages">
              {selectedTicket.messages?.map((item, index) => {
                const isStaff = item.senderType === "admin";

                return (
                  <div
                    key={item._id || index}
                    className={
                      isStaff
                        ? "conversation-message staff"
                        : "conversation-message user"
                    }
                  >
                    <div className="message-author">
                      {isStaff ? "Support" : "Client"}
                    </div>

                    <div className="message-bubble">{item.message}</div>

                    <div className="message-time">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="conversation-composer">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Scrie un răspuns..."
                rows={3}
              />

              <button
                className="button-primary"
                onClick={sendMessage}
                disabled={sending || !message.trim()}
              >
                {sending ? "Se trimite..." : "Trimite"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
