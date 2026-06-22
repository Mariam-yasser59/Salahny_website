import DataTable from '../../components/DataTable.jsx';
import SectionHeader from '../../components/SectionHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { post } from '../../services/api.js';
import { useState } from 'react';

export default function DriverHistory() {
  const { data } = useApi('/driver/bookings', []);
  const [ratingMessage, setRatingMessage] = useState('');

  const bookings = Array.isArray(data)
    ? data
    : data?.bookings || data?.data || [];

  return (
    <div className="dash-stack">
      <SectionHeader title="Booking History" />

      <DataTable
        rows={bookings}
        columns={[
          {
            key: 'service',
            label: 'Service',
            render: (row) =>
              typeof row.service === 'object'
                ? row.service?.name
                : row.service
          },
          {
            key: 'workshop',
            label: 'Workshop',
            render: (row) =>
              typeof row.workshop === 'object'
                ? row.workshop?.name
                : row.workshop
          },
          {
            key: 'date',
            label: 'Date',
            render: (row) =>
              row.date
                ? new Date(row.date).toLocaleString()
                : '-'
          },
          {
            key: 'price',
            label: 'Price',
            render: (row) =>
              `${row.price || row.total || 0} EGP`
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (
              <StatusBadge value={row.status || 'pending'} />
            )
          }
        ]}
      />

      <SectionHeader title="Rate Completed Services" />
      <div className="feature-grid two">
        {bookings.filter((booking) => booking.status === 'completed').map((booking) => (
          <RatingCard key={booking.id || booking._id} booking={booking} onRated={setRatingMessage} />
        ))}
      </div>
      {ratingMessage && <p className="success-card">{ratingMessage}</p>}
    </div>
  );
}

function RatingCard({ booking, onRated }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const bookingId = booking.id || booking._id;
  const serviceName = typeof booking.service === 'object' ? booking.service?.name : booking.service || booking.serviceName || 'Service';

  const rate = async (ratingType) => {
    try {
      await post('/ratings', { bookingId, ratingType, stars, comment });
      onRated('Thank you. Your rating was saved.');
    } catch (err) {
      onRated(err.message || 'Could not save this rating.');
    }
  };

  return (
    <article className="feature-card">
      <h3>{serviceName}</h3>
      <p>Booking {bookingId}</p>
      <div className="rating-stars" aria-label="Choose rating">
        {[1, 2, 3, 4, 5].map((value) => <button type="button" className={value <= stars ? 'active' : ''} key={value} onClick={() => setStars(value)}>★</button>)}
      </div>
      <textarea placeholder="Optional review" value={comment} onChange={(event) => setComment(event.target.value)} />
      <div className="actions">
        <button className="primary-btn" type="button" onClick={() => rate('workshop_by_customer')}>Rate workshop</button>
        <button className="ghost-btn" type="button" onClick={() => rate('platform_by_customer')}>Rate Salahny</button>
      </div>
    </article>
  );
}
