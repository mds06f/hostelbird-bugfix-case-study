import { ROOMS, canAddRoom } from '../hooks/useBookingValidation';

export default function RoomSelector({ guests, selectedRooms, onChange }) {
  const totalGuests = guests.adults + guests.children;
  const totalBeds = Object.values(selectedRooms).reduce((sum, qty) => sum + qty, 0);
  const unassignedGuests = Math.max(0, totalGuests - totalBeds);

  const handleAdd = (roomId) => {
    const { allowed } = canAddRoom(roomId, guests, selectedRooms);
    if (!allowed) return;
    onChange({ ...selectedRooms, [roomId]: (selectedRooms[roomId] || 0) + 1 });
  };

  const handleRemove = (roomId) => {
    const current = selectedRooms[roomId] || 0;
    if (current <= 0) return;
    const updated = { ...selectedRooms };
    if (current === 1) {
      delete updated[roomId];
    } else {
      updated[roomId] = current - 1;
    }
    onChange(updated);
  };

  return (
    <div>
      {unassignedGuests > 0 ? (
        <div className="status-message status-error" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          You need {unassignedGuests} more bed{unassignedGuests > 1 ? 's' : ''}
        </div>
      ) : (
        <div className="status-message status-success" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          All guests assigned
        </div>
      )}

      {ROOMS.map(room => {
        const qty = selectedRooms[room.id] || 0;
        const { allowed, reason } = canAddRoom(room.id, guests, selectedRooms);

        return (
          <div key={room.id} className={`room-card ${!allowed && qty === 0 ? 'disabled' : ''}`}>
            <div className="room-card-header">
              <div>
                <h4>{room.name}</h4>
                <div className="room-meta">
                  <span className="room-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Sleeps {room.capacity}
                  </span>
                  <span className="room-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    {room.available} beds left
                  </span>
                </div>
              </div>
              <div className="room-price">
                ₹{room.price}<span>per night</span>
              </div>
            </div>

            <div className="room-actions">
              <div>
                {!allowed && qty === 0 && (
                  <div className="inline-hint" style={{ color: 'var(--warning)' }}>
                    {reason}
                  </div>
                )}
              </div>
              <div className="counter-controls">
                <button
                  className="counter-btn"
                  onClick={() => handleRemove(room.id)}
                  disabled={qty <= 0}
                >−</button>
                <span className="counter-value">{qty}</span>
                <button
                  className="counter-btn"
                  onClick={() => handleAdd(room.id)}
                  disabled={!allowed}
                >+</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
