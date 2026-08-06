export type DemoSlotStatus = 'available' | 'booked';

export type DemoSlot = {
  id: string;
  label: string;
  start: string;
  end: string;
  status: DemoSlotStatus;
};

export type DemoAvailability = {
  date: string;
  slots: DemoSlot[];
  isLive: boolean;
};

export type DemoBookingRequest = {
  name: string;
  email: string;
  phone: string;
  title: string;
  companyName: string;
  date: string;
  slotId: string;
};

export type ContactInquiry = {
  name: string;
  email: string;
  companyName?: string;
  message: string;
};

export type DemoBookingAdapter = {
  getAvailability: (date: string) => Promise<DemoAvailability>;
  submitBooking: (request: DemoBookingRequest) => Promise<{ eventId: string }>;
};
