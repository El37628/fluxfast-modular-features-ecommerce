from pydantic import BaseModel, Field


class CategoryItem(BaseModel):
    id: int
    slug: str
    name: str
    description: str | None = None
    product_count: int = 0


class ProductListItem(BaseModel):
    id: int
    sku: str
    name: str
    category_id: int
    category_name: str
    price: float
    stock_quantity: int
    is_active: bool


class ProductDetail(BaseModel):
    id: int
    sku: str
    name: str
    category_id: int
    category_name: str
    price: float
    stock_quantity: int
    is_active: bool
    created_at: str


class CreateProductInput(BaseModel):
    sku: str = Field(min_length=3, max_length=64)
    name: str = Field(min_length=2, max_length=150)
    category_id: int = Field(gt=0)
    price: float = Field(gt=0.0)
    stock_quantity: int = Field(ge=0, default=0)


class UpdateStockInput(BaseModel):
    stock_quantity: int = Field(ge=0)
    change_reason: str = Field(min_length=3, max_length=100, default="inventory adjustment")
