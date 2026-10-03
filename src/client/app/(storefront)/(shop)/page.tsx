"use client";

import { dictionary } from "@/app/_i18n";
import { HomePage } from "@/components/features/shop/HomePage";

// Main home page.
export default function HomeRoutePage() {
  return <HomePage labels={ dictionary.homePage } />;
}
