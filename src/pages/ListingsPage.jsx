import { useEffect, useState } from 'react';
import {
  Trash2,
  Package,
} from 'lucide-react';

import { adminApi } from '../api/client';
import './css/ListingsPage.css';

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = () => {
    adminApi.getListings(page).then((res) => {
      setListings(res.data.data || []);
      setPages(res.data.pages || 1);
    });
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Sigur ștergi acest anunț?')) {
      return;
    }

    await adminApi.deleteListing(id);
    load();
  };

  return (
    <div className="listings-page">
      <div className="listings-header">
        <div>
          <h1>Anunțuri</h1>
          <p>
            Gestionează anunțurile publicate pe Nexora.
          </p>
        </div>
      </div>

      <div className="listings-card">
        {listings.length === 0 ? (
          <div className="listings-empty">
            <Package size={38} />
            Nu există anunțuri.
          </div>
        ) : (
          <table className="listings-table">
            <thead>
              <tr>
                <th>Anunț</th>
                <th>Preț</th>
                <th>Vânzător</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {listings.map((l) => {
                const initial = (
                  l.seller?.username ||
                  'N'
                )[0].toUpperCase();

                return (
                  <tr key={l._id}>
                    <td>
                      <div className="listing-title">
                        <strong>
                          {l.title}
                        </strong>

                        <span className="listing-id">
                          #{l._id}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="listing-price">
                        {l.price}{' '}
                        {l.currency || 'RON'}
                      </span>
                    </td>

                    <td>
                      <div className="listing-seller">
                        <div className="listing-avatar">
                          {initial}
                        </div>

                        <span>
                          {l.seller?.username ||
                            'N/A'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`listing-status ${
                          l.status
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="listing-action-delete"
                        onClick={() =>
                          handleDelete(l._id)
                        }
                      >
                        <Trash2 size={15} />
                        Șterge
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="listings-pagination">
          {Array.from(
            { length: pages },
            (_, i) => (
              <button
                key={i}
                className={`listings-page-button ${
                  page === i + 1
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setPage(i + 1)
                }
              >
                {i + 1}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}