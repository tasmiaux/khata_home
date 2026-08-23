export const CATEGORIES = [
  // Home / housing
  "Rent",
  "Home Essentials",
  "Electricity Bill",
  "Gas",
  "Repairs",
  "Househelp",
  // Food / groceries
  "Groceries",
  "Veggies & Fruits",
  "Snacks",
  "Milk",
  "Food Delivery",
  "Blinkit, Zepto",
  // Lifestyle
  "Hangout",
  "Online Shopping",
  "Rides",
  // Health / education
  "Medicines",
  "College Fee",
  // Catch-all
  "Miscellaneous",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_MODES = ["Cash", "UPI", "Card"] as const;

export type PaymentMode = (typeof PAYMENT_MODES)[number];
