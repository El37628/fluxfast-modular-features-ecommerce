from pydantic import BaseModel, Field


class OrderItemInput(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class CreateOrderInput(BaseModel):
    customer_id: int = Field(gt=0)
    items: list[OrderItemInput] = Field(min_length=1)
    notes: str | None = Field(default=None, max_length=255)


class UpdateOrderStatusInput(BaseModel):
    status: str = Field(pattern="^(pending|processing|completed|cancelled)$")


class OrderItemDetail(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    quantity: int
    unit_price: float
    subtotal: float


class OrderSummary(BaseModel):
    id: int
    order_number: str
    customer_id: int
    customer_name: str
    status: str
    total_amount: float
    item_count: int
    created_at: str


class OrderDetail(BaseModel):
    id: int
    order_number: str
    customer_id: int
    customer_name: str
    customer_email: str
    status: str
    total_amount: float
    notes: str | None
    created_at: str
    items: list[OrderItemDetail]
