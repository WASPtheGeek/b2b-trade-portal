import type { ReactNode } from "react";
import { dictionary } from "@/app/_i18n";
import { GuestBrowseCta } from "@/components/features/auth/GuestBrowseCta";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-surface-warm px-5 py-[42px] md:py-[60px]">
      <div className="w-full max-w-[580px]">{ children }</div>

      <GuestBrowseCta labels={ dictionary.guestBrowseCta } />
    </div>
  );
}
