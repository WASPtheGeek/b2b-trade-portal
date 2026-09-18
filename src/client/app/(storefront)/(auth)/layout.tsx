import type { ReactNode } from "react";
import { dictionary } from "@/app/_i18n";
import { GuestBrowseCta } from "@/components/features/auth/GuestBrowseCta";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center bg-surface-warm px-2 py-[22px] md:py-[40px]">
      <div className="w-full max-w-[580px]">{ children }</div>

      <GuestBrowseCta labels={ dictionary.guestBrowseCta } />
    </div>
  );
}
