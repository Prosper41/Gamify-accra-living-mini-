from django.urls import path
from .views import ShopItemListView, PurchaseItemView

urlpatterns = [
    path("items/", ShopItemListView.as_view()),
    path("purchase/", PurchaseItemView.as_view()),
]