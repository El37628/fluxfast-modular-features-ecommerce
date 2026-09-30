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

from .schemas import CreateOrderInput, UpdateOrderStatusInput
from .service import OrderService

router = FluxRouter(prefix="/orders", tags=["orders"])


@router.page("", name="orders_list")
async def list_orders_page(
    customer_id: int | None = Query(None, description="Filter by customer ID"),
    db: AsyncSession = Depends(get_db),
) -> Page:
    order_scope = scope.user(customer_id) if customer_id is not None else scope.public()
    return Page(
        component="orders/index",
        resources=[
            resource(
                "customer-orders",
                lambda: OrderService.list_orders(db, customer_id=customer_id),
                scope=order_scope,
                ttl=15,
            )
        ],
        meta={"title": "Customer Orders · Modular Store"},
    )


@router.page("/{order_id}", name="order_detail")
async def show_order_page(
    order_id: int,
    db: AsyncSession = Depends(get_db),
) -> Page:
    return Page(
        component="orders/detail",
        resources=[
            resource(
                f"order-detail-{order_id}",
                lambda: OrderService.get_order(db, order_id),
                scope=scope.public(),
                ttl=30,
            )
        ],
        meta={"title": f"Order #{order_id} Invoice"},
    )


@router.mutation("", methods=["POST"], name="checkout_order")
async def checkout_order_action(
    payload: CreateOrderInput,
    db: AsyncSession = Depends(get_db),
) -> MutationResult:
    order_summary = await OrderService.place_order(db, payload)
    return mutation(
        patches={
            "customer-orders": [append_item(order_summary.model_dump(mode="json"))]
        },
        invalidates=[
            invalidate_resource("dashboard-summary", scope=scope.public()),
            invalidate_resource("product-catalog", scope=scope.public()),
            invalidate_resource("customer-orders", scope=scope.user(payload.customer_id)),
        ],
    )


@router.mutation("/{order_id}/status", methods=["PATCH"], name="update_order_status")
async def update_order_status_action(
    order_id: int,
    payload: UpdateOrderStatusInput,
    db: AsyncSession = Depends(get_db),
) -> MutationResult:
    order_summary = await OrderService.update_order_status(db, order_id, payload)
    return mutation(
        patches={
            "customer-orders": [replace_item(order_id, order_summary.model_dump(mode="json"))]
        },
        invalidates=[
            invalidate_resource("dashboard-summary", scope=scope.public()),
            invalidate_resource(f"order-detail-{order_id}", scope=scope.public()),
            invalidate_resource("customer-orders", scope=scope.user(order_summary.customer_id)),
        ],
    )
