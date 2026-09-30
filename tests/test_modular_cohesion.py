from fluxfast import FluxRouter

from modules.catalog import catalog_router
from modules.dashboard import dashboard_router
from modules.orders import orders_router


def test_modules_export_independent_flux_routers():
    """Verify that each feature module owns and exports its own FluxRouter."""
    assert isinstance(catalog_router, FluxRouter)
    assert isinstance(orders_router, FluxRouter)
    assert isinstance(dashboard_router, FluxRouter)

    assert catalog_router.prefix == "/products"
    assert orders_router.prefix == "/orders"
    assert dashboard_router.prefix == ""


def test_routes_registered_on_each_router():
    """Verify that pages and mutations are registered directly on their respective module routers."""
    catalog_routes = [r.path for r in catalog_router.routes]
    assert "/products" in catalog_routes
    assert "/products/{product_id}" in catalog_routes

    order_routes = [r.path for r in orders_router.routes]
    assert "/orders" in order_routes
    assert "/orders/{order_id}" in order_routes
