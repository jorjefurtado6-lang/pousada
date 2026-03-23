export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive';
}

export interface Reservation {
  id: string;
  roomId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'finished';
  paymentStatus: 'unpaid' | 'paid' | 'partially_paid';
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'guest';
}

export interface Settings {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  policies: string;
}
