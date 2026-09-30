import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_product_mutation(client: AsyncClient):
    payload = {
        "sku": "PROD-STAND",
        "name": "Aluminum Laptop Riser Stand",
        "category_id": 1,
        "price": 45.00,
        "stock_quantity": 50,
    }
    response = await client.post("/products", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["protocol"] == "fluxfast/1"
    patches = data["mutation"]["patches"]
    assert "product-catalog" in patches
    assert patches["product-catalog"][0]["op"] == "append-item"
    assert patches["product-catalog"][0]["value"]["sku"] == "PROD-STAND"


@pytest.mark.asyncio
async def test_update_product_stock_mutation(client: AsyncClient):
    payload = {
        "stock_quantity": 88,
        "change_reason": "Stock count adjustment",
    }
    response = await client.patch("/products/3/stock", json=payload)
    assert response.status_code == 200
    data = response.json()

    patches = data["mutation"]["patches"]
    assert "product-catalog" in patches
    assert patches["product-catalog"][0]["op"] == "replace-item"
    assert patches["product-catalog"][0]["value"]["stock_quantity"] == 88


@pytest.mark.asyncio
async def test_checkout_order_mutation(client: AsyncClient):
    payload = {
        "customer_id": 3,
        "items": [
            {"product_id": 2, "quantity": 1},
        ],
        "notes": "Urgent shipping",
    }
    response = await client.post("/orders", json=payload)
    assert response.status_code == 200
    data = response.json()

    patches = data["mutation"]["patches"]
    assert "customer-orders" in patches
    assert patches["customer-orders"][0]["op"] == "append-item"


@pytest.mark.asyncio
async def test_update_order_status_mutation(client: AsyncClient):
    payload = {"status": "completed"}
    response = await client.patch("/orders/1/status", json=payload)
    assert response.status_code == 200
    data = response.json()

    patches = data["mutation"]["patches"]
    assert "customer-orders" in patches
    assert patches["customer-orders"][0]["op"] == "replace-item"
