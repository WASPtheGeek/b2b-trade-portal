"use client";

import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { dictionary } from "@/app/_i18n";
import { AuthCard, type AuthTab } from "@/components/features/auth/AuthCard";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { RegisterConfirmation } from "@/components/features/auth/RegisterConfirmation";
import { RegisterForm } from "@/components/features/auth/RegisterForm";
import { useRedirectAuthenticatedAway } from "@/hooks/useRedirectAuthenticatedAway";
import type { RegisterResult } from "@/types/auth";

const AUTH_TABS: AuthTab[] = ["login", "register"];

function isAuthTab(value: string): value is AuthTab {
  return (AUTH_TABS as string[]).includes(value);
}

/**
 * Shared login/register page.
 *
 * `/login` and `/register` both resolve here (as the `tab` param), which only
 * seeds the *initial* tab. Switching tabs afterwards is handled as local
 * state rather than a router navigation - a navigation to a different path
 * remounts the page, which would undo `AuthCard`'s smooth height transition.
 * The address bar is still kept in sync (via `history.replaceState`, not
 * Next's router) so the URL stays accurate and shareable.
 */
export default function AuthPage() {
  useRedirectAuthenticatedAway();

  const { tab: initialTab } = useParams<{ tab: string }>();

  if (!isAuthTab(initialTab)) {
    notFound();
  }

  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [registerResult, setRegisterResult] = useState<RegisterResult | null>(null);

  const handleTabChange = (nextTab: AuthTab): void => {
    setTab(nextTab);
    window.history.replaceState(null, "", `/${nextTab}`);

    if (nextTab !== "register") {
      setRegisterResult(null);
    }
  };

  return (
    <AuthCard activeTab={ tab } onTabChange={ handleTabChange } hideTabs={ registerResult !== null } labels={ dictionary.authCard }>
      { tab === "login" ? (
        <LoginForm labels={ dictionary.loginForm } />
      ) : registerResult ? (
        <RegisterConfirmation result={ registerResult } labels={ dictionary.registerConfirmation } />
      ) : (
        <RegisterForm onSuccess={ setRegisterResult } labels={ dictionary.registerForm } />
      ) }
    </AuthCard>
  );
}
