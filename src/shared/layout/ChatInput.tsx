import { Send } from "lucide-react";
import { useState } from "react";

import { Button, Textarea } from "@/shared/components/ui";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) return;

        onSendMessage(trimmedValue);
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t px-4 py-4 flex gap-2">
            <Textarea
                placeholder="Введите сообщение..."
                className="flex-1 min-h-[60px] resize-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            <Button
                className="self-end"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
            >
                <Send className="w-4 h-4" />
            </Button>
        </div>
    );
};
