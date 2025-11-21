import type { ReactNode } from "react";

interface MainLayoutProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  error?: string | null;
}

export const MainLayout = ({
  header,
  children,
  footer,
  error,
}: MainLayoutProps) => {
  return (
    <div className="flex flex-col h-screen w-[90%] max-w-[960px] mx-auto">
      {header}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-4 mt-4">
          <p className="text-sm">
            <strong>Ошибка:</strong> {error}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6">{children}</div>

      {footer}
    </div>
  );
};
