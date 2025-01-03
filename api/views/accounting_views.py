from rest_framework import viewsets
from ..models import GeneralJournal, Transaction, TransactionLine, Account
from ..serializers import GeneralJournalSerializer, TransactionSerializer, TransactionLineSerializer, AccountSerializer

# Create your views here.
class GeneralJournalViewSet(viewsets.ModelViewSet):
    queryset = GeneralJournal.objects.all()
    serializer_class = GeneralJournalSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

class TransactionLineViewSet(viewsets.ModelViewSet):
    queryset = TransactionLine.objects.all()
    serializer_class = TransactionLineSerializer

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
