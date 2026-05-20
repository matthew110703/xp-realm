"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Compass, MessageSquare, Bookmark, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { APP_NAME } from "@/constants/app.constants";

const NAV_ITEMS = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/social", label: "Social", icon: MessageSquare },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface Props {
  userName: string | null;
  userImage: string | null;
  socialUnread?: number;
}

export function Sidebar({ userName, userImage, socialUnread = 0 }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-border bg-sidebar shrink-0">
      <div className="p-4 border-b border-border">
        <Link href="/jobs" className="text-lg font-heading font-bold text-primary tracking-tight">
          {APP_NAME}
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {label === "Social" && socialUnread > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {socialUnread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userImage ?? undefined} alt={userName ?? "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(userName ?? "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">{userName ?? "User"}</span>
        </div>
      </div>
    </aside>
  );
}
