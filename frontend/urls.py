from django.urls import path
from .views import index

urlpatterns = [
    path('', index, name='index'),
    path('login', index, name='login'),
    path('signup', index, name='signup'),
    path('journal', index, name='journal'),
    path('journal/<str:address>', index, name='journal'),
    path('journal/<str:address>', index, name='journal'),
    path('journal/<str:address>/update', index, name='journal'),
    path('account', index, name='account'),
    path('transaction', index, name='transaction'),
    path('transaction/<str:address>', index),
    path('transaction/<str:address>/create', index),
    path('transaction/<str:address>/update', index),
]