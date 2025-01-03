from django.urls import path
from .views import user_login, user_signup, user_logout, dashboard, GeneralJournalViewSet, TransactionViewSet, TransactionLineViewSet, AccountViewSet

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('login/', user_login, name='login'),
    path('signup/', user_signup, name='signup'),
    path('logout/', user_logout, name='logout'),
    path('journal/', GeneralJournalViewSet.as_view(), name='journal'),
    path('transaction/', TransactionViewSet.as_view(), name='transaction'),
    path('transaction/line/', TransactionLineViewSet.as_view(), name='transaction_line'),
    path('account/', AccountViewSet.as_view(), name='account'),
]
