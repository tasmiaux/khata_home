import {
  ShoppingBasket,
  Pill,
  Coffee,
  Broom,
  Milk,
  Zap,
  Wrench,
  Bike,
  Car,
  ShoppingBag,
  Home,
  MoreHorizontal,
  Banknote,
  Smartphone,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import type { Category, PaymentMode } from "./constants";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  "Groceries & Meat": ShoppingBasket,
  Medicines: Pill,
  Hangout: Coffee,
  Househelp: Broom,
  Milk: Milk,
  "Electricity Bill": Zap,
  Repairs: Wrench,
  "Food Delivery": Bike,
  Rides: Car,
  Shopping: ShoppingBag,
  "Home Essentials": Home,
  Miscellaneous: MoreHorizontal,
};

// Shades of the Khata accent (forest green), darkest to lightest — used for
// chart segments / swatches where categories need to be told apart visually.
export const CATEGORY_CHART_COLOR: Record<Category, string> = {
  "Groceries & Meat": "#1f3327",
  Medicines: "#2f4a3a",
  Hangout: "#3c5c48",
  Househelp: "#4a6f56",
  Milk: "#588264",
  "Electricity Bill": "#669573",
  Repairs: "#7aa583",
  "Food Delivery": "#8fb595",
  Rides: "#93a67d",
  Shopping: "#a5c5a8",
  "Home Essentials": "#bcd5bc",
  Miscellaneous: "#d3e5d1",
};

export const PAYMENT_ICON: Record<PaymentMode, LucideIcon> = {
  Cash: Banknote,
  UPI: Smartphone,
  Card: CreditCard,
};
