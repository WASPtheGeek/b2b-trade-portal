import {
  ArrowRight,
  Box,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleHelp,
  CirclePause,
  CircleSlash,
  Clock,
  Coffee,
  Construction,
  Download,
  Ellipsis,
  FileDown,
  FileSpreadsheet,
  GripVertical,
  HardHat,
  Heart,
  History,
  Inbox,
  Info,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  Menu,
  Minus,
  Package,
  PackageCheck,
  Paperclip,
  Phone,
  Plus,
  Receipt,
  RotateCcw,
  Save,
  Search,
  SearchX,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SprayCan,
  Square,
  Tag,
  TriangleAlert,
  Truck,
  Undo2,
  Upload,
  User,
  Users,
  X,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/cn";

// Statically imported (not lucide-react's dynamicIconImports/next-dynamic) so every icon is
// part of the regular JS bundle and renders synchronously - no per-glyph chunk fetch, no
// Suspense fallback frame, no click-to-icon-paint lag. The set is curated (only the glyphs
// this app actually uses) specifically so this stays cheap; add a new icon by importing it
// above and adding it to this map, using the same kebab-case key lucide-static/lucide-react
// use for the glyph.
const ICONS = {
  "arrow-right": ArrowRight,
  box: Box,
  "building-2": Building2,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevrons-up-down": ChevronsUpDown,
  "chevron-up": ChevronUp,
  "circle-alert": CircleAlert,
  "circle-check": CircleCheck,
  "circle-dot": CircleDot,
  "circle-help": CircleHelp,
  "circle-pause": CirclePause,
  "circle-slash": CircleSlash,
  clock: Clock,
  coffee: Coffee,
  construction: Construction,
  download: Download,
  ellipsis: Ellipsis,
  "file-down": FileDown,
  "file-spreadsheet": FileSpreadsheet,
  "grip-vertical": GripVertical,
  "hard-hat": HardHat,
  heart: Heart,
  history: History,
  inbox: Inbox,
  info: Info,
  "layout-dashboard": LayoutDashboard,
  "loader-circle": LoaderCircle,
  lock: Lock,
  "log-out": LogOut,
  menu: Menu,
  minus: Minus,
  package: Package,
  "package-check": PackageCheck,
  paperclip: Paperclip,
  phone: Phone,
  plus: Plus,
  receipt: Receipt,
  "rotate-ccw": RotateCcw,
  save: Save,
  search: Search,
  "search-x": SearchX,
  settings: Settings,
  "shield-check": ShieldCheck,
  "shopping-cart": ShoppingCart,
  "spray-can": SprayCan,
  square: Square,
  tag: Tag,
  "triangle-alert": TriangleAlert,
  truck: Truck,
  "undo-2": Undo2,
  upload: Upload,
  user: User,
  users: Users,
  x: X,
} as const satisfies Record<string, ComponentType<LucideProps>>;

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  size?: number;
  title?: string;
}

export function Icon({ name, size = 16, title, className, ...rest }: IconProps) {
  const LucideIcon = ICONS[name];

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      size={ size }
      className={ cn("shrink-0", className) }
      aria-hidden={ title ? undefined : true }
      role={ title ? "img" : undefined }
      aria-label={ title }
      { ...rest }
    />
  );
}
