"use client";
import { useState, useCallback } from "react";

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  submitting: boolean;
}

interface UseFormStateReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  submitting: boolean;
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  setError: (key: keyof T, message: string) => void;
  clearError: (key: keyof T) => void;
  touch: (key: keyof T) => void;
  reset: () => void;
  setSubmitting: (v: boolean) => void;
  setValues: (values: Partial<T>) => void;
}

export function useFormState<T extends object>(initialValues: T): UseFormStateReturn<T> {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    dirty: false,
    submitting: false,
  });

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [key]: value },
      errors: { ...prev.errors, [key]: undefined },
      dirty: true,
    }));
  }, []);

  const setError = useCallback((key: keyof T, message: string) => {
    setState((prev) => ({ ...prev, errors: { ...prev.errors, [key]: message } }));
  }, []);

  const clearError = useCallback((key: keyof T) => {
    setState((prev) => ({ ...prev, errors: { ...prev.errors, [key]: undefined } }));
  }, []);

  const touch = useCallback((key: keyof T) => {
    setState((prev) => ({ ...prev, touched: { ...prev.touched, [key]: true } }));
  }, []);

  const reset = useCallback(() => {
    setState({ values: initialValues, errors: {}, touched: {}, dirty: false, submitting: false });
  }, [initialValues]);

  const setSubmitting = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, submitting: v }));
  }, []);

  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => ({ ...prev, values: { ...prev.values, ...values }, dirty: true }));
  }, []);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    dirty: state.dirty,
    submitting: state.submitting,
    setField,
    setError,
    clearError,
    touch,
    reset,
    setSubmitting,
    setValues,
  };
}
