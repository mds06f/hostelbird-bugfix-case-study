export const MAX_GUESTS = 15;
export const MIN_GUESTS = 1;

export const CURRENT_YEAR = new Date().getFullYear();

export const validateYearFormat = (dateString) => {
  if (!dateString) return true;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const year = parseInt(dateString.substring(0, 4));
  return year >= CURRENT_YEAR && year <= 2999;
};

export const parseLocalDate = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const validateCheckInDate = (checkInString) => {
  if (!checkInString) return { isValid: false, error: 'Check-in date is required' };

  if (!validateYearFormat(checkInString)) {
    return { isValid: false, error: `Year must be between ${CURRENT_YEAR} and 2999` };
  }

  const checkInDate = parseLocalDate(checkInString);
  const today = getToday();

  if (checkInDate < today) {
    return { isValid: false, error: 'Check-in date must be today or later' };
  }

  return { isValid: true };
};

export const validateCheckOutDate = (checkOutString, checkInString) => {
  if (!checkOutString) return { isValid: false, error: 'Check-out date is required' };

  if (!validateYearFormat(checkOutString)) {
    return { isValid: false, error: `Year must be between ${CURRENT_YEAR} and 2999` };
  }

  const checkOutDate = parseLocalDate(checkOutString);
  const checkInDate = parseLocalDate(checkInString);
  const tomorrow = new Date(getToday());
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (checkOutDate < tomorrow) {
    return { isValid: false, error: 'Check-out date must be at least 1 day after today' };
  }

  if (checkOutDate <= checkInDate) {
    return { isValid: false, error: 'Check-out date must be after check-in date' };
  }

  return { isValid: true };
};

export const ROOMS = [
  { id: 'dorm-4', name: '4-Bed Mixed Dorm', capacity: 4, price: 449, available: 6, type: 'dorm' },
  { id: 'dorm-6', name: '6-Bed Mixed Dorm', capacity: 6, price: 399, available: 4, type: 'dorm' },
  { id: 'private-2', name: 'Private Room', capacity: 2, price: 1299, available: 2, type: 'private' },
  { id: 'female-4', name: '4-Bed Female Dorm', capacity: 4, price: 499, available: 3, type: 'dorm' },
];

export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const inDate = parseLocalDate(checkIn);
  const outDate = parseLocalDate(checkOut);
  const diff = outDate - inDate;
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return isNaN(nights) || nights < 0 ? 0 : nights;
};

export function validateBooking(guests, selectedRooms, checkIn, checkOut) {
  const errors = [];
  const warnings = [];

  const checkInValidation = validateCheckInDate(checkIn);
  if (!checkInValidation.isValid) {
    errors.push(checkInValidation.error);
  }

  const checkOutValidation = validateCheckOutDate(checkOut, checkIn);
  if (!checkOutValidation.isValid) {
    errors.push(checkOutValidation.error);
  }

  const nights = calculateNights(checkIn, checkOut);

  if (nights <= 0 && checkInValidation.isValid && checkOutValidation.isValid) {
    errors.push("Please select valid check-in and check-out dates.");
  }

  const totalGuests = guests.adults + guests.children;
  const totalBeds = Object.values(selectedRooms).reduce((sum, qty) => sum + qty, 0);
  const totalCapacity = Object.entries(selectedRooms).reduce((sum, [roomId, qty]) => {
    const room = ROOMS.find(r => r.id === roomId);
    return sum + (room ? room.capacity * qty : 0);
  }, 0);

  if (totalGuests > MAX_GUESTS) {
    errors.push(`Maximum ${MAX_GUESTS} guests allowed per booking. For groups, contact us.`);
  }

  if (totalGuests < MIN_GUESTS) {
    errors.push('At least 1 guest is required.');
  }

  if (totalBeds === 0) {
    errors.push("Please select at least one room or bed.");
  } else {
    if (totalBeds < totalGuests) {
      errors.push(`You have ${totalGuests} guests but only ${totalBeds} bed(s) selected. Please add ${totalGuests - totalBeds} more.`);
    }

    if (totalGuests > totalCapacity) {
      errors.push(`Selected rooms can only accommodate ${totalCapacity} guests, but you have ${totalGuests}.`);
    }

    if (totalBeds > totalGuests) {
      warnings.push(`You have more beds (${totalBeds}) than guests (${totalGuests}). You'll be charged for all beds.`);
    }
  }

  const canProceed = errors.length === 0;

  const totalPrice = canProceed
    ? Object.entries(selectedRooms).reduce((sum, [roomId, qty]) => {
      const room = ROOMS.find(r => r.id === roomId);
      return sum + (room ? room.price * qty * nights : 0);
    }, 0)
    : 0;

  return { isValid: canProceed, errors, warnings, totalBeds, totalGuests, totalPrice, nights };
}

export function canAddRoom(roomId, guests, selectedRooms) {
  const room = ROOMS.find(r => r.id === roomId);
  if (!room) return { allowed: false, reason: 'Room not found' };

  const currentQty = selectedRooms[roomId] || 0;
  if (currentQty >= room.available) {
    return { allowed: false, reason: 'No more beds available' };
  }

  const totalGuests = guests.adults + guests.children;
  const totalBeds = Object.values(selectedRooms).reduce((sum, qty) => sum + qty, 0);
  if (totalBeds >= totalGuests) {
    return { allowed: false, reason: 'You already have enough beds for all guests' };
  }

  return { allowed: true, reason: '' };
}
