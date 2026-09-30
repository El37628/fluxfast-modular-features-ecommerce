import React from "react";

export const metadata = {
  title: "FluxFast E-Commerce",
  description: "Server-driven e-commerce showcase built with FastAPI & Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
          backgroundColor: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0.75rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "bold",
                padding: "0.25rem 0.6rem",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            >
              FluxFast
            </span>
            <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
              E-Commerce Store
            </span>
          </div>
          <nav style={{ display: "flex", gap: "1.5rem" }}>
            <a
              href="/dashboard"
              style={{
                color: "#475569",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              Dashboard
            </a>
            <a
              href="/products"
              style={{
                color: "#475569",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              Catalog
            </a>
            <a
              href="/orders"
              style={{
                color: "#475569",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              Orders
            </a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
