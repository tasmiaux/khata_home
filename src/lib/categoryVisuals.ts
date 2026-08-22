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

// Shades of the Khata accent (navy), darkest to lightest — used for
// chart segments / swatches where categories need to be told apart visually.
export const CATEGORY_CHART_COLOR: Record<Category, string> = {
  "Groceries & Meat": "#16222c",
  Medicines: "#283339",
  Hangout: "#39444e",
  Househelp: "#4a555e",
  Milk: "#5c666f",
  "Electricity Bill": "#6d7880",
  Repairs: "#7f8990",
  "Food Delivery": "#909aa1",
  Rides: "#a2abb2",
  Shopping: "#b3bcc3",
  "Home Essentials": "#c5cdd3",
  Miscellaneous: "#d6dee4",
};

export const PAYMENT_ICON: Record<PaymentMode, LucideIcon> = {
  Cash: Banknote,
  UPI: Smartphone,
  Card: CreditCard,
};
