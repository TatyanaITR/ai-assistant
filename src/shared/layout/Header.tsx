import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui";

interface HeaderProps {
    onNewChat: () => void;
    isLoading?: boolean;
}

export const Header = ({ onNewChat, isLoading }: HeaderProps) => {
    return (
        <header className="border-b py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">ИИ-ассистент</h1>
            <Button
                variant="outline"
                size="icon"
                onClick={onNewChat}
                title="Новый чат"
                disabled={isLoading}
            >
                <Plus className="w-5 h-5" />
            </Button>
        </header>
    );
};
