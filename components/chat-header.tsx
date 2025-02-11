import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeLogo } from "@/components/theme-logo";

interface ChatHeaderProps {
  hasInteracted: boolean;
  onNewChat: () => void;
}

export function ChatHeader({ hasInteracted, onNewChat }: ChatHeaderProps) {
  if (!hasInteracted) {
    return null;
  }

  return (
    <header className="sticky py-2 top-0 w-full bg-background border-b">
      <div className="w-full bg-background px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThemeLogo />
          </div>

          <Button
            variant="outline" 
            onClick={onNewChat}
            className="gap-2"
          >
            <Plus className="size-4" />
            Chat
          </Button>
        </div>
      </div>
    </header>
  );
} 