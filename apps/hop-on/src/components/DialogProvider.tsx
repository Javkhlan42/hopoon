'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'alert' | 'confirm';
}

interface DialogContextType {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({
    message: '',
    type: 'alert',
  });

  const showAlert = (message: string, title?: string) => {
    setOptions({
      message,
      title: title || 'localhost:3002 says',
      confirmText: 'OK',
      type: 'alert',
    });
    setIsOpen(true);
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title?: string,
  ) => {
    setOptions({
      message,
      title: title || 'localhost:3002 says',
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm,
      type: 'confirm',
    });
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (options.onConfirm) {
      options.onConfirm();
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    setIsOpen(false);
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-lg">
              {options.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base py-4">
              {options.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            {options.type === 'confirm' && (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
              >
                {options.cancelText || 'Cancel'}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              className="bg-cyan-500 text-white hover:bg-cyan-600 font-medium border-0"
            >
              {options.confirmText || 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
}
