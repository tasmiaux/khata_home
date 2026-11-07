import {
  Key,
  Home,
  Zap,
  Flame,
  Wrench,
  Broom,
  ShoppingBasket,
  Carrot,
  Cookie,
  Milk,
  Bike,
  Rocket,
  Coffee,
  ShoppingBag,
  Car,
  Pill,
  GraduationCap,
  MoreHorizontal,
  Banknote,
  Smartphone,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import type { Category, PaymentMode } from "./constants";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Rent: Key,
  "Home Essentials": Home,
  "Electricity Bill": Zap,
  Gas: Flame,
  Repairs: Wrench,
  Househelp: Broom,
  Groceries: ShoppingBasket,
  "Veggies & Fruits": Carrot,
  Snacks: Cookie,
  Milk: Milk,
  "Food Delivery": Bike,
  "Blinkit, Zepto": Rocket,
  Hangout: Coffee,
  "Online Shopping": ShoppingBag,
  Rides: Car,
  Medicines: Pill,
  "College Fee": GraduationCap,
  Miscellaneous: MoreHorizontal,
};

// Categories are grouped into colour families the same way the category list is
// (home / food / lifestyle / health & education / misc), so rows and the donut
// chart read as organised instead of 18 near-identical greys. The hues are muted
// and earthy so they sit with the cream / tan / near-black palette.
//   dusty blue = home & housing         sage     = food & groceries
//   mauve      = lifestyle & transport  terracotta = health & education
//   taupe      = miscellaneous
const BLUE = { bg: "#e6ecf2", fg: "#4a6a8a" };
const GREEN = { bg: "#e4ede0", fg: "#5e7f52" };
const PURPLE = { bg: "#ede3ea", fg: "#8a5a7b" };
const CORAL = { bg: "#f6e1d6", fg: "#bf6b45" };
const GREY = { bg: "#ece6dc", fg: "#6b6459" };

// Tinted background + icon colour for a category's icon chip.
export const CATEGORY_TONE: Record<Category, { bg: string; fg: string }> = {
  Rent: BLUE,
  "Home Essentials": BLUE,
  "Electricity Bill": BLUE,
  Gas: BLUE,
  Repairs: BLUE,
  Househelp: BLUE,
  Groceries: GREEN,
  "Veggies & Fruits": GREEN,
  Snacks: GREEN,
  Milk: GREEN,
  "Food Delivery": GREEN,
  "Blinkit, Zepto": GREEN,
  Hangout: PURPLE,
  "Online Shopping": PURPLE,
  Rides: PURPLE,
  Medicines: CORAL,
  "College Fee": CORAL,
  Miscellaneous: GREY,
};

// Solid colours for chart segments: each family fans out into shades so
// neighbouring categories in the donut can still be told apart.
export const CATEGORY_CHART_COLOR: Record<Category, string> = {
  Rent: "#34506b",
  "Home Essentials": "#46698c",
  "Electricity Bill": "#5d82a6",
  Gas: "#7c9bbb",
  Repairs: "#9fb5cd",
  Househelp: "#c0cfdf",
  Groceries: "#3f6035",
  "Veggies & Fruits": "#54774a",
  Snacks: "#6b9060",
  Milk: "#8aab7f",
  "Food Delivery": "#aac69f",
  "Blinkit, Zepto": "#c6dbbe",
  Hangout: "#6b3f5e",
  "Online Shopping": "#8f6282",
  Rides: "#b58aa8",
  Medicines: "#a8532f",
  "College Fee": "#d98a66",
  Miscellaneous: "#8a8070",
};

export const PAYMENT_ICON: Record<PaymentMode, LucideIcon> = {
  Cash: Banknote,
  UPI: Smartphone,
  Card: CreditCard,
};
