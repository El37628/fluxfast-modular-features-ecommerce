"use client";

import React from "react";
import { useResource, Link, useRouter } from "@fluxfast/next";

interface DashboardSummary {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
}

interface RecentOrderItem {
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  customer_name?: string;
  created_at: string;
  items?: RecentOrderItem[];
}

export default function DashboardPage() {
  const summary = useResource<DashboardSummary>("dashboard-summary");
  const recentOrders = useResource<RecentOrder[]>("recent-orders");
  const router = useRouter();

  return (
    <div style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.875rem", fontWeight: 700, color: "#0f172a" }}>
            Store Performance Dashboard
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>
            Real-time server-driven metrics via FluxFast resources
          </p>
        </div>
        <button
          onClick={() => router.refresh({ only: ["dashboard-summary", "recent-orders"] })}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontWeight: 500,
            color: "#334155",
          }}
        >
          ↻ Refresh Data
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Total Revenue
          </span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.5rem 0 0", color: "#059669" }}>
            ${(summary?.total_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Total Orders
          </span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.5rem 0 0", color: "#0f172a" }}>
            {summary?.total_orders ?? 0}
          </p>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Pending Orders
          </span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.5rem 0 0", color: "#d97706" }}>
            {summary?.pending_orders ?? 0}
          </p>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Catalog Products
          </span>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.5rem 0 0", color: "#2563eb" }}>
            {summary?.active_products ?? 0} / {summary?.total_products ?? 0} Active
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={{ background: "#ffffff", borderRadius: "0.5rem", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Recent Orders</h2>
          <Link href="/orders" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
            View All Orders →
          </Link>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.875rem" }}>
              <th style={{ padding: "0.75rem 0" }}>Order Number</th>
              <th style={{ padding: "0.75rem 0" }}>Status</th>
              <th style={{ padding: "0.75rem 0" }}>Amount</th>
              <th style={{ padding: "0.75rem 0" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {(recentOrders ?? []).map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.75rem 0", fontWeight: 500 }}>
                  <Link href={`/orders/${order.id}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                    {order.order_number}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: order.status === "completed" ? "#dcfce7" : "#fef3c7",
                      color: order.status === "completed" ? "#166534" : "#92400e",
                    }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0", fontWeight: 600 }}>
                  ${order.total_amount.toFixed(2)}
                </td>
                <td style={{ padding: "0.75rem 0", color: "#64748b", fontSize: "0.875rem" }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
