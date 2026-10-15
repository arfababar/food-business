// Centralized business configuration for Baba Hafeez
// All phone numbers, addresses, delivery areas, hours, and operational constants live here.

export const BUSINESS_CONFIG = {
  name: "Baba Hafeez",
  tagline: "Fast Food & Grill",
  description:
    "Handcrafted crispy zingers, gourmet smashed beef patties, and loaded cheesy fries in Gujranwala.",
  
  // Contacts
  // Note: Replace dummy phone when real SIM/WhatsApp is provisioned
  whatsappNumber: "923000000000",
  hotlineDisplay: "0300-0000000",
  hotlineTel: "+923000000000",
  email: "orders@babahafeez.com",

  // Location (Gujranwala)
  city: "Gujranwala",
  address: "Main Commercial Market, Model Town, Gujranwala, Punjab, Pakistan",
  googleMapsUrl: "https://maps.google.com/?q=Model+Town+Gujranwala",

  // Operating Hours (24h format for opening check)
  hoursDisplay: {
    weekdays: "Mon - Thu: 12:00 PM - 1:00 AM",
    friday: "Fri: 2:00 PM - 2:00 AM",
    weekend: "Sat - Sun: 12:00 PM - 2:00 AM",
  },
  // Schedule in local Pakistan Time (UTC+5)
  // [openHour, openMinute, closeHour (may be past midnight, e.g. 25 = 1 AM next day), closeMinute]
  schedule: {
    // 0: Sunday, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    0: { open: 12.0, close: 26.0 }, // 12 PM - 2 AM
    1: { open: 12.0, close: 25.0 }, // 12 PM - 1 AM
    2: { open: 12.0, close: 25.0 },
    3: { open: 12.0, close: 25.0 },
    4: { open: 12.0, close: 25.0 },
    5: { open: 14.0, close: 26.0 }, // 2 PM - 2 AM
    6: { open: 12.0, close: 26.0 }, // 12 PM - 2 AM
  },

  // Delivery Areas & Fees in Gujranwala (in PKR)
  deliveryAreas: [
    { name: "Model Town", fee: 100 },
    { name: "Peoples Colony", fee: 120 },
    { name: "Satellite Town", fee: 130 },
    { name: "DC Colony", fee: 180 },
    { name: "Wapda Town", fee: 180 },
    { name: "Gujranwala Cantt", fee: 200 },
    { name: "Rahwali", fee: 220 },
    { name: "Master City", fee: 220 },
    { name: "Citi Housing", fee: 250 },
    { name: "Other / Outside City Center", fee: 250 },
  ],

  // Defaults
  standardDeliveryFee: 150,
  freeDeliveryThreshold: 1500, // PKR
  estimatedDeliveryTime: "30-45 mins",

  // Supported Payment Methods
  // As requested: Cash on Delivery only
  paymentMethods: [
    {
      id: "cod",
      label: "Cash on Delivery (COD)",
      description: "Pay with cash to the rider upon receiving your hot meal",
    },
  ],
};

// Helper: check if restaurant is open right now
export function isRestaurantOpen(date = new Date()) {
  const day = date.getDay();
  const hours = date.getHours() + date.getMinutes() / 60;
  const config = BUSINESS_CONFIG.schedule[day];
  if (!config) return true;

  // If current time is early morning (e.g. 0:30 AM), check previous day's extended hours
  if (hours < 6) {
    const prevDay = (day + 6) % 7;
    const prevConfig = BUSINESS_CONFIG.schedule[prevDay];
    if (prevConfig && hours + 24 < prevConfig.close) {
      return true;
    }
  }

  return hours >= config.open && hours < config.close;
}
