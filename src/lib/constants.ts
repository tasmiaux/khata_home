export const CATEGORIES = [
  "Groceries & Meat",
  "Medicines",
  "Hangout",
  "Househelp",
  "Milk",
  "Electricity Bill",
  "Repairs",
  "Food Delivery",
  "Rides",
  "Shopping",
  "Home Essentials",
  "Miscellaneous",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_MODES = ["Cash", "UPI", "Card"] as const;

export type PaymentMode = (typeof PAYMENT_MODES)[number];
