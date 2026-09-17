import { useState } from 'react';
import {
  Bell,
  Send,
} from 'lucide-react';

import { adminApi } from '../api/client';
import './css/BroadcastPage.css';

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus(null);

    try {
      await adminApi.sendBroadcast(
        title,
        body,
      );

      setStatus({
        type: 'success',
        message:
          'Notificarea a fost trimisă cu succes!',
      });

      setTitle('');
      setBody('');
    } catch (err) {
      setStatus({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Eroare la trimiterea notificării.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="broadcast-page">
      <div className="broadcast-header">
        <h1>Notificări</h1>

        <p>
          Trimite o notificare push către utilizatorii
          aplicației Nexora.
        </p>
      </div>

      <div className="broadcast-layout">
        <div className="broadcast-card">
          <div className="broadcast-card-title">
            <div className="broadcast-card-title-icon">
              <Bell size={19} />
            </div>

            Trimite notificare
          </div>

          <form
            className="broadcast-form"
            onSubmit={handleSend}
          >
            <label className="broadcast-label">
              Titlu

              <input
                className="broadcast-input"
                placeholder="Ex. Ofertă nouă disponibilă"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />
            </label>

            <label className="broadcast-label">
              Mesaj

              <textarea
                className="broadcast-textarea"
                placeholder="Scrie mesajul notificării..."
                value={body}
                onChange={(e) =>
                  setBody(e.target.value)
                }
                required
              />
            </label>

            <button
              type="submit"
              className="broadcast-submit"
              disabled={loading}
            >
              <Send size={17} />

              {loading
                ? 'Se trimite...'
                : 'Trimite notificarea'}
            </button>
          </form>

          {status && (
            <div
              className={`broadcast-status ${status.type}`}
            >
              {status.message}
            </div>
          )}
        </div>

        <div className="broadcast-card">
          <div className="broadcast-card-title">
            <div className="broadcast-card-title-icon">
              <Bell size={19} />
            </div>

            Previzualizare
          </div>

          <div className="broadcast-preview">
            <div className="broadcast-preview-header">
              Notificare push
            </div>

            <div className="broadcast-notification">
              <div className="broadcast-notification-top">
                <div className="broadcast-notification-icon">
                  <Bell size={18} />
                </div>

                <span className="broadcast-notification-app">
                  Nexora Store
                </span>

                <span className="broadcast-notification-time">
                  acum
                </span>
              </div>

              <div className="broadcast-notification-title">
                {title || 'Titlul notificării'}
              </div>

              <div className="broadcast-notification-body">
                {body ||
                  'Mesajul notificării va apărea aici.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}