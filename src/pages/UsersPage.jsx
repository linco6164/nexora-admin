import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./css/UsersPage.css";

import { adminApi } from "../api/client";

const ROLE_LABELS = {
  user: "User",
  admin: "Administrator",
  support_agent: "Support Agent",
  support_manager: "Support Manager",
  it_agent: "IT Agent",
  finance_agent: "Finance Agent",
  logistics_agent: "Logistics Agent",
  moderator: "Moderator",
};

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

const ROLES = [
  "user",
  "admin",
  "support_agent",
  "support_manager",
  "it_agent",
  "finance_agent",
  "logistics_agent",
  "moderator",
];

const DEPARTMENTS = [
  "general",
  "call_center",
  "it",
  "payments",
  "orders",
  "logistics",
  "moderation",
  "account_security",
];

const BAN_REASONS = [
  {
    value: "fraud",
    label: "Fraudă",
  },
  {
    value: "scam",
    label: "Înșelătorie / Scam",
  },
  {
    value: "prohibited_items",
    label: "Vânzare de produse interzise",
  },
  {
    value: "fake_products",
    label: "Produse contrafăcute",
  },
  {
    value: "harassment",
    label: "Hărțuire / Comportament abuziv",
  },
  {
    value: "spam",
    label: "Spam",
  },
  {
    value: "multiple_accounts",
    label: "Conturi multiple",
  },
  {
    value: "policy_violation",
    label: "Încălcarea regulilor platformei",
  },
  {
    value: "other",
    label: "Alt motiv",
  },
];

export default function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");

  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [savingId, setSavingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const [banModalUser, setBanModalUser] = useState(null);

  const [banReason, setBanReason] = useState("");

  const [banCustomReason, setBanCustomReason] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getUsers(1, search);

      console.log("GET /admin/users:", response.data);

      const data = response.data;

      setUsers(data?.users || data?.data || []);
    } catch (err) {
      console.error("GET USERS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Nu s-au putut încărca utilizatorii.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchValue = search.trim().toLowerCase();

    const name = user.name?.toLowerCase() || "";

    const email = user.email?.toLowerCase() || "";

    const username = user.username?.toLowerCase() || "";

    const matchesSearch =
      !searchValue ||
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      username.includes(searchValue);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesDepartment =
      departmentFilter === "all" || user.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDepartment;
  });

  async function handleRoleChange(userId, role) {
    if (!userId || !role) {
      return;
    }

    try {
      setSavingId(userId);
      setError("");

      const response = await adminApi.updateUserRole(userId, role);

      console.log("UPDATE ROLE:", response.data);

      const updatedUser = response.data?.user || response.data?.data;

      if (updatedUser) {
        setUsers((current) =>
          current.map((user) => (user._id === userId ? updatedUser : user)),
        );
      } else {
        setUsers((current) =>
          current.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  role,
                }
              : user,
          ),
        );
      }
    } catch (err) {
      console.error("UPDATE ROLE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Rolul nu a putut fi modificat.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDepartmentChange(userId, department) {
    if (!userId || !department) {
      return;
    }

    try {
      setSavingId(userId);
      setError("");

      const response = await adminApi.updateUserDepartment(userId, department);

      console.log("UPDATE DEPARTMENT:", response.data);

      const updatedUser = response.data?.user || response.data?.data;

      if (updatedUser) {
        setUsers((current) =>
          current.map((user) => (user._id === userId ? updatedUser : user)),
        );
      } else {
        setUsers((current) =>
          current.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  department,
                }
              : user,
          ),
        );
      }
    } catch (err) {
      console.error("UPDATE DEPARTMENT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Departamentul nu a putut fi modificat.",
      );
    } finally {
      setSavingId(null);
    }
  }

  function openBanModal(user) {
    if (!user?._id) {
      return;
    }

    setError("");
    setBanModalUser(user);
    setBanReason("");
    setBanCustomReason("");
  }

  function closeBanModal() {
    if (savingId) {
      return;
    }

    setBanModalUser(null);
    setBanReason("");
    setBanCustomReason("");
  }

  async function confirmBanUser() {
    if (!banModalUser?._id) {
      return;
    }

    let finalReason = "";

    if (banReason === "other") {
      finalReason = banCustomReason.trim();
    } else {
      const selectedReason = BAN_REASONS.find(
        (reason) => reason.value === banReason,
      );

      finalReason = selectedReason?.label || "";
    }

    if (!finalReason) {
      setError("Selectează un motiv pentru blocarea contului.");
      return;
    }

    try {
      setSavingId(banModalUser._id);

      setError("");

      const response = await adminApi.toggleBanUser(
        banModalUser._id,
        finalReason,
      );

      console.log("BAN USER:", response.data);

      const updatedUser = response.data?.user || response.data?.data;

      if (updatedUser) {
        setUsers((current) =>
          current.map((user) =>
            user._id === banModalUser._id ? updatedUser : user,
          ),
        );
      } else {
        setUsers((current) =>
          current.map((user) =>
            user._id === banModalUser._id
              ? {
                  ...user,
                  banned: true,
                  banReason: finalReason,
                }
              : user,
          ),
        );
      }

      closeBanModal();
    } catch (err) {
      console.error("BAN USER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Contul nu a putut fi blocat.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleUnbanUser(user) {
    if (!user?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Sigur vrei să deblochezi contul ${
        user.name || user.username || user.email || ""
      }?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingId(user._id);
      setError("");

      const response = await adminApi.toggleBanUser(user._id, "");

      console.log("UNBAN USER:", response.data);

      const updatedUser = response.data?.user || response.data?.data;

      if (updatedUser) {
        setUsers((current) =>
          current.map((currentUser) =>
            currentUser._id === user._id ? updatedUser : currentUser,
          ),
        );
      } else {
        setUsers((current) =>
          current.map((currentUser) =>
            currentUser._id === user._id
              ? {
                  ...currentUser,
                  banned: false,
                  banReason: null,
                }
              : currentUser,
          ),
        );
      }
    } catch (err) {
      console.error("UNBAN USER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Contul nu a putut fi deblocat.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteUser(user) {
    if (!user?._id) {
      return;
    }

    const confirmed = window.confirm(
      `ATENȚIE!\n\nSigur vrei să ștergi definitiv contul ${
        user.name || user.username || user.email || ""
      }?\n\nAceastă acțiune nu poate fi anulată.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user._id);
      setError("");

      await adminApi.deleteUser(user._id);

      setUsers((current) =>
        current.filter((currentUser) => currentUser._id !== user._id),
      );
    } catch (err) {
      console.error("DELETE USER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Contul nu a putut fi șters.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openUserDetails(userId) {
    if (!userId) {
      return;
    }

    navigate(`/users/${userId}`);
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>Users</h1>

          <p>Gestionare utilizatori, roluri și departamente</p>
        </div>

        <button
          className="users-refresh-button"
          onClick={loadUsers}
          disabled={loading}
        >
          ↻ Refresh
        </button>

        <button
          className="users-create-button"
          onClick={() => navigate("/users/create")}
        >
          + Creează utilizator
        </button>
      </div>

      {error && <div className="users-error">{error}</div>}

      <div className="users-toolbar">
        <div className="users-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Caută utilizator..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="all">Toate rolurile</option>

          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
        >
          <option value="all">Toate departamentele</option>

          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {DEPARTMENT_LABELS[department]}
            </option>
          ))}
        </select>
      </div>

      <div className="users-table-wrapper">
        {loading ? (
          <div className="users-loading">Se încarcă utilizatorii...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-empty">Nu există utilizatori.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isSaving = savingId === user._id;

                const isDeleting = deletingId === user._id;

                return (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {(user.name || user.username || user.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user.name || user.username || "User"}
                          </strong>

                          <small>
                            {user.username ? `@${user.username}` : user._id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{user.email || "-"}</td>

                    <td>
                      <select
                        className="user-role-select"
                        value={user.role || "user"}
                        disabled={isSaving || isDeleting}
                        onChange={(event) =>
                          handleRoleChange(user._id, event.target.value)
                        }
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select
                        className="user-department-select"
                        value={user.department || "general"}
                        disabled={isSaving || isDeleting}
                        onChange={(event) =>
                          handleDepartmentChange(user._id, event.target.value)
                        }
                      >
                        {DEPARTMENTS.map((department) => (
                          <option key={department} value={department}>
                            {DEPARTMENT_LABELS[department]}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      {user.banned ? (
                        <span className="user-status banned">Banned</span>
                      ) : (
                        <span className="user-status active">Active</span>
                      )}
                    </td>

                    <td>
                      <div className="user-actions">
                        <button
                          type="button"
                          className="user-action-details"
                          onClick={() => openUserDetails(user._id)}
                          disabled={isDeleting}
                        >
                          Detalii
                        </button>

                        {user.banned ? (
                          <button
                            type="button"
                            className="user-action-unblock"
                            onClick={() => handleUnbanUser(user)}
                            disabled={isSaving || isDeleting}
                          >
                            {isSaving ? "..." : "Deblocare"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="user-action-block"
                            onClick={() => openBanModal(user)}
                            disabled={isSaving || isDeleting}
                          >
                            Blocare
                          </button>
                        )}

                        <button
                          type="button"
                          className="user-action-delete"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isDeleting || isSaving}
                        >
                          {isDeleting ? "Se șterge..." : "Ștergere"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {banModalUser && (
        <div className="ban-modal-overlay" onClick={closeBanModal}>
          <div
            className="ban-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ban-modal-header">
              <div>
                <h2>Blochează contul</h2>

                <p>
                  {banModalUser.name ||
                    banModalUser.username ||
                    banModalUser.email ||
                    "Utilizator"}
                </p>
              </div>

              <button
                type="button"
                className="ban-modal-close"
                onClick={closeBanModal}
              >
                ×
              </button>
            </div>

            <div className="ban-modal-content">
              <label>Motivul blocării</label>

              <select
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
              >
                <option value="">Selectează motivul</option>

                {BAN_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>

              {banReason === "other" && (
                <textarea
                  value={banCustomReason}
                  onChange={(event) => setBanCustomReason(event.target.value)}
                  placeholder="Introdu motivul blocării..."
                  maxLength={500}
                  rows={4}
                />
              )}

              <div className="ban-character-count">
                {banReason === "other" ? `${banCustomReason.length}/500` : ""}
              </div>
            </div>

            <div className="ban-modal-actions">
              <button
                type="button"
                className="ban-modal-cancel"
                onClick={closeBanModal}
                disabled={savingId === banModalUser._id}
              >
                Anulează
              </button>

              <button
                type="button"
                className="ban-modal-confirm"
                disabled={
                  savingId === banModalUser._id ||
                  !banReason ||
                  (banReason === "other" && !banCustomReason.trim())
                }
                onClick={confirmBanUser}
              >
                {savingId === banModalUser._id
                  ? "Se blochează..."
                  : "Blochează contul"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
