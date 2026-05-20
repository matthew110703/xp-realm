"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";
import { APP_NAME } from "@/constants/app.constants";

interface Props {
  userName: string | null;
  userImage: string | null;
  onTogglePush?: () => void;
  pushEnabled?: boolean;
}

export function Topbar({ userName, userImage, onTogglePush, pushEnabled }: Props) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm md:hidden">
      <Link href="/jobs" className="text-base font-heading font-bold text-primary">
        {APP_NAME}
      </Link>

      <div className="flex items-center gap-2">
        {onTogglePush && (
          <Tooltip>
            <TooltipTrigger
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={onTogglePush}
              aria-label="Toggle notifications"
            >
              <Bell className={`h-4 w-4 ${pushEnabled ? "text-primary fill-primary/20" : "text-muted-foreground"}`} />
            </TooltipTrigger>
            <TooltipContent>{pushEnabled ? "Disable notifications" : "Enable notifications"}</TooltipContent>
          </Tooltip>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-accent"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={userImage ?? undefined} alt={userName ?? "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(userName ?? "U")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="p-0">
              <Link href="/settings" className="flex items-center gap-2 px-1.5 py-1 w-full">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link href="/settings" className="flex items-center gap-2 px-1.5 py-1 w-full">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
