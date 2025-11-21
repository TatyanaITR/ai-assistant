// src/ui/Chat/components/MessageEditForm.tsx
import type { FC } from "react";

import { Check, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { Textarea } from "@/shared/components/ui/textarea";

interface MessageEditFormProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const MessageEditForm: FC<MessageEditFormProps> = ({
  initialContent,
  onSave,
  onCancel,
}) => {
  const [editContent, setEditContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      adjustTextareaHeight();
    }
  }, []);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSave = () => {
    if (editContent.trim()) {
      onSave(editContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    adjustTextareaHeight();
  };

  const isSaveDisabled =
    !editContent.trim() || editContent.trim() === initialContent;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        ref={textareaRef}
        value={editContent}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[60px] bg-transparent border-none text-white placeholder:text-blue-200 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-0"
        placeholder="Введите ваше сообщение..."
      />
      <div className="flex items-center justify-between pt-2 border-t border-blue-400/30">
        <span className="text-xs text-blue-100">
          Ctrl+Enter для сохранения • Esc для отмены
        </span>
        <div className="flex gap-1">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md bg-blue-700/50 hover:bg-blue-700 transition-colors text-white"
            title="Отмена"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="p-1.5 rounded-md bg-blue-700/50 hover:bg-blue-700 transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-700/50"
            title="Сохранить"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
