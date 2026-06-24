import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  hideCancel?: boolean;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const showConfirm = useCallback((opts: ConfirmOptions | string) => {
    return new Promise<boolean>((resolve) => {
      setOptions(typeof opts === "string" ? { message: opts } : opts);
      setResolver(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={options.title || "Konfirmasi"}
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            {!options.hideCancel && (
              <Button variant="secondary" onClick={handleCancel}>
                {options.cancelText || "Batal"}
              </Button>
            )}
            <Button 
              onClick={handleConfirm} 
              className={options.danger ? "bg-red-500 hover:bg-red-600 focus:ring-red-500" : ""}
            >
              {options.confirmText || "Konfirmasi"}
            </Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {options.message}
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}
