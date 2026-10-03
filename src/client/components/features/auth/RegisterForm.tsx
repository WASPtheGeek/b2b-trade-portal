"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useRegisterForm, type UseRegisterFormOptions } from "@/hooks/useRegisterForm";

export interface RegisterFormLabels {
  heading: string;
  subheading: string;
  businessNameLabel: string;
  registrationNumberLabel: string;
  firstNameLabel: string;
  lastNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  passwordLabel: string;
  passwordHint: string;
  confirmPasswordLabel: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  noticeText: string;
  submitLabel: string;
  submittingLabel: string;
  alreadyApprovedText: string;
  loginLinkLabel: string;
  genericErrorMessage: string;
  passwordMismatchMessage: string;
}

const DEFAULT_LABELS: RegisterFormLabels = {
  heading: "Create your business account",
  subheading: "Pricing and ordering unlock once our team reviews and approves your business.",
  businessNameLabel: "Business name",
  registrationNumberLabel: "Registration number",
  firstNameLabel: "First name",
  lastNameLabel: "Last name",
  emailLabel: "Business email",
  phoneLabel: "Phone",
  passwordLabel: "Password",
  passwordHint: "At least 8 characters, with a letter and a number",
  confirmPasswordLabel: "Confirm password",
  showPasswordLabel: "Show password",
  hidePasswordLabel: "Hide password",
  noticeText:
    "After registering, your account is sent for admin approval. You can already browse the full catalog — pricing and ordering appear once your account is activated.",
  submitLabel: "Create account",
  submittingLabel: "Creating account…",
  alreadyApprovedText: "Already approved?",
  loginLinkLabel: "Sign in",
  genericErrorMessage: "Failed to create the account. Please try again.",
  passwordMismatchMessage: "Passwords do not match.",
};

export interface RegisterFormProps extends Omit<UseRegisterFormOptions, "genericErrorMessage"> {
  labels?: Partial<RegisterFormLabels>;
}

/** Self-registration form for a new business account, wired to `POST /api/auth/register`. */
export function RegisterForm({ onSuccess, labels: labelsProp }: RegisterFormProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { fields, error, isSubmitting, setField, handleSubmit } = useRegisterForm({
    onSuccess,
    genericErrorMessage: labels.genericErrorMessage,
    passwordMismatchMessage: labels.passwordMismatchMessage,
  });

  return (
    <form onSubmit={ handleSubmit } className="mt-[26px]">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-text-strong">{ labels.heading }</h1>
      <p className="mt-[7px] text-[length:var(--font-size-base)] leading-[1.6] text-text-muted text-pretty">{ labels.subheading }</p>

      { error ? (
        <NoticeBanner tone="danger" className="mt-4">
          { error }
        </NoticeBanner>
      ) : null }

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-[22px]">
        <FormField label={ labels.businessNameLabel } htmlFor="register-business-name" required className="md:col-span-2">
          <Input
            id="register-business-name"
            required
            value={ fields.businessName }
            onChange={ (event) => setField("businessName", event.target.value) }
          />
        </FormField>
        <FormField label={ labels.registrationNumberLabel } htmlFor="register-registration-number" required className="md:col-span-2">
          <Input
            id="register-registration-number"
            mono
            required
            value={ fields.registrationNumber }
            onChange={ (event) => setField("registrationNumber", event.target.value) }
          />
        </FormField>
        <FormField label={ labels.firstNameLabel } htmlFor="register-first-name" required>
          <Input
            id="register-first-name"
            required
            value={ fields.firstName }
            onChange={ (event) => setField("firstName", event.target.value) }
          />
        </FormField>
        <FormField label={ labels.lastNameLabel } htmlFor="register-last-name" required>
          <Input
            id="register-last-name"
            required
            value={ fields.lastName }
            onChange={ (event) => setField("lastName", event.target.value) }
          />
        </FormField>
        <FormField label={ labels.emailLabel } htmlFor="register-email" required className="md:col-span-2">
          <Input
            id="register-email"
            type="email"
            required
            value={ fields.email }
            onChange={ (event) => setField("email", event.target.value) }
          />
        </FormField>
        <FormField label={ labels.phoneLabel } htmlFor="register-phone" className="md:col-span-2">
          <Input
            id="register-phone"
            mono
            value={ fields.phone }
            onChange={ (event) => setField("phone", event.target.value) }
          />
        </FormField>
        <FormField label={ labels.passwordLabel } htmlFor="register-password" required hint={ labels.passwordHint }>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            required
            minLength={ 8 }
            value={ fields.password }
            onChange={ (event) => setField("password", event.target.value) }
            showPasswordLabel={ labels.showPasswordLabel }
            hidePasswordLabel={ labels.hidePasswordLabel }
          />
        </FormField>
        <FormField label={ labels.confirmPasswordLabel } htmlFor="register-confirm-password" required>
          <PasswordInput
            id="register-confirm-password"
            autoComplete="new-password"
            required
            minLength={ 8 }
            value={ fields.confirmPassword }
            onChange={ (event) => setField("confirmPassword", event.target.value) }
            showPasswordLabel={ labels.showPasswordLabel }
            hidePasswordLabel={ labels.hidePasswordLabel }
          />
        </FormField>
      </div>

      <NoticeBanner tone="brand" icon="info" className="mt-5">
        { labels.noticeText }
      </NoticeBanner>

      <Button type="submit" pill size="lg" fullWidth disabled={ isSubmitting } className="mt-[18px]">
        { isSubmitting ? labels.submittingLabel : labels.submitLabel }
      </Button>

      <p className="mt-3.5 text-[length:var(--font-size-base)] text-text-subtle text-center">
        { labels.alreadyApprovedText }{ " " }
        <Link href="/login" className="text-orange-700 hover:text-orange-800 hover:underline">
          { labels.loginLinkLabel }
        </Link>
      </p>
    </form>
  );
}
