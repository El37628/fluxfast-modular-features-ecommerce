from fastapi import Depends
from fluxfast import FluxRouter, Page, resource, scope
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db

from .service import DashboardService

router = FluxRouter(tags=["dashboard"])


@router.page("/", name="home_dashboard")
@router.page("/dashboard", name="dashboard")
async def show_dashboard_page(db: AsyncSession = Depends(get_db)) -> Page:
    return Page(
        component="dashboard/index",
        resources=[
            resource(
                "dashboard-summary",
                lambda: DashboardService.get_summary(db),
                scope=scope.public(),
                ttl=15,
            )
        ],
        meta={"title": "Executive Dashboard · Modular Store"},
    )
