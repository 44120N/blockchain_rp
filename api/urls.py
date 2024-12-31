from django.urls import path
from .views import *

urlpatterns = [
    path('block-headers/', BlockHeaderAPI.as_view(), name='block-header'),
    path('block-headers/<str:block_hash>/', BlockHeaderAPI.as_view(), name='block-header-detail'),
]
