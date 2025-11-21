import { Github, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui";

interface HeaderProps {
  onNewChat: () => void;
  isLoading?: boolean;
}

export const Header = ({ onNewChat, isLoading }: HeaderProps) => {
  return (
    <header className="border-b py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">ИИ-ассистент</h1>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/TatyanaITR/ai-assistant/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть репозиторий на GitHub"
          className={`inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition ${
            isLoading ? "pointer-events-none opacity-50" : ""
          }`}
          title="Открыть репозиторий"
        >
          <Github className="w-5 h-5" />
        </a>
        <Button
          variant="outline"
          size="icon"
          onClick={onNewChat}
          title="Новый чат"
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
