"use client";
import { useState, useCallback } from "react";

interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  destructive: boolean;
}

const DEFAULT_STATE: ConfirmDialogState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
  onConfirm: () => {},
  destructive: false,
};

interface UseConfirmDialogReturn {
  state: ConfirmDialogState;
  confirm: (options: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }) => Promise<boolean>;
  close: () => void;
  handleConfirm: () => void;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [state, setState] = useState<ConfirmDialogState>(DEFAULT_STATE);

  const confirm = useCallback((options: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title,
        description: options.description ?? "",
        confirmLabel: options.confirmLabel ?? "Confirmar",
        cancelLabel: options.cancelLabel ?? "Cancelar",
        destructive: options.destructive ?? false,
        onConfirm: () => {
          setState((prev) => ({ ...prev, open: false }));
          resolve(true);
        },
      });

      // Si se cierra sin confirmar
      const originalClose = () => {
        setState(DEFAULT_STATE);
        resolve(false);
      };
      setState((prev) => ({ ...prev, _reject: originalClose } as ConfirmDialogState));
    });
  }, []);

  const close = useCallback(() => setState(DEFAULT_STATE), []);
  const handleConfirm = useCallback(() => { state.onConfirm(); }, [state]);

  return { state, confirm, close, handleConfirm };
}
