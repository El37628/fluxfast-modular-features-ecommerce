from fastapi import Depends, Query
from fluxfast import (
    FluxRouter,
    MutationResult,
    Page,
    append_item,
    invalidate_resource,
    mutation,
    replace_item,
    resource,
    scope,
)
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

from .schemas import CreateProductInput, UpdateStockInput
from .service import CatalogService

router = FluxRouter(prefix="/products", tags=["catalog"])


@router.page("", name="products_catalog")
async def list_products_page(
    category_id: int | None = Query(None, description="Filter by category ID"),
    search: str | None = Query(None, description="Search by name or SKU"),
    db: AsyncSession = Depends(get_db),
) -> Page:
    return Page(
        component="products/index",
        resources=[
            resource(
                "categories-list",
                lambda: CatalogService.list_categories(db),
                scope=scope.public(),
                ttl=300,
            ),
            resource(
                "product-catalog",
                lambda: CatalogService.list_products(db, category_id=category_id, search=search),
                scope=scope.public(),
                ttl=30,
            ),
        ],
        meta={"title": "Product Catalog · Modular Store"},
    )


@router.page("/{product_id}", name="product_detail")
async def show_product_page(
    product_id: int,
    db: AsyncSession = Depends(get_db),
) -> Page:
    return Page(
        component="products/detail",
        resources=[
            resource(
                f"product-detail-{product_id}",
                lambda: CatalogService.get_product(db, product_id),
                scope=scope.public(),
                ttl=30,
            )
        ],
        meta={"title": f"Product #{product_id} Details"},
    )


@router.mutation("", methods=["POST"], name="create_product")
async def create_product_action(
    payload: CreateProductInput,
    db: AsyncSession = Depends(get_db),
) -> MutationResult:
    item = await CatalogService.create_product(db, payload)
    return mutation(
        patches={
            "product-catalog": [append_item(item.model_dump(mode="json"))]
        },
        invalidates=[
            invalidate_resource("dashboard-summary", scope=scope.public()),
            invalidate_resource("categories-list", scope=scope.public()),
        ],
    )


@router.mutation("/{product_id}/stock", methods=["PATCH"], name="update_product_stock")
async def update_stock_action(
    product_id: int,
    payload: UpdateStockInput,
    db: AsyncSession = Depends(get_db),
) -> MutationResult:
    item = await CatalogService.update_stock(db, product_id, payload)
    return mutation(
        patches={
            "product-catalog": [replace_item(product_id, item.model_dump(mode="json"))]
        },
        invalidates=[
            invalidate_resource("dashboard-summary", scope=scope.public()),
            invalidate_resource(f"product-detail-{product_id}", scope=scope.public()),
        ],
    )
