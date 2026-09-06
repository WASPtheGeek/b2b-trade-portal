"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { useLoginForm } from "@/hooks/useLoginForm";

export interface LoginFormLabels {
  heading: string;
  subheading: string;
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  submittingLabel: string;
  noAccountText: string;
  registerLinkLabel: string;
  genericErrorMessage: string;
}

const DEFAULT_LABELS: LoginFormLabels = {
  heading: "Sign in to your business account",
  subheading: "Use the email you registered your business with.",
  emailLabel: "Email",
  passwordLabel: "Password",
  submitLabel: "Sign in",
  submittingLabel: "Signing in…",
  noAccountText: "Don't have an account yet?",
  registerLinkLabel: "Register your business",
  genericErrorMessage: "Failed to sign in. Please try again.",
};

export interface LoginFormProps {
  labels?: Partial<LoginFormLabels>;
}

/** Login form: email + password, wired to `POST /api/auth/login`. */
export function LoginForm({ labels: labelsProp }: LoginFormProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { email, password, error, isSubmitting, setEmail, setPassword, handleSubmit } = useLoginForm({
    genericErrorMessage: labels.genericErrorMessage,
  });

  return (
    <form onSubmit={ handleSubmit } className="mt-[26px]">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-text-strong">{ labels.heading }</h1>
      <p className="mt-[7px] text-[13.5px] leading-[1.6] text-text-muted text-pretty">{ labels.subheading }</p>

      { error ? (
        <NoticeBanner tone="danger" className="mt-4">
          { error }
        </NoticeBanner>
      ) : null }

      <div className="flex flex-col gap-3.5 mt-[22px]">
        <FormField label={ labels.emailLabel } htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            size="lg"
            required
            value={ email }
            onChange={ (event) => setEmail(event.target.value) }
          />
        </FormField>
        <FormField label={ labels.passwordLabel } htmlFor="login-password">
          <Input
            id="login-password"
            type="password"
            size="lg"
            required
            value={ password }
            onChange={ (event) => setPassword(event.target.value) }
          />
        </FormField>
      </div>

      <Button type="submit" pill size="lg" fullWidth disabled={ isSubmitting } className="mt-4">
        { isSubmitting ? labels.submittingLabel : labels.submitLabel }
      </Button>

      <p className="mt-4 text-[13px] text-text-subtle text-center">
        { labels.noAccountText }{ " " }
        <Link href="/register" className="text-orange-700 hover:text-orange-800 hover:underline">
          { labels.registerLinkLabel }
        </Link>
      </p>
    </form>
  );
}
