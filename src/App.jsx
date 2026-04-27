import { useState, useEffect } from 'react'
import GuestSelector from './components/GuestSelector'
import RoomSelector from './components/RoomSelector'
import BookingSummary from './components/BookingSummary'
import { validateBooking, getToday, formatDateForInput, validateCheckInDate, validateCheckOutDate } from './hooks/useBookingValidation'
import './index.css'

function App() {
  const getDefaultDates = () => {
    const today = getToday();
    const checkInDate = new Date(today);
    checkInDate.setDate(checkInDate.getDate() + 1);
    
    const checkOutDate = new Date(today);
    checkOutDate.setDate(checkOutDate.getDate() + 2);
    
    return {
      checkIn: formatDateForInput(checkInDate),
      checkOut: formatDateForInput(checkOutDate)
    };
  };

  const defaultDates = getDefaultDates();
  const [checkIn, setCheckIn] = useState(defaultDates.checkIn);
  const [checkOut, setCheckOut] = useState(defaultDates.checkOut);
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [selectedRooms, setSelectedRooms] = useState({});

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [booked, setBooked] = useState(false);

  const validation = validateBooking(guests, selectedRooms, checkIn, checkOut);

  const createOrder = async () => {
    try {
      return { success: true };
    }
    catch (error) {
      return { success: false, message: "Order creation failed" };
    }
  };

  const handleBooking = async () => {
    if (loading) return;

    setApiError('');

    if (!validation.isValid) {
      setApiError("Please fix booking errors before proceeding.");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setApiError("Check-out must be after check-in.");
      return;
    }

    setLoading(true);

    await createOrder();

    setBooked(true);
    setTimeout(() => setBooked(false), 4000);

    setLoading(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          HostelBird
        </div>
      </nav>

      <div className="container">
        <div className="booking-widget">

          <div className="booking-section">
            <h2 className="section-title">Dates</h2>
            <div className="form-row">
              <div>
                <label className="form-label">Check-in</label>
                <input 
                  type="date"
                  className="date-input"
                  value={checkIn}
                  onChange={(e) => {
                    const validation = validateCheckInDate(e.target.value);
                    if (!validation.isValid) {
                      setApiError(validation.message);
                      return;
                    }
                    setCheckIn(e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>

              <div>
                <label className="form-label">Check-out</label>
                <input 
                  type="date" 
                  className="date-input"
                  value={checkOut}
                  onChange={(e) => {
                    const validation = validateCheckOutDate(e.target.value, checkIn);
                    if (!validation.isValid) {
                      setApiError(validation.message);
                      return;
                    }
                    setCheckOut(e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>

          <div className="booking-section">
            <h2 className="section-title">Guests</h2>
            <GuestSelector guests={guests} onChange={setGuests} />
          </div>

          <div className="booking-section">
            <h2 className="section-title">Rooms</h2>
            <RoomSelector
              guests={guests}
              selectedRooms={selectedRooms}
              onChange={setSelectedRooms}
            />
          </div>
        </div>
      </div>

      <BookingSummary 
        validation={validation}
        onProceed={handleBooking}
        loading={loading}
        apiError={apiError}
      />

      {booked && (
        <div className="toast">
          Booking successful! Thank you for choosing HostelBird.
        </div>
      )}
    </>
  );
}

export default App;
