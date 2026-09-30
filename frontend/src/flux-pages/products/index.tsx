"use client";

import React, { useState } from "react";
import { useResource, useForm, Link } from "@fluxfast/next";

interface Category {
  id: number;
  slug: string;
  name: string;
}

interface Product {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  category_name?: string;
}

export default function ProductsPage() {
  const products = useResource<Product[]>("product-catalog");
  const categories = useResource<Category[]>("categories-list");
  const [showAddForm, setShowAddForm] = useState(false);

  const productForm = useForm({
    category_id: 1,
    sku: "",
    name: "",
    price: 0.0,
    stock_quantity: 0,
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
            Product Catalog
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>
            Manage warehouse inventory, product variants, and pricing
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
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
          {showAddForm ? "✕ Cancel" : "+ New Product"}
        </button>
      </div>

      {/* Add Product Modal/Card */}
      {showAddForm && (
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
            Add Product to Catalog
          </h2>
          <form
            onSubmit={productForm.submit("/products", {
              onSuccess: () => {
                productForm.reset();
                setShowAddForm(false);
              },
            })}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  SKU Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELEC-LAP-001"
                  value={productForm.data.sku}
                  onChange={(e) => productForm.setData("sku", e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultra Slim Laptop"
                  value={productForm.data.name}
                  onChange={(e) => productForm.setData("name", e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Category
                </label>
                <select
                  value={productForm.data.category_id}
                  onChange={(e) => productForm.setData("category_id", Number(e.target.value))}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                >
                  {(categories ?? []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.data.price}
                  onChange={(e) => productForm.setData("price", parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Initial Stock
                </label>
                <input
                  type="number"
                  required
                  value={productForm.data.stock_quantity}
                  onChange={(e) => productForm.setData("stock_quantity", parseInt(e.target.value, 10) || 0)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={productForm.processing}
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
              {productForm.processing ? "Saving..." : "Save Product"}
            </button>
          </form>
        </section>
      )}

      {/* Catalog Table */}
      <section style={{ background: "#ffffff", borderRadius: "0.5rem", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.875rem" }}>
              <th style={{ padding: "0.75rem 0" }}>SKU</th>
              <th style={{ padding: "0.75rem 0" }}>Product Name</th>
              <th style={{ padding: "0.75rem 0" }}>Price</th>
              <th style={{ padding: "0.75rem 0" }}>Stock</th>
              <th style={{ padding: "0.75rem 0" }}>Status</th>
              <th style={{ padding: "0.75rem 0" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.75rem 0", fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>
                  {product.sku}
                </td>
                <td style={{ padding: "0.75rem 0", fontWeight: 500 }}>
                  <Link href={`/products/${product.id}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                    {product.name}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem 0", fontWeight: 600 }}>
                  ${product.price.toFixed(2)}
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: product.stock_quantity > 10 ? "#059669" : product.stock_quantity > 0 ? "#d97706" : "#dc2626",
                    }}
                  >
                    {product.stock_quantity} units
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: product.is_active ? "#dcfce7" : "#fee2e2",
                      color: product.is_active ? "#166534" : "#991b1b",
                    }}
                  >
                    {product.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0" }}>
                  <Link
                    href={`/products/${product.id}`}
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
                    Edit / Stock →
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
