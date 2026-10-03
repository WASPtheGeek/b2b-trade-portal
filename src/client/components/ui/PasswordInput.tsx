"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Input, type InputProps } from "./Input";

export interface PasswordInputProps extends Omit<InputProps, "type" | "suffix"> {
  /** aria-label for the toggle when the password is currently hidden. */
  showPasswordLabel?: string;
  /** aria-label for the toggle when the password is currently visible. */
  hidePasswordLabel?: string;
}

/** `Input` for a password field, with a show/hide toggle in its suffix slot. */
export function PasswordInput({
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      { ...rest }
      type={ visible ? "text" : "password" }
      suffix={
        <button
          type="button"
          aria-label={ visible ? hidePasswordLabel : showPasswordLabel }
          onClick={ () => setVisible((v) => !v) }
          className="flex items-center justify-center border-none bg-transparent p-0 cursor-pointer text-text-subtle hover:text-text-body"
        >
          <Icon name={ visible ? "eye-off" : "eye" } size={ 16 } />
        </button>
      }
    />
  );
}
