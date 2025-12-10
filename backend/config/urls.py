from claims.api import ClaimViewSet
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from machines.api import MachineViewSet, PublicMachineSearchView
from maintenance.api import MaintenanceViewSet
from references.api import ReferenceItemViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.api import CurrentUserView

router = DefaultRouter()
router.register(r"machines", MachineViewSet, basename="machine")
router.register(r"maintenance", MaintenanceViewSet, basename="maintenance")
router.register(r"claims", ClaimViewSet, basename="claim")
router.register(r"references", ReferenceItemViewSet, basename="reference")

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # allauth
    path("accounts/", include("allauth.urls")),

    # текущий пользователь
    path("api/me/", CurrentUserView.as_view(), name="current-user"),

    # публичный поиск
    path(
        "api/public/machines/search/",
        PublicMachineSearchView.as_view(),
        name="public-machine-search",
    ),

    # основной REST API
    path("api/", include(router.urls)),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),

    # Swagger UI
    path(
        "api/schema/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),

    # Redoc
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]
