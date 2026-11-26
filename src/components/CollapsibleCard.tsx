import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CollapsibleCardProps = {
  storageKey: string;
  title: string;
  icon?: ReactNode;
  className?: string;
  titleClassName?: string;
  children: ReactNode;
};

export function CollapsibleCard({
  storageKey, title, icon, className, titleClassName, children,
}: CollapsibleCardProps) {
  const contentId = useId();
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // Keep the control usable when browser storage is unavailable.
    }
  }

  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className={cn("text-sm font-medium", titleClassName)}>{title}</span>
        <span className="flex shrink-0 items-center gap-3">
          {icon}
          <ChevronDown aria-hidden="true" className={cn("h-4 w-4 transition-transform motion-reduce:transition-none", expanded && "rotate-180")} />
        </span>
      </button>
      <div id={contentId} hidden={!expanded} className="pb-6">
        {children}
      </div>
    </Card>
  );
}
