import { WifiOff } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app.constants";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <WifiOff className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-heading font-bold">{APP_NAME}</h1>
      <p className="text-muted-foreground max-w-sm">
        You&apos;re offline. Connect to the internet to browse remote opportunities.
      </p>
      <Link href="/jobs" className={buttonVariants()}>Try again</Link>
    </div>
  );
}
