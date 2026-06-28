import { useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';

const toList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.data?.bookings)) return data.data.bookings;
  return [];
};

const getId = (item) => item?._id || item?.id;

const getServiceName = (booking) =>
  typeof booking.service === 'object'
    ? booking.service?.name
    : booking.service || booking.serviceName || 'Service';

const getWorkshopName = (booking) =>
  typeof booking.workshop === 'object'
    ? booking.workshop?.name
    : booking.workshop || booking.workshopName || 'Workshop';

export default function DriverHistory() {
  const { data } = useApi('/driver/bookings', []);
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratedBookings, setRatedBookings] = useState({});
  const bookings = toList(data);
  const completedBookings = bookings.filter((booking) => String(booking.status).toLowerCase() === 'completed');

  return (
    <div className="dash-stack">
      <SectionHeader title="Booking History" />

      <DataTable
        rows={bookings}
        columns={[
          { key: 'service', label: 'Service', render: getServiceName },
          { key: 'workshop', label: 'Workshop', render: getWorkshopName },
          {
            key: 'date',
            label: 'Date',
            render: (row) => row.date ? new Date(row.date).toLocaleString() : '-',
          },
          {
            key: 'price',
            label: 'Price',
            render: (row) => `${row.price || row.total || 0} EGP`,
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge value={row.status || 'pending'} />,
          },
        ]}
      />

      <SectionHeader title="Rate Completed Services">
        Ratings become available after a service is completed.
      </SectionHeader>

      {completedBookings.length ? (
        <div className="feature-grid two">
          {completedBookings.map((booking) => {
            const id = getId(booking);
            return (
              <RatingCard
                key={id}
                booking={booking}
                rated={ratedBookings[id] || booking.driverReviewed}
                onRated={(message) => {
                  setRatedBookings((old) => ({ ...old, [id]: true }));
                  setRatingMessage(message);
                }}
                onError={setRatingMessage}
              />
            );
          })}
        </div>
      ) : (
        <article className="state-card">
          <strong>No completed services yet</strong>
          <span>Completed bookings will appear here for rating.</span>
        </article>
      )}

      {ratingMessage && <p className="success-card">{ratingMessage}</p>}
    </div>
  );
}

function RatingCard({ booking, rated, onRated, onError }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const bookingId = getId(booking);

  const rate = async (ratingType) => {
    if (rated || saving) return;
    setSaving(true);
    try {
      await post('/ratings', { bookingId, ratingType, stars, comment });
      onRated('Thank you. Your rating was saved.');
    } catch (err) {
      onError(err.message || 'Could not save this rating.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="feature-card">
      <h3>{getServiceName(booking)}</h3>
      <p>{getWorkshopName(booking)}</p>
      <p>Booking {bookingId}</p>
      <div className="rating-stars" aria-label="Choose rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            className={value <= stars ? 'active' : ''}
            key={value}
            disabled={rated || saving}
            onClick={() => setStars(value)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Optional review"
        value={comment}
        disabled={rated || saving}
        onChange={(event) => setComment(event.target.value)}
      />
      <div className="actions">
        <button className="primary-btn" type="button" disabled={rated || saving} onClick={() => rate('workshop_by_customer')}>
          {rated ? 'Rating saved' : saving ? 'Saving...' : 'Rate workshop service'}
        </button>
      </div>
    </article>
  );
}
