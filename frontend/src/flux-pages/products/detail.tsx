"use client";

import React from "react";
import { usePage, useResource, useForm, Link } from "@fluxfast/next";

interface Product {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  category_name?: string;
  category?: {
    id: number;
    name: string;
  };
}

export default function ProductDetailPage() {
  const page = usePage();
  const segments = page.url.split("?")[0].split("/").filter(Boolean);
  const productId = segments[1] ?? "1";
  const product = useResource<Product>(`product-detail-${productId}`);

  const stockForm = useForm({
    stock_quantity: product?.stock_quantity ?? 0,
  });

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/products" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          ← Back to Catalog
        </Link>
        <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.875rem", fontWeight: 700, color: "#0f172a" }}>
          {product?.name ?? `Product #${productId}`}
        </h1>
        <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontFamily: "monospace" }}>
          SKU: {product?.sku ?? "-"}
        </p>
      </div>

      <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Category</span>
            <p style={{ fontWeight: 600, margin: "0.25rem 0 0" }}>{product?.category?.name ?? "General"}</p>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Unit Price</span>
            <p style={{ fontWeight: 600, fontSize: "1.25rem", color: "#059669", margin: "0.25rem 0 0" }}>
              ${product?.price?.toFixed(2) ?? "0.00"}
            </p>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Current Stock</span>
            <p style={{ fontWeight: 600, margin: "0.25rem 0 0" }}>{product?.stock_quantity ?? 0} units</p>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Listing Status</span>
            <p style={{ margin: "0.25rem 0 0" }}>
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: product?.is_active ? "#dcfce7" : "#fee2e2",
                  color: product?.is_active ? "#166534" : "#991b1b",
                }}
              >
                {product?.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </p>
          </div>
        </div>

        {/* Stock Adjustment Form */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 1rem" }}>
            Adjust Warehouse Inventory
          </h3>
          <form
            onSubmit={stockForm.submit(`/products/${productId}/stock`, {
              onSuccess: () => alert("Stock quantity successfully updated!"),
            })}
            style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                New Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={stockForm.data.stock_quantity}
                onChange={(e) => stockForm.setData("stock_quantity", parseInt(e.target.value, 10) || 0)}
                style={{ padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem" }}
              />
            </div>
            <button
              type="submit"
              disabled={stockForm.processing}
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
              {stockForm.processing ? "Updating..." : "Update Stock"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
