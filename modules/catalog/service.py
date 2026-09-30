from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import CategoryORM, ProductORM
from .schemas import (
    CategoryItem,
    CreateProductInput,
    ProductDetail,
    ProductListItem,
    UpdateStockInput,
)


class CatalogService:
    @staticmethod
    async def list_categories(db: AsyncSession) -> list[CategoryItem]:
        stmt = (
            select(
                CategoryORM.id,
                CategoryORM.slug,
                CategoryORM.name,
                CategoryORM.description,
                func.count(ProductORM.id).label("prod_cnt"),
            )
            .outerjoin(ProductORM, ProductORM.category_id == CategoryORM.id)
            .group_by(CategoryORM.id)
            .order_by(CategoryORM.name.asc())
        )
        res = await db.execute(stmt)
        return [
            CategoryItem(
                id=row[0],
                slug=row[1],
                name=row[2],
                description=row[3],
                product_count=row[4],
            )
            for row in res.all()
        ]

    @staticmethod
    async def list_products(
        db: AsyncSession,
        category_id: int | None = None,
        search: str | None = None,
    ) -> list[ProductListItem]:
        stmt = select(ProductORM).options(selectinload(ProductORM.category))
        if category_id is not None:
            stmt = stmt.where(ProductORM.category_id == category_id)
        if search:
            stmt = stmt.where(
                ProductORM.name.ilike(f"%{search}%") | ProductORM.sku.ilike(f"%{search}%")
            )
        stmt = stmt.order_by(ProductORM.name.asc())
        res = await db.execute(stmt)
        return [
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
            for p in res.scalars().all()
        ]

    @staticmethod
    async def get_product(db: AsyncSession, product_id: int) -> ProductDetail:
        stmt = (
            select(ProductORM)
            .options(selectinload(ProductORM.category))
            .where(ProductORM.id == product_id)
        )
        res = await db.execute(stmt)
        p = res.scalars().first()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductDetail(
            id=p.id,
            sku=p.sku,
            name=p.name,
            category_id=p.category_id,
            category_name=p.category.name if p.category else "Unassigned",
            price=p.price,
            stock_quantity=p.stock_quantity,
            is_active=p.is_active,
            created_at=p.created_at.isoformat(),
        )

    @staticmethod
    async def create_product(
        db: AsyncSession,
        payload: CreateProductInput,
    ) -> ProductListItem:
        cat_res = await db.execute(
            select(CategoryORM).where(CategoryORM.id == payload.category_id)
        )
        category = cat_res.scalars().first()
        if not category:
            raise HTTPException(status_code=400, detail="Category does not exist")

        sku_res = await db.execute(
            select(ProductORM).where(ProductORM.sku == payload.sku)
        )
        if sku_res.scalars().first():
            raise HTTPException(status_code=400, detail="Product SKU already exists")

        new_prod = ProductORM(
            sku=payload.sku,
            name=payload.name,
            category_id=payload.category_id,
            price=payload.price,
            stock_quantity=payload.stock_quantity,
            is_active=True,
        )
        db.add(new_prod)
        await db.commit()
        await db.refresh(new_prod)

        return ProductListItem(
            id=new_prod.id,
            sku=new_prod.sku,
            name=new_prod.name,
            category_id=new_prod.category_id,
            category_name=category.name,
            price=new_prod.price,
            stock_quantity=new_prod.stock_quantity,
            is_active=new_prod.is_active,
        )

    @staticmethod
    async def update_stock(
        db: AsyncSession,
        product_id: int,
        payload: UpdateStockInput,
    ) -> ProductListItem:
        stmt = (
            select(ProductORM)
            .options(selectinload(ProductORM.category))
            .where(ProductORM.id == product_id)
        )
        res = await db.execute(stmt)
        prod = res.scalars().first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")

        prod.stock_quantity = payload.stock_quantity
        await db.commit()
        await db.refresh(prod)

        return ProductListItem(
            id=prod.id,
            sku=prod.sku,
            name=prod.name,
            category_id=prod.category_id,
            category_name=prod.category.name if prod.category else "Unassigned",
            price=prod.price,
            stock_quantity=prod.stock_quantity,
            is_active=prod.is_active,
        )
