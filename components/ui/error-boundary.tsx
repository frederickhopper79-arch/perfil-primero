"use client";
import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  section?: string;
}

interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ErrorBoundary:${this.props.section ?? "unknown"}]`, err, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" style={{ padding: 24, textAlign: "center", color: "var(--error,#dc2626)" }}>
          <p style={{ fontWeight: 600 }}>Algo salió mal en esta sección.</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>{this.state.message}</p>
          <button
            style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "1px solid currentColor", background: "none", cursor: "pointer", color: "inherit" }}
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
