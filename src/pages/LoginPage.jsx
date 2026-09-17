import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate('/');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Nexora Admin</h1>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Se conectează...' : 'Autentificare'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5' },
  form: { background: 'white', padding: 40, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: 320 },
  title: { textAlign: 'center', marginBottom: 24, color: '#50C878' },
  input: { width: '100%', padding: 12, marginBottom: 12, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' },
  button: { width: '100%', padding: 12, background: '#50C878', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  error: { color: 'red', fontSize: 14, marginBottom: 12 },
};