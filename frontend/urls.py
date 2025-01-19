from django.urls import path
from .views import index

urlpatterns = [
    path('', index, name='index'),
    path('login', index, name='login'),
    path('signup', index, name='signup'),
    path('journal', index, name='journal'),
    path('journal/<str:journal_id>', index, name='journal_details'),
    path('journal/<str:journal_id>/update', index, name='journal_update'),
    
    path('account', index, name='account'),
    path('account/<str:account_id>', index, name='account_details'),
    path('account/<str:account_id>/update', index, name='account_update'),
    path('account/create', index, name='account_create'),
    
    path('transaction/<str:journal_id>', index, name='transaction'),
    path('transaction/<str:journal_id>/create', index, name='transaction_create'),
    path('transaction/<str:transaction_id>/update', index, name='account_update'),
    
    path('transaction-line/<str:transaction_id>/create', index, name='trasnaction-line_create'),
    path('transaction-line/<str:transaction_id>/update', index, name='transaction-line_update'),
]