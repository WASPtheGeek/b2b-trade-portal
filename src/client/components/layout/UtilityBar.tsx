import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

export interface UtilityBarLink {
  label: string;
  href?: string;
  icon?: IconName;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface UtilityBarProps extends HTMLAttributes<HTMLDivElement> {
  message?: ReactNode;
  links?: UtilityBarLink[];
}

export function UtilityBar({ message, links = [], className, ...rest }: UtilityBarProps) {
  return (
    <div className={ cn("hidden md:block bg-utility-bar border-b border-border-warm", className) } { ...rest }>
      <div className="max-w-layout-max mx-auto h-utility px-gutter flex items-center gap-4">
        <span className="flex-1 min-w-0 text-xs text-text-muted overflow-hidden text-ellipsis whitespace-nowrap">{ message }</span>
        <nav className="hidden sm:flex items-center gap-[18px] ml-auto flex-none">
          { links.map((l) => (
            <a
              key={ l.label }
              href={ l.href || "#" }
              onClick={ l.onClick }
              className="flex items-center gap-[5px] text-xs text-text-muted no-underline whitespace-nowrap hover:text-text-body"
            >
              { l.icon ? <Icon name={ l.icon } size={ 12 } /> : null }
              { l.label }
            </a>
          )) }
        </nav>
      </div>
    </div>
  );
}
