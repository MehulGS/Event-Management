"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CalendarDays, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // If already logged in, redirect away.
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.ok) router.replace("/feed");
      })
      .catch(() => {});
  }, [router]);

  // Client-side confirm-password validation.
  const confirmError =
    confirmPassword && password !== confirmPassword
      ? "Passwords do not match."
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ["Passwords do not match."] });
      return;
    }

    setLoading(true);

    try {
      const body: { email: string; password: string; displayName?: string } = {
        email,
        password,
      };
      if (name.trim()) body.displayName = name.trim();

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Auto-redirect to login after 1.5s.
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      if (res.status === 400 && json.error?.details) {
        setFieldErrors(json.error.details as Record<string, string[]>);
        setError("Please correct the errors below.");
      } else if (res.status === 409) {
        setError("An account with this email address already exists.");
        setFieldErrors({ email: ["This email is already registered."] });
      } else {
        setError(json.error?.message ?? "Signup failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--space-3) var(--space-4)",
    backgroundColor: "var(--color-bg-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-base)",
    color: "var(--color-text-primary)",
    boxShadow: "var(--shadow-inset)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-text-primary)",
    marginBottom: "var(--space-2)",
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8) var(--space-4)",
          backgroundColor: "var(--color-bg-page)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-raised-lg)",
            padding: "var(--space-10) var(--space-8)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-4)",
          }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={56} color="#065F46" aria-hidden="true" />
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Account created!
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", margin: 0 }}>
            Redirecting you to log in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8) var(--space-4)",
        backgroundColor: "var(--color-bg-page)",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-raised-lg)",
          padding: "var(--space-10) var(--space-8)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-8)",
          }}
        >
          <Link href="/" aria-label="Go to home page">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                borderRadius: "var(--radius-card)",
                backgroundColor: "var(--color-accent-primary)",
                boxShadow: "var(--shadow-raised)",
              }}
              aria-hidden="true"
            >
              <CalendarDays size={28} color="white" />
            </div>
          </Link>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Create your account
            </h1>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                margin: "var(--space-2) 0 0",
              }}
            >
              Join Community Events Board — it&apos;s free
            </p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "#FEF2F2",
              border: "1px solid var(--color-accent-danger)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-6)",
            }}
          >
            <AlertCircle
              size={16}
              color="#991B1B"
              aria-hidden="true"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <span style={{ fontSize: "var(--text-sm)", color: "#991B1B" }}>
              {error}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {/* Name (optional) */}
            <div>
              <label htmlFor="name" style={labelStyle}>
                Display name{" "}
                <span style={{ fontWeight: 400, color: "var(--color-text-disabled)" }}>
                  (optional)
                </span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                maxLength={60}
                style={inputStyle}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "var(--color-border-focus)";
                  (e.target as HTMLInputElement).style.outline = "2px solid var(--color-border-focus)";
                  (e.target as HTMLInputElement).style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.outline = "none";
                  (e.target as HTMLInputElement).style.borderColor = "var(--color-border)";
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={labelStyle}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={254}
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.email ? "var(--color-accent-danger)" : "var(--color-border)",
                }}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                aria-invalid={!!fieldErrors.email}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.outline = "2px solid var(--color-border-focus)";
                  (e.target as HTMLInputElement).style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.outline = "none";
                }}
              />
              {fieldErrors.email && (
                <p id="email-error" role="alert" style={{ fontSize: "var(--text-xs)", color: "#991B1B", marginTop: "var(--space-1)" }}>
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{
                    ...inputStyle,
                    paddingRight: "var(--space-10)",
                    borderColor: fieldErrors.password ? "var(--color-accent-danger)" : "var(--color-border)",
                  }}
                  aria-describedby="password-hint"
                  aria-invalid={!!fieldErrors.password}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.outline = "2px solid var(--color-border-focus)";
                    (e.target as HTMLInputElement).style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.outline = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "var(--space-3)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--space-1)",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p id="password-hint" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                Must be at least 8 characters.
              </p>
              {fieldErrors.password && (
                <p role="alert" style={{ fontSize: "var(--text-xs)", color: "#991B1B", marginTop: "var(--space-1)" }}>
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-password" style={labelStyle}>
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  style={{
                    ...inputStyle,
                    paddingRight: "var(--space-10)",
                    borderColor:
                      confirmError || fieldErrors.confirmPassword
                        ? "var(--color-accent-danger)"
                        : "var(--color-border)",
                  }}
                  aria-describedby={confirmError ? "confirm-error" : undefined}
                  aria-invalid={!!confirmError || !!fieldErrors.confirmPassword}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.outline = "2px solid var(--color-border-focus)";
                    (e.target as HTMLInputElement).style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.outline = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  style={{
                    position: "absolute",
                    right: "var(--space-3)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--space-1)",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(confirmError || fieldErrors.confirmPassword) && (
                <p id="confirm-error" role="alert" style={{ fontSize: "var(--text-xs)", color: "#991B1B", marginTop: "var(--space-1)" }}>
                  {confirmError ?? fieldErrors.confirmPassword?.[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!confirmError}
              aria-busy={loading}
              style={{
                width: "100%",
                padding: "var(--space-3) var(--space-6)",
                backgroundColor: "var(--color-accent-primary)",
                color: "var(--color-text-inverse)",
                border: "1px solid transparent",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-base)",
                fontWeight: 700,
                cursor: loading || !!confirmError ? "not-allowed" : "pointer",
                opacity: loading || !!confirmError ? 0.7 : 1,
                boxShadow: "var(--shadow-raised)",
                transition: "box-shadow 150ms ease, transform 100ms ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
              }}
            >
              {loading && (
                <Loader2
                  size={16}
                  aria-hidden="true"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>

        {/* Footer link */}
        <p
          style={{
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            marginTop: "var(--space-6)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--color-accent-primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-bg-page)",
          }}
        >
          <Loader2
            size={32}
            color="var(--color-accent-primary)"
            style={{ animation: "spin 1s linear infinite" }}
            aria-hidden="true"
          />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
