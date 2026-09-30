from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.catalog.models import ProductORM
from modules.catalog.schemas import ProductListItem
from modules.orders.models import OrderORM
from modules.orders.schemas import OrderSummary

from .schemas import DashboardSummary


class DashboardService:
    @staticmethod
    async def get_summary(db: AsyncSession) -> DashboardSummary:
        rev_res = await db.execute(
            select(func.coalesce(func.sum(OrderORM.total_amount), 0.0)).where(
                OrderORM.status != "cancelled"
            )
        )
        total_revenue = float(rev_res.scalar_one())

        orders_cnt_res = await db.execute(select(func.count(OrderORM.id)))
        total_orders = int(orders_cnt_res.scalar_one())

        pending_cnt_res = await db.execute(
            select(func.count(OrderORM.id)).where(OrderORM.status == "pending")
        )
        pending_orders = int(pending_cnt_res.scalar_one())

        low_stock_res = await db.execute(
            select(func.count(ProductORM.id)).where(ProductORM.stock_quantity < 10)
        )
        low_stock_count = int(low_stock_res.scalar_one())

        prod_cnt_res = await db.execute(select(func.count(ProductORM.id)))
        total_products = int(prod_cnt_res.scalar_one())

        recent_stmt = (
            select(OrderORM)
            .options(selectinload(OrderORM.customer), selectinload(OrderORM.items))
            .order_by(OrderORM.created_at.desc())
            .limit(5)
        )
        recent_res = await db.execute(recent_stmt)
        recent_orders = [
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
            for o in recent_res.scalars().all()
        ]

        top_stmt = (
            select(ProductORM)
            .options(selectinload(ProductORM.category))
            .order_by(ProductORM.stock_quantity.desc())
            .limit(5)
        )
        top_res = await db.execute(top_stmt)
        top_products = [
            ProductListItem(
                id=p.id,
                sku=p.sku,
                name=p.name,
                category_id=p.category_id,
                category_name=p.category.name if p.category else "Unassigned",
                price=p.price,
                stock_quantity=p.stock_quantity,
                is_active=p.is_active,
            )
            for p in top_res.scalars().all()
        ]

        return DashboardSummary(
            total_revenue=total_revenue,
            total_orders=total_orders,
            low_stock_count=low_stock_count,
            total_products=total_products,
            pending_orders_count=pending_orders,
            recent_orders=recent_orders,
            top_products=top_products,
        )
