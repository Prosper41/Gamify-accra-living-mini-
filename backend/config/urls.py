
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication endpoints
    path("api/auth/", include("accounts.urls")),

    # Game endpoints
    path("api/players/", include("players.urls")),
    path("api/jobs/", include("jobs.urls")),
    path("api/shops/", include("shops.urls")),
]
