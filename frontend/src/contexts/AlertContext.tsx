import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";

interface AlertOptions {
  title?: string;
  message: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions | string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({ message: "" });
  const [resolver, setResolver] = useState<(() => void) | null>(null);

  const showAlert = useCallback((opts: AlertOptions | string) => {
    return new Promise<void>((resolve) => {
      setOptions(typeof opts === "string" ? { message: opts } : opts);
      setResolver(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (resolver) resolver();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={options.title || "Informasi"}
        size="sm"
        footer={
          <div className="flex justify-end w-full">
            <Button onClick={handleClose} className="min-w-[100px]">
              Tutup
            </Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {options.message}
        </div>
      </Modal>
    </AlertContext.Provider>
  );
}
