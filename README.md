# FluxFast Modular Features (Vertical Slices) E-Commerce Showcase

A production-grade reference implementation demonstrating how to structure a **FluxFast** application using **Feature-Driven / Vertical Slice (Modular Architecture)** with **FastAPI** and **MySQL**.

---

## Architectural Philosophy

In traditional layered architectures, code is partitioned horizontally by technical layer (e.g., all controllers in one folder, all models in another). In contrast, **Feature-Driven Architecture (Package-by-Feature / Vertical Slices)** partitions code vertically by business capability:

- Every feature module is self-contained: it contains its own models, schemas, service logic, and its own **`FluxRouter`**.
- Cross-cutting shared infrastructure (database connection, base models, configuration) is centralized in `core/`.
- The main entrypoint `main.py` serves as an aggregator that initializes `FluxFast` and mounts the feature routers.

```
       [ Client / Next.js Browser ]
                   │
                   │  HTTP (X-FluxFast: 1)
                   ▼
       ┌───────────────────────────────┐
       │     FastAPI + FluxFast        │
       │           main.py             │
       └───────┬───────┬───────┬───────┘
               │       │       │
      mounts   │       │       │ mounts
   ┌───────────┘       │       └───────────┐
   ▼                   ▼                   ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Catalog    │ │    Orders    │ │  Dashboard   │
│    Module    │ │    Module    │ │    Module    │
│  (FluxRouter)│ │ (FluxRouter) │ │ (FluxRouter) │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └───────────┬────┴────────────────┘
                   ▼
       ┌───────────────────────────────┐
       │     Core Shared Database      │
       │         (MySQL 8.4)           │
       └───────────────────────────────┘
```

---

## Directory Structure

```
fluxfast-modular-features-ecommerce/
├── core/                           # Shared Cross-Cutting Infrastructure
│   ├── __init__.py
│   ├── config.py                   # Global settings and database configuration
│   ├── database.py                 # Async SQLAlchemy engine, session maker, get_db
│   └── seed.py                     # Initial seed dataset
├── modules/                        # Autonomous Vertical Feature Slices
│   ├── catalog/                    # Catalog Feature (Categories & Products)
│   │   ├── __init__.py             # Exports catalog_router
│   │   ├── models.py               # CategoryORM and ProductORM
│   │   ├── schemas.py              # Pydantic models for catalog
│   │   ├── service.py              # Catalog business logic
│   │   └── router.py               # FluxRouter(prefix="/products")
│   ├── orders/                     # Orders Feature (Customers & Orders)
│   │   ├── __init__.py             # Exports orders_router
│   │   ├── models.py               # CustomerORM, OrderORM, OrderItemORM
│   │   ├── schemas.py              # Pydantic models for orders & checkout
│   │   ├── service.py              # Order placement, inventory validation
│   │   └── router.py               # FluxRouter(prefix="/orders")
│   └── dashboard/                  # Dashboard Feature (Cross-domain reporting)
│       ├── __init__.py             # Exports dashboard_router
│       ├── schemas.py              # DashboardSummary schema
│       ├── service.py              # Aggregates metrics from catalog and orders
│       └── router.py               # FluxRouter for "/" and "/dashboard"
├── tests/
│   ├── conftest.py                 # Async test client & in-memory DB setup
│   ├── test_pages.py               # Page contracts and resources
│   ├── test_mutations.py           # Reactive mutation patches and invalidations
│   └── test_modular_cohesion.py    # Architectural isolation and router verification
├── docker-compose.yml              # Multi-container MySQL 8.4 + API setup
├── Dockerfile                      # Container build definition
├── init_db.sql                     # Raw MySQL DDL and seed dataset
├── main.py                         # App root mounting all feature FluxRouters
├── pyproject.toml                  # Python package configuration
└── README.md
```

---

## Declaring and Using FluxFast in Modular Architecture

### 1. Independent Module Routers
Each module creates and configures its own `FluxRouter`:
```python
# modules/catalog/router.py
router = FluxRouter(prefix="/products", tags=["catalog"])

@router.page("", name="products_catalog")
async def list_products_page(db: AsyncSession = Depends(get_db)) -> Page:
    return Page(
        component="products/index",
        resources=[
            resource("categories-list", lambda: CatalogService.list_categories(db), scope=scope.public(), ttl=300),
            resource("product-catalog", lambda: CatalogService.list_products(db), scope=scope.public(), ttl=30),
        ],
        meta={"title": "Product Catalog · Modular Store"},
    )
```

### 2. Colocated Mutations with Atomic Patches
Mutations live directly alongside the queries they modify:
```python
# modules/catalog/router.py
@router.mutation("", methods=["POST"], name="create_product")
async def create_product_action(payload: CreateProductInput, db: AsyncSession = Depends(get_db)) -> MutationResult:
    item = await CatalogService.create_product(db, payload)
    return mutation(
        patches={"product-catalog": [append_item(item.model_dump(mode="json"))]},
        invalidates=[
            invalidate_resource("dashboard-summary", scope=scope.public()),
            invalidate_resource("categories-list", scope=scope.public()),
        ],
    )
```

### 3. Aggregating Feature Routers at Application Root
In `main.py`, the core application combines all feature routers with standard FastAPI semantics:
```python
app = FastAPI(title=settings.NAME, lifespan=lifespan)
flux = FluxFast(app, debug=settings.is_debug)

# Register authoritative contracts
flux.define_resource("dashboard-summary", DashboardSummary)
flux.define_resource("product-catalog", list[ProductListItem])
flux.define_resource("categories-list", list[CategoryItem])
flux.define_resource("customer-orders", list[OrderSummary])

# Mount self-contained feature FluxRouters
app.include_router(dashboard_router)
app.include_router(catalog_router)
app.include_router(orders_router)
```

---

## Relational Schema (5 MySQL Tables)

1. `categories` - Product categories (`id`, `slug`, `name`, `description`).
2. `customers` - Registered buyers (`id`, `email`, `name`, `tier`).
3. `products` - Inventory catalog (`id`, `category_id`, `sku`, `name`, `price`, `stock_quantity`, `is_active`).
4. `orders` - Customer purchase orders (`id`, `customer_id`, `order_number`, `status`, `total_amount`, `notes`).
5. `order_items` - Order line items (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`).

---

## Getting Started

### 1. Local Development (Instant SQLite)
```bash
uv sync --extra dev
uv run uvicorn main:app --reload --port 8000
```

### 2. Running with MySQL 8.4 via Docker Compose
```bash
docker compose up --build
```
Access MySQL on port `33063` and the API on `http://localhost:8002`.

### 3. Running Tests
```bash
uv run pytest -v
```

### 4. Exporting Schema Manifest
```bash
uv run fluxfast schema main:app
```
