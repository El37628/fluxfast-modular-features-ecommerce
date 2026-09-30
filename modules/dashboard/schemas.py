from pydantic import BaseModel

from modules.catalog.schemas import ProductListItem
from modules.orders.schemas import OrderSummary


class DashboardSummary(BaseModel):
    total_revenue: float
    total_orders: int
    low_stock_count: int
    total_products: int
    pending_orders_count: int
    recent_orders: list[OrderSummary]
    top_products: list[ProductListItem]
