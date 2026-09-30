"use client";

import React from "react";
import { usePage, useResource, useForm, Link } from "@fluxfast/next";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: {
    name: string;
    sku: string;
  };
}

interface Order {
  id: number;
  customer_id: number;
  order_number: string;
  status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    tier: string;
  };
  items?: OrderItem[];
}

export default function OrderDetailPage() {
  const page = usePage();
  const segments = page.url.split("?")[0].split("/").filter(Boolean);
  const orderId = segments[1] ?? "1";
  const order = useResource<Order>(`order-detail-${orderId}`);

  const statusForm = useForm({
    status: order?.status ?? "pending",
  });

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/orders" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          ← Back to Orders
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "0.5rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.875rem", fontWeight: 700, color: "#0f172a" }}>
              Order {order?.order_number ?? `#${orderId}`}
            </h1>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>
              Placed by {order?.customer?.name ?? "Customer"} ({order?.customer?.email ?? ""})
            </p>
          </div>
          <span
            style={{
              padding: "0.3rem 0.75rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              backgroundColor:
                order?.status === "completed"
                  ? "#dcfce7"
                  : order?.status === "shipped"
                  ? "#e0e7ff"
                  : "#fef3c7",
              color:
                order?.status === "completed"
                  ? "#166534"
                  : order?.status === "shipped"
                  ? "#3730a3"
                  : "#92400e",
            }}
          >
            {(order?.status ?? "PENDING").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Order Line Items */}
      <section style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 1rem" }}>Purchased Items</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.875rem" }}>
              <th style={{ padding: "0.5rem 0" }}>Product</th>
              <th style={{ padding: "0.5rem 0" }}>Unit Price</th>
              <th style={{ padding: "0.5rem 0" }}>Quantity</th>
              <th style={{ padding: "0.5rem 0", textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order?.items ?? []).map((item: OrderItem) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.75rem 0", fontWeight: 500 }}>
                  {item.product?.name ?? `Product #${item.product_id}`}
                </td>
                <td style={{ padding: "0.75rem 0" }}>${item.unit_price.toFixed(2)}</td>
                <td style={{ padding: "0.75rem 0" }}>{item.quantity}</td>
                <td style={{ padding: "0.75rem 0", textAlign: "right", fontWeight: 600 }}>
                  ${item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ padding: "1rem 0 0", fontWeight: 700, fontSize: "1.1rem" }}>
                Total Paid
              </td>
              <td style={{ padding: "1rem 0 0", textAlign: "right", fontWeight: 700, fontSize: "1.2rem", color: "#059669" }}>
                ${order?.total_amount.toFixed(2) ?? "0.00"}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Fulfillment Status Update */}
      <section style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 1rem" }}>
          Update Fulfillment Status
        </h3>
        <form
          onSubmit={statusForm.submit(`/orders/${orderId}/status`, {
            onSuccess: () => alert("Order fulfillment status updated!"),
          })}
          style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
        >
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Select Status
            </label>
            <select
              value={statusForm.data.status}
              onChange={(e) => statusForm.setData("status", e.target.value)}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem" }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={statusForm.processing}
            style={{
              padding: "0.55rem 1.25rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.375rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {statusForm.processing ? "Updating..." : "Update Status"}
          </button>
        </form>
      </section>
    </div>
  );
}
