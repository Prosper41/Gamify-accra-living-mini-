from django.urls import path

from jobs.views.delivery_view import (
    ActiveDeliveryView,
    StartDeliveryView,
    CompleteDeliveryView,
)

urlpatterns = [
    path("delivery/active/", ActiveDeliveryView.as_view()),
    path("delivery/start/", StartDeliveryView.as_view()),
    path("delivery/complete/", CompleteDeliveryView.as_view()),
]