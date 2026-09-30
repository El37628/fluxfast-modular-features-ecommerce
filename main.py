from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fluxfast import FluxFast

from core.config import settings
from core.database import AsyncSessionLocal, init_db
from core.seed import seed_modular_db
from modules.catalog import catalog_router
from modules.catalog.schemas import CategoryItem, ProductListItem
from modules.dashboard import dashboard_router
from modules.dashboard.schemas import DashboardSummary
from modules.orders import orders_router
from modules.orders.schemas import OrderSummary


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_modular_db(session)
    yield


app = FastAPI(
    title=settings.NAME,
    description="Showcasing how to structure FluxFast using Modular Features / Vertical Slices",
    version="1.0.0",
    lifespan=lifespan,
)

# Initialize FluxFast runtime
flux = FluxFast(app, debug=settings.is_debug)

# Authoritative typed resource contracts for frontend codegen and type safety
flux.define_resource("dashboard-summary", DashboardSummary)
flux.define_resource("product-catalog", list[ProductListItem])
flux.define_resource("categories-list", list[CategoryItem])
flux.define_resource("customer-orders", list[OrderSummary])

# Mount self-contained feature FluxRouters
app.include_router(dashboard_router)
app.include_router(catalog_router)
app.include_router(orders_router)
