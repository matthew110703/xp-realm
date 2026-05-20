import { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-heading font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        action.href ? (
          <a href={action.href} className={buttonVariants({ variant: "outline" })}>{action.label}</a>
        ) : (
          <Button variant="outline" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
