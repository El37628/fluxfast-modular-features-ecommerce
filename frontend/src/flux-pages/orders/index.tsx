"use client";

import React, { useState } from "react";
import { useResource, useForm, Link } from "@fluxfast/next";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name?: string;
}

interface Order {
  id: number;
  customer_id: number;
  order_number: string;
  status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}

interface CheckoutPayload {
  customer_id: number;
  items: { product_id: number; quantity: number }[];
  notes: string;
}

export default function OrdersPage() {
  const orders = useResource<Order[]>("customer-orders");
  const [showCheckout, setShowCheckout] = useState(false);

  const checkoutForm = useForm<CheckoutPayload>({
    customer_id: 1,
    items: [{ product_id: 1, quantity: 1 }],
    notes: "Order placed via FluxFast web storefront",
  });

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
            Customer Orders
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>
            Order processing, fulfillment status, and transaction history
          </p>
        </div>
        <button
          onClick={() => setShowCheckout(!showCheckout)}
          style={{
            padding: "0.6rem 1.25rem",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "0.375rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showCheckout ? "✕ Close" : "+ New Checkout"}
        </button>
      </div>

      {showCheckout && (
        <section
          style={{
            background: "#ffffff",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            border: "1px solid #bfdbfe",
            marginBottom: "2rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 1rem" }}>
            Quick Order Checkout
          </h2>
          <form
            onSubmit={checkoutForm.submit("/orders/checkout", {
              onSuccess: () => {
                checkoutForm.reset();
                setShowCheckout(false);
              },
            })}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Customer ID
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={checkoutForm.data.customer_id}
                  onChange={(e) => checkoutForm.setData("customer_id", parseInt(e.target.value, 10) || 1)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Product ID
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={checkoutForm.data.items[0]?.product_id ?? 1}
                  onChange={(e) => {
                    const pid = parseInt(e.target.value, 10) || 1;
                    const qty = checkoutForm.data.items[0]?.quantity ?? 1;
                    checkoutForm.setData("items", [{ product_id: pid, quantity: qty }]);
                  }}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={checkoutForm.data.items[0]?.quantity ?? 1}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value, 10) || 1;
                    const pid = checkoutForm.data.items[0]?.product_id ?? 1;
                    checkoutForm.setData("items", [{ product_id: pid, quantity: qty }]);
                  }}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Order Notes
                </label>
                <input
                  type="text"
                  value={checkoutForm.data.notes}
                  onChange={(e) => checkoutForm.setData("notes", e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutForm.processing}
              style={{
                padding: "0.6rem 1.5rem",
                backgroundColor: "#059669",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.375rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {checkoutForm.processing ? "Processing Order..." : "Confirm & Place Order"}
            </button>
          </form>
        </section>
      )}

      {/* Orders Table */}
      <section style={{ background: "#ffffff", borderRadius: "0.5rem", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.875rem" }}>
              <th style={{ padding: "0.75rem 0" }}>Order Number</th>
              <th style={{ padding: "0.75rem 0" }}>Customer ID</th>
              <th style={{ padding: "0.75rem 0" }}>Total Amount</th>
              <th style={{ padding: "0.75rem 0" }}>Status</th>
              <th style={{ padding: "0.75rem 0" }}>Created At</th>
              <th style={{ padding: "0.75rem 0" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.75rem 0", fontWeight: 600 }}>
                  <Link href={`/orders/${order.id}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                    {order.order_number}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  Customer #{order.customer_id}
                </td>
                <td style={{ padding: "0.75rem 0", fontWeight: 600 }}>
                  ${order.total_amount.toFixed(2)}
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor:
                        order.status === "completed"
                          ? "#dcfce7"
                          : order.status === "shipped"
                          ? "#e0e7ff"
                          : "#fef3c7",
                      color:
                        order.status === "completed"
                          ? "#166534"
                          : order.status === "shipped"
                          ? "#3730a3"
                          : "#92400e",
                    }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0", color: "#64748b", fontSize: "0.875rem" }}>
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  <Link
                    href={`/orders/${order.id}`}
                    style={{
                      padding: "0.3rem 0.75rem",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "0.25rem",
                      color: "#334155",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                    }}
                  >
                    Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
