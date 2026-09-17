import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";

import { adminApi } from "../api/client";
import "./css/CreateUserPage.css";

const ROLES = [
  {
    value: "user",
    label: "User",
  },
  {
    value: "admin",
    label: "Administrator",
  },
  {
    value: "support_agent",
    label: "Support Agent",
  },
  {
    value: "support_manager",
    label: "Support Manager",
  },
  {
    value: "it_agent",
    label: "IT Agent",
  },
  {
    value: "finance_agent",
    label: "Finance Agent",
  },
  {
    value: "logistics_agent",
    label: "Logistics Agent",
  },
  {
    value: "moderator",
    label: "Moderator",
  },
];

const DEPARTMENTS = [
  {
    value: "general",
    label: "General",
  },
  {
    value: "call_center",
    label: "Call Center",
  },
  {
    value: "it",
    label: "IT",
  },
  {
    value: "payments",
    label: "Payments",
  },
  {
    value: "orders",
    label: "Orders",
  },
  {
    value: "logistics",
    label: "Logistics",
  },
  {
    value: "moderation",
    label: "Moderation",
  },
  {
    value: "account_security",
    label: "Account & Security",
  },
];

export default function CreateUserPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "user",
    department: "general",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.username.trim()) {
      setError("Introdu username-ul.");
      return;
    }

    if (!form.email.trim()) {
      setError("Introdu adresa de email.");
      return;
    }

    if (!form.password) {
      setError("Introdu parola.");
      return;
    }

    if (form.password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminApi.createUser({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        role: form.role,
        department: form.department,
      });

      console.log("CREATE USER:", response.data);

      setSuccess("Contul a fost creat cu succes.");

      setForm({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: "user",
        department: "general",
      });
    } catch (err) {
      console.error("CREATE USER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Contul nu a putut fi creat.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-user-page">
      <div className="create-user-header">
        <div>
          <button
            type="button"
            className="create-user-back"
            onClick={() => navigate("/users")}
          >
            <ArrowLeft size={18} />
            Înapoi la utilizatori
          </button>

          <div className="create-user-title">
            <div className="create-user-title-icon">
              <UserPlus size={25} />
            </div>

            <div>
              <h1>Creare utilizator</h1>
              <p>
                Creează un cont nou și atribuie rolul și departamentul.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="create-user-alert create-user-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="create-user-alert create-user-alert-success">
          {success}
        </div>
      )}

      <form
        className="create-user-card"
        onSubmit={handleSubmit}
      >
        <div className="create-user-section">
          <h2>Informații cont</h2>

          <div className="create-user-grid">
            <div className="create-user-field">
              <label htmlFor="username">
                Username <span>*</span>
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="ex. nexora_user"
                autoComplete="off"
              />
            </div>

            <div className="create-user-field">
              <label htmlFor="email">
                Email <span>*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                autoComplete="off"
              />
            </div>

            <div className="create-user-field">
              <label htmlFor="password">
                Parolă <span>*</span>
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 caractere"
                autoComplete="new-password"
              />
            </div>

            <div className="create-user-field">
              <label htmlFor="fullName">
                Nume complet
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nume și prenume"
              />
            </div>

            <div className="create-user-field">
              <label htmlFor="phone">
                Telefon
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+40..."
              />
            </div>
          </div>
        </div>

        <div className="create-user-section">
          <h2>Permisiuni</h2>

          <div className="create-user-grid">
            <div className="create-user-field">
              <label htmlFor="role">
                Rol <span>*</span>
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                {ROLES.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-user-field">
              <label htmlFor="department">
                Departament <span>*</span>
              </label>

              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                {DEPARTMENTS.map((department) => (
                  <option
                    key={department.value}
                    value={department.value}
                  >
                    {department.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="create-user-permission-info">
            <strong>Rol selectat:</strong>{" "}
            {
              ROLES.find(
                (role) => role.value === form.role,
              )?.label
            }

            <br />

            <strong>Departament:</strong>{" "}
            {
              DEPARTMENTS.find(
                (department) =>
                  department.value === form.department,
              )?.label
            }
          </div>
        </div>

        <div className="create-user-footer">
          <button
            type="button"
            className="create-user-cancel"
            onClick={() => navigate("/users")}
            disabled={loading}
          >
            Anulează
          </button>

          <button
            type="submit"
            className="create-user-submit"
            disabled={loading}
          >
            <UserPlus size={18} />

            {loading
              ? "Se creează..."
              : "Creează utilizator"}
          </button>
        </div>
      </form>
    </div>
  );
}