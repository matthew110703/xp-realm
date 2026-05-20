import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { APP_NAME } from "@/constants/app.constants";

export const metadata = { title: `Setup — ${APP_NAME}` };

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="dot-grid-bg min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto mb-8 text-center">
        <h1 className="text-3xl font-heading font-bold text-primary">{APP_NAME}</h1>
        <p className="text-muted-foreground mt-2">Let&apos;s personalize your experience</p>
      </div>
      <OnboardingShell />
    </div>
  );
}
