from django.urls import path
from .views import (
    user_login, user_signup, user_logout, dashboard,
    GeneralJournalAPI, TransactionAPI, TransactionLineAPI, AccountAPI,
)

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('login/', user_login, name='login'),
    path('signup/', user_signup, name='signup'),
    path('logout/', user_logout, name='logout'),
]
