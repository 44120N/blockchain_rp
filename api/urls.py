from django.urls import path
from .views import (
    UserSignupAPI, UserLoginAPI, UserLogoutAPI,
    GeneralJournalAPI, TransactionAPI, TransactionLineAPI, AccountAPI,
)

urlpatterns = [
    path('signup/', UserSignupAPI.as_view(), name='signup'),
    path('login/', UserLoginAPI.as_view(), name='login'),
    path('logout/', UserLogoutAPI.as_view(), name='logout'),
    path('journal/', GeneralJournalAPI.as_view(), name='general-journal_api'),
    path('transaction/', TransactionAPI.as_view(), name='transaction_api'),
]
