from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from modules.catalog.models import CategoryORM, ProductORM
from modules.orders.models import CustomerORM, OrderItemORM, OrderORM


async def seed_modular_db(session: AsyncSession) -> None:
    res = await session.execute(select(CategoryORM).limit(1))
    if res.scalars().first() is not None:
        return

    cat_elec = CategoryORM(id=1, slug="electronics", name="Electronics", description="Consumer electronics, laptops, audio")
    cat_apparel = CategoryORM(id=2, slug="apparel", name="Apparel", description="Modern casual, athletic wear and apparel")
    cat_home = CategoryORM(id=3, slug="home-living", name="Home & Living", description="Home decor and ergonomic furniture")
    cat_books = CategoryORM(id=4, slug="books", name="Books", description="Technical and business books")
    session.add_all([cat_elec, cat_apparel, cat_home, cat_books])
    await session.flush()

    cust1 = CustomerORM(id=1, email="alice@example.com", name="Alice Johnson", tier="gold")
    cust2 = CustomerORM(id=2, email="bob@example.com", name="Bob Smith", tier="standard")
    cust3 = CustomerORM(id=3, email="carol@example.com", name="Carol Danvers", tier="platinum")
    session.add_all([cust1, cust2, cust3])
    await session.flush()

    p1 = ProductORM(id=1, category_id=1, sku="PROD-MBP", name="MacBook Pro M3 Max", price=2499.00, stock_quantity=14, is_active=True)
    p2 = ProductORM(id=2, category_id=1, sku="PROD-WCH", name="Wireless Noise-Canceling Headphones", price=299.99, stock_quantity=45, is_active=True)
    p3 = ProductORM(id=3, category_id=2, sku="PROD-TEE", name="Organic Cotton Minimalist T-Shirt", price=29.50, stock_quantity=120, is_active=True)
    p4 = ProductORM(id=4, category_id=2, sku="PROD-HDY", name="Merino Wool Technical Hoodie", price=89.00, stock_quantity=58, is_active=True)
    p5 = ProductORM(id=5, category_id=3, sku="PROD-DSK", name="Motorized Standing Desk 60x30", price=480.00, stock_quantity=7, is_active=True)
    p6 = ProductORM(id=6, category_id=3, sku="PROD-LMP", name="Architect LED Desk Task Lamp", price=65.00, stock_quantity=32, is_active=True)
    p7 = ProductORM(id=7, category_id=4, sku="PROD-DDIA", name="Designing Data-Intensive Applications", price=49.99, stock_quantity=85, is_active=True)
    session.add_all([p1, p2, p3, p4, p5, p6, p7])
    await session.flush()

    o1 = OrderORM(id=1, customer_id=1, order_number="ORD-2026-001", status="completed", total_amount=2798.99, notes="Express shipping requested")
    o2 = OrderORM(id=2, customer_id=2, order_number="ORD-2026-002", status="processing", total_amount=124.00, notes="Standard ground shipping")
    o3 = OrderORM(id=3, customer_id=3, order_number="ORD-2026-003", status="pending", total_amount=480.00, notes="Hold at front desk")
    session.add_all([o1, o2, o3])
    await session.flush()

    i1 = OrderItemORM(id=1, order_id=1, product_id=1, quantity=1, unit_price=2499.00, subtotal=2499.00)
    i2 = OrderItemORM(id=2, order_id=1, product_id=2, quantity=1, unit_price=299.99, subtotal=299.99)
    i3 = OrderItemORM(id=3, order_id=2, product_id=3, quantity=2, unit_price=29.50, subtotal=59.00)
    i4 = OrderItemORM(id=4, order_id=2, product_id=6, quantity=1, unit_price=65.00, subtotal=65.00)
    i5 = OrderItemORM(id=5, order_id=3, product_id=5, quantity=1, unit_price=480.00, subtotal=480.00)
    session.add_all([i1, i2, i3, i4, i5])
    await session.commit()
