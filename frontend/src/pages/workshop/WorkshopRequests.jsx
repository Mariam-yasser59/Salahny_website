import { Link } from 'react-router-dom';
import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { api, patch, post } from '../../services/api.js';

const nextActions = {
  pending: ['accepted', 'Accept'],
  accepted: ['in_progress', 'Start service'],
  in_progress: ['diagnostics_ready', 'Mark diagnostics ready'],
  diagnostics_ready: ['repair_in_progress', 'Start repair'],
  repair_in_progress: ['completed', 'Complete job']
};

const getId = (item) => item?._id || item?.id;

const getServiceName = (booking) =>
  typeof booking.service === 'object'
    ? booking.service?.name
    : booking.service || booking.serviceName || 'Workshop service';

const getWorkshopName = (booking) =>
  typeof booking.workshop === 'object'
    ? booking.workshop?.name
    : booking.workshopName || booking.workshop || '';

const getDriverName = (booking) =>
  booking.driver?.name ||
  booking.customer?.name ||
  booking.user?.name ||
  booking.customerName ||
  'Customer';

const getDriverPhone = (booking) =>
  booking.driver?.phone ||
  booking.customer?.phone ||
  booking.user?.phone ||
  booking.customerPhone ||
  'No phone';

const getDriverImage = (booking) =>
  booking.driver?.profileImage ||
  booking.customer?.profileImage ||
  booking.user?.profileImage ||
  '';

const toList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.data?.bookings)) return data.data.bookings;
  return [];
};

const groupBookings = (items) => {
  const groups = { pending: [], current: [], completed: [], closed: [] };

  items.forEach((item) => {
    const status = item.status || 'pending';

    if (status === 'completed') groups.completed.push(item);
    else if (['cancelled', 'rejected'].includes(status)) groups.closed.push(item);
    else if (['accepted', 'in_progress', 'diagnostics_ready', 'repair_in_progress', 'confirmed'].includes(status)) groups.current.push(item);
    else groups.pending.push(item);
  });

  return groups;
};

export default function WorkshopRequests() {
  const { data, setData } = useApi('/bookings', []);
  const [selected, setSelected] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [customerRating, setCustomerRating] = useState({ stars: 5, comment: '' });

  const bookings = toList(data);
  const groups = groupBookings(bookings);

  const update = async (id, status) => {
    setDetailError('');

    try {
      const updated = await patch(`/workshop/bookings/${id}/status`, {
        status,
        label: status === 'accepted' ? 'Accepted by workshop' : status
      });

      const normalizedUpdated = {
        ...(updated?.data || updated),
        id: getId(updated?.data || updated)
      };

      const nextBookings = bookings.map((item) =>
        getId(item) === id ? normalizedUpdated : item
      );

      setData(nextBookings);
      setSelected(normalizedUpdated);
    } catch (err) {
      setDetailError(err.message);
    }
  };

  const openDetail = async (item) => {
    setDetailError('');
    setSelected(item);

    try {
      const id = getId(item);
      const details = await api(`/driver/bookings/${id}`);
      setSelected(details?.data || details);
    } catch (_err) {
      setSelected(item);
    }
  };

  const rateCustomer = async () => {
    try {
      await post('/ratings', { bookingId: getId(selected), ratingType: 'customer_by_workshop', stars: customerRating.stars, comment: customerRating.comment });
      setDetailError('Customer rating saved.');
    } catch (err) {
      setDetailError(err.message);
    }
  };

  return (
    <div className="dash-stack">
      <SectionHeader title="Incoming Requests" />

      <div className="tabs-row">
        {['pending', 'current', 'completed', 'closed'].map((group) => (
          <span key={group}>
            {group}: {groups[group]?.length || 0}
          </span>
        ))}
      </div>

      <div className="feature-grid two">
        {['pending', 'current', 'completed', 'closed'].flatMap((group) =>
          (groups[group] || []).map((item) => {
            const id = getId(item);

            return (
              <article className="feature-card booking-card" key={id}>
                <div className="profile-identity">
                  {getDriverImage(item) ? <img className="avatar image-avatar" src={getDriverImage(item)} alt={getDriverName(item)} /> : <div className="avatar">{getDriverName(item).slice(0, 2).toUpperCase()}</div>}
                  <h3>{getDriverName(item)}</h3>
                </div>

                <p>
                  {item.vehicle?.make} {item.vehicle?.model}{' '}
                  {item.vehicleLabel ? `- ${item.vehicleLabel}` : ''}
                </p>

                <p>
                  {getServiceName(item)} · {getWorkshopName(item)}
                </p>

                <p>
                  {item.date ? new Date(item.date).toLocaleString() : ''} -{' '}
                  {item.price || item.total || 0} EGP
                </p>

                <StatusBadge value={item.status || 'pending'} />

                <div className="actions">
                  <button className="ghost-btn" onClick={() => openDetail(item)}>
                    Details
                  </button>

                  {(item.status || 'pending') === 'pending' && (
                    <button className="primary-btn" onClick={() => update(id, 'accepted')}>
                      Accept
                    </button>
                  )}

                  {(item.status || 'pending') === 'pending' && (
                    <button className="ghost-btn" onClick={() => update(id, 'cancelled')}>
                      Decline
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {selected && (
        <section className="panel">
          <div className="profile-strip">
            <div className="profile-identity">
              {getDriverImage(selected) ? <img className="avatar image-avatar" src={getDriverImage(selected)} alt={getDriverName(selected)} /> : <div className="avatar">{getDriverName(selected).slice(0, 2).toUpperCase()}</div>}
              <div>
                <span className="eyebrow">Request detail</span>
                <h2>{getServiceName(selected)}</h2>
                <p>{getDriverName(selected)} - {getDriverPhone(selected)}</p>
              </div>
            </div>

            <StatusBadge value={selected.status || 'pending'} />
          </div>

          <div className="feature-grid three">
            <article className="compact-card">
              <h3>Vehicle</h3>
              <p>
                {selected.vehicle?.make} {selected.vehicle?.model}{' '}
                {selected.vehicle?.plate || selected.vehicleInfo || selected.vehicleLabel || ''}
              </p>
            </article>

            <article className="compact-card">
              <h3>Slot</h3>
              <p>{selected.date ? new Date(selected.date).toLocaleString() : ''}</p>
            </article>

            <article className="compact-card">
              <h3>Price</h3>
              <p>{selected.price || selected.total || 0} EGP</p>
            </article>
          </div>

          <p>{selected.notes || selected.issue || selected.locationNotes || 'No service notes provided.'}</p>

          <div className="timeline">
            {(selected.timeline || ['Requested', selected.status || 'pending']).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          {detailError && <p className="error">{detailError}</p>}

          <div className="actions">
            {nextActions[selected.status || 'pending'] && (
              <button
                className="primary-btn"
                onClick={() => update(getId(selected), nextActions[selected.status || 'pending'][0])}
              >
                {nextActions[selected.status || 'pending'][1]}
              </button>
            )}

            {(selected.status || 'pending') === 'pending' && (
              <button className="ghost-btn" onClick={() => update(getId(selected), 'cancelled')}>
                Decline
              </button>
            )}

            <Link className="ghost-btn" to="/workshop/chat" state={{ bookingId: getId(selected) }}>
              Open chat
            </Link>

            <Link className="ghost-btn" to="/workshop/diagnostics" state={{ bookingId: getId(selected) }}>
              Run diagnostics
            </Link>
          </div>

          {(selected.status || 'pending') === 'completed' && (
            <div className="rating-panel">
              <h3>Rate Customer</h3>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((value) => <button type="button" className={value <= customerRating.stars ? 'active' : ''} key={value} onClick={() => setCustomerRating({ ...customerRating, stars: value })}>★</button>)}
              </div>
              <textarea placeholder="Optional customer note" value={customerRating.comment} onChange={(event) => setCustomerRating({ ...customerRating, comment: event.target.value })} />
              <button className="primary-btn" type="button" onClick={rateCustomer}>Save customer rating</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
