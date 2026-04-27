import { useState, useEffect, useRef } from 'react'
import GuestSelector from './components/GuestSelector'
import RoomSelector from './components/RoomSelector'
import BookingSummary from './components/BookingSummary'
import { validateBooking, getToday, formatDateForInput, validateCheckInDate, validateCheckOutDate, parseLocalDate } from './hooks/useBookingValidation'
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

  useEffect(() => {
    const totalGuests = guests.adults + guests.children;
    setSelectedRooms(prevRooms => {
      let totalBeds = Object.values(prevRooms).reduce((sum, qty) => sum + qty, 0);
      if (totalBeds <= totalGuests) return prevRooms;

      let updatedRooms = { ...prevRooms };
      for (let roomId of Object.keys(updatedRooms)) {
        while (updatedRooms[roomId] > 0 && totalBeds > totalGuests) {
          updatedRooms[roomId] -= 1;
          totalBeds -= 1;
          if (updatedRooms[roomId] === 0) {
            delete updatedRooms[roomId];
          }
        }
        if (totalBeds <= totalGuests) break;
      }
      return updatedRooms;
    });
  }, [guests]);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [dateError, setDateError] = useState('');
  const [booked, setBooked] = useState(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  // Clear stale errors whenever inputs change
  useEffect(() => {
    setApiError('');
    setDateError('');
  }, [checkIn, checkOut, guests, selectedRooms]);

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
    setDateError('');

    if (!validation.isValid) {
      return;
    }

    const checkOutDate = parseLocalDate(checkOut);
    const checkInDate = parseLocalDate(checkIn);
    if (checkOutDate <= checkInDate) {
      setDateError("Check-out must be after check-in.");
      return;
    }

    setLoading(true);

    try {
      const result = await createOrder();

      if (!result.success) {
        setApiError(result.message || "Something went wrong. Please try again.");
        return;
      }

      setBooked(true);
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setBooked(false), 4000);
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
                  min={formatDateForInput(getToday())}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const dateValidation = validateCheckInDate(val);
                    if (!dateValidation.isValid) {
                      setDateError(dateValidation.error);
                      return;
                    }
                    setDateError('');
                    setCheckIn(val);
                    // Auto-adjust checkout if check-in >= checkout
                    if (val >= checkOut) {
                      const nextDay = new Date(parseLocalDate(val));
                      nextDay.setDate(nextDay.getDate() + 1);
                      setCheckOut(formatDateForInput(nextDay));
                    }
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
                  min={checkIn}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const dateValidation = validateCheckOutDate(val, checkIn);
                    if (!dateValidation.isValid) {
                      setDateError(dateValidation.error);
                      return;
                    }
                    setDateError('');
                    setCheckOut(val);
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
        dateError={dateError}
        onRetry={handleBooking}
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
