import { MAX_GUESTS, MIN_GUESTS } from '../hooks/useBookingValidation';

export default function GuestSelector({ guests, onChange }) {
  const handleIncrement = (type) => {
    const total = guests.adults + guests.children;
    if (total >= MAX_GUESTS) return;
    onChange({ ...guests, [type]: guests[type] + 1 });
  };

  const handleDecrement = (type) => {
    if (type === 'adults' && guests.adults <= MIN_GUESTS) return;
    if (type === 'children' && guests.children <= 0) return;
    onChange({ ...guests, [type]: guests[type] - 1 });
  };

  const total = guests.adults + guests.children;
  const isAtMax = total >= MAX_GUESTS;

  return (
    <div className="form-group">
      <div className="counter-group">
        <div className="counter-label-wrap">
          <div className="counter-label">Adults</div>
          <div className="counter-sublabel">Ages 13 or above</div>
        </div>
        <div className="counter-controls">
          <button
            className="counter-btn"
            onClick={() => handleDecrement('adults')}
            disabled={guests.adults <= MIN_GUESTS}
            aria-label="Decrease adults"
          >−</button>
          <span className="counter-value">{guests.adults}</span>
          <button
            className="counter-btn"
            onClick={() => handleIncrement('adults')}
            disabled={isAtMax}
            aria-label="Increase adults"
          >+</button>
        </div>
      </div>

      <div className="counter-group" style={{ borderBottom: 'none' }}>
        <div className="counter-label-wrap">
          <div className="counter-label">Children</div>
          <div className="counter-sublabel">Ages 0–12</div>
        </div>
        <div className="counter-controls">
          <button
            className="counter-btn"
            onClick={() => handleDecrement('children')}
            disabled={guests.children <= 0}
            aria-label="Decrease children"
          >−</button>
          <span className="counter-value">{guests.children}</span>
          <button
            className="counter-btn"
            onClick={() => handleIncrement('children')}
            disabled={isAtMax}
            aria-label="Increase children"
          >+</button>
        </div>
      </div>

      {isAtMax && (
        <div className="status-message status-warning" style={{ justifyContent: 'space-between' }}>
          <div>
            <strong>Maximum {MAX_GUESTS} guests</strong>
            <div className="inline-hint">For larger groups, use group booking.</div>
          </div>
          <button className="btn btn-outline btn-sm">Group Booking</button>
        </div>
      )}
    </div>
  );
}
