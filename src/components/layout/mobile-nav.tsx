"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Compass, MessageSquare, Bookmark, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/social", label: "Social", icon: MessageSquare },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface Props {
  socialUnread?: number;
}

export function MobileNav({ socialUnread = 0 }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch h-16 border-t border-border bg-background/90 backdrop-blur-sm"
      aria-label="Bottom navigation"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors relative",
              active ? "text-primary" : "text-muted-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-5 w-5" />
            {label}
            {label === "Social" && socialUnread > 0 && (
              <span className="absolute top-2 right-[calc(50%-14px)] bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {socialUnread > 9 ? "9+" : socialUnread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
