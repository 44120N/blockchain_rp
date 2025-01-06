from django.urls import path
from .views import index

urlpatterns = [
    path('', index, name='index'),
    path('login', index, name='login'),
    path('signup', index, name='signup'),
    path('journal', index, name='journal'),
    path('journal/<str:journal_id>', index, name='journal'),
    path('journal/<str:journal_id>/update', index, name='journal'),
    path('account', index, name='account'),
    path('transaction', index, name='transaction'),
    path('transaction/<str:journal_id>', index),
    path('transaction/<str:journal_id>/create', index),
    path('transaction/<str:transaction_id>/update', index),
]