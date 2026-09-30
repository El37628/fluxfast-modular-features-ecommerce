import uuid
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.catalog.models import ProductORM

from .models import CustomerORM, OrderItemORM, OrderORM
from .schemas import (
    CreateOrderInput,
    OrderDetail,
    OrderItemDetail,
    OrderSummary,
    UpdateOrderStatusInput,
)


class OrderService:
    @staticmethod
    async def list_orders(
        db: AsyncSession,
        customer_id: int | None = None,
    ) -> list[OrderSummary]:
        stmt = select(OrderORM).options(
            selectinload(OrderORM.customer),
            selectinload(OrderORM.items),
        )
        if customer_id is not None:
            stmt = stmt.where(OrderORM.customer_id == customer_id)
        stmt = stmt.order_by(OrderORM.created_at.desc())
        res = await db.execute(stmt)
        return [
            OrderSummary(
                id=o.id,
                order_number=o.order_number,
                customer_id=o.customer_id,
                customer_name=o.customer.name if o.customer else "Unknown",
                status=o.status,
                total_amount=o.total_amount,
                item_count=len(o.items),
                created_at=o.created_at.isoformat(),
            )
            for o in res.scalars().all()
        ]

    @staticmethod
    async def get_order(db: AsyncSession, order_id: int) -> OrderDetail:
        stmt = (
            select(OrderORM)
            .options(
                selectinload(OrderORM.customer),
                selectinload(OrderORM.items).joinedload(OrderItemORM.product),
            )
            .where(OrderORM.id == order_id)
        )
        res = await db.execute(stmt)
        order = res.scalars().first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        items_detail = [
            OrderItemDetail(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else "N/A",
                product_sku=item.product.sku if item.product else "N/A",
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            for item in order.items
        ]

        return OrderDetail(
            id=order.id,
            order_number=order.order_number,
            customer_id=order.customer_id,
            customer_name=order.customer.name if order.customer else "Unknown",
            customer_email=order.customer.email if order.customer else "N/A",
            status=order.status,
            total_amount=order.total_amount,
            notes=order.notes,
            created_at=order.created_at.isoformat(),
            items=items_detail,
        )

    @staticmethod
    async def place_order(
        db: AsyncSession,
        payload: CreateOrderInput,
    ) -> OrderSummary:
        cust_res = await db.execute(
            select(CustomerORM).where(CustomerORM.id == payload.customer_id)
        )
        customer = cust_res.scalars().first()
        if not customer:
            raise HTTPException(status_code=400, detail="Customer not found")

        total_amount = 0.0
        items_to_create = []

        for item_in in payload.items:
            prod_res = await db.execute(
                select(ProductORM).where(ProductORM.id == item_in.product_id)
            )
            prod = prod_res.scalars().first()
            if not prod or not prod.is_active:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product {item_in.product_id} is unavailable",
                )
            if prod.stock_quantity < item_in.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{prod.name}'",
                )

            prod.stock_quantity -= item_in.quantity
            line_subtotal = round(prod.price * item_in.quantity, 2)
            total_amount += line_subtotal

            items_to_create.append(
                OrderItemORM(
                    product_id=prod.id,
                    quantity=item_in.quantity,
                    unit_price=prod.price,
                    subtotal=line_subtotal,
                )
            )

        new_order = OrderORM(
            customer_id=customer.id,
            order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
            status="pending",
            total_amount=round(total_amount, 2),
            notes=payload.notes,
            items=items_to_create,
        )
        db.add(new_order)
        await db.commit()
        await db.refresh(new_order)

        return OrderSummary(
            id=new_order.id,
            order_number=new_order.order_number,
            customer_id=customer.id,
            customer_name=customer.name,
            status=new_order.status,
            total_amount=new_order.total_amount,
            item_count=len(items_to_create),
            created_at=new_order.created_at.isoformat(),
        )

    @staticmethod
    async def update_order_status(
        db: AsyncSession,
        order_id: int,
        payload: UpdateOrderStatusInput,
    ) -> OrderSummary:
        stmt = (
            select(OrderORM)
            .options(selectinload(OrderORM.customer), selectinload(OrderORM.items))
            .where(OrderORM.id == order_id)
        )
        res = await db.execute(stmt)
        order = res.scalars().first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order.status = payload.status
        await db.commit()
        await db.refresh(order)

        return OrderSummary(
            id=order.id,
            order_number=order.order_number,
            customer_id=order.customer_id,
            customer_name=order.customer.name if order.customer else "Unknown",
            status=order.status,
            total_amount=order.total_amount,
            item_count=len(order.items),
            created_at=order.created_at.isoformat(),
        )
