from django.urls import path
from .views import index

urlpatterns = [
    path('', index, name='index'),
    path('login', index, name='login'),
    path('signup', index, name='signup'),
    path('journal', index, name='journal'),
    path('account', index, name='account'),
    path('transaction', index, name='transaction'),
    path('transaction/<str:address>', index),
    path('transaction/<str:address>/<str:method>', index),
]