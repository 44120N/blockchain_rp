from django.urls import path
from .views import (
    user_login, user_signup, user_logout, dashboard,
    
    create_general_journal,
    create_transaction,
    create_transaction_line,
    create_account,
    
    general_journal_list,
    transaction_list,
    transaction_line_list,
    account_list,
    
    delete_general_journal,
    delete_transaction,
    delete_transaction_line,
    delete_account,
    
    update_general_journal,
    update_transaction,
    update_transaction_line,
    update_account,
)

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('login/', user_login, name='login'),
    path('signup/', user_signup, name='signup'),
    path('logout/', user_logout, name='logout'),
    
    # GeneralJournal URLs
    path('general-journal/', general_journal_list, name='general_journal_list'),
    path('general-journal/create/', create_general_journal, name='create_general_journal'),
    path('general-journal/<str:pk>/update/', update_general_journal, name='update_general_journal'),
    path('general-journal/<str:pk>/delete/', delete_general_journal, name='delete_general_journal'),

    # Transaction URLs
    path('transaction/<str:general_journal_id>/', transaction_list, name='transaction_list'),
    path('transaction/<str:general_journal_id>/create/', create_transaction, name='create_transaction'),
    path('transaction/<str:pk>/update/', update_transaction, name='update_transaction'),
    path('transaction/<str:pk>/delete/', delete_transaction, name='delete_transaction'),

    # TransactionLine URLs
    path('transaction-line/<str:transaction_id>/', transaction_line_list, name='transaction_line_list'),
    path('transaction-line/<str:transaction_id>/create/', create_transaction_line, name='create_transaction_line'),
    path('transaction-line/<str:pk>/update/', update_transaction_line, name='update_transaction_line'),
    path('transaction-line/<str:pk>/delete/', delete_transaction_line, name='delete_transaction_line'),

    # Account URLs
    path('account/', account_list, name='account_list'),
    path('account/create/', create_account, name='create_account'),
    path('account/<str:pk>/update/', update_account, name='update_account'),
    path('account/<str:pk>/delete/', delete_account, name='delete_account'),
]
