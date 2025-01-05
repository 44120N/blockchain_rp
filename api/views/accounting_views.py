from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..forms import GeneralJournalForm, TransactionForm, TransactionLineForm, AccountForm
from ..models import GeneralJournal, Transaction, TransactionLine, Account
from ..serializers import (
    GeneralJournalSerializer, TransactionSerializer, TransactionLineSerializer, AccountSerializer,
    GeneralJournalFormSerializer, TransactionFormSerializer, TransactionLineFormSerializer
)

# Create your views here.

class GeneralJournalAPI(APIView):
    lookup_url_kwarg = 'id'
    
    def get_serializer_class(self, method):
        if method in ['POST', 'PUT']:
            return GeneralJournalFormSerializer
        return GeneralJournalSerializer

    def get(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            data = self.get_serializer_class('GET')(journal).data
            return Response(data, status=status.HTTP_200_OK)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        serializer = self.get_serializer_class('POST')(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        journal_id = request.data.get(self.lookup_url_kwarg)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            serializer = self.get_serializer_class('PUT')(journal, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            journal.delete()
            return Response({"message": "General Journal deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

class TransactionAPI(APIView):
    lookup_url_kwarg = 'id'
    
    def get_serializer_class(self, method):
        if method in ['POST', 'PUT']:
            return TransactionFormSerializer
        return TransactionSerializer

    def get(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            data = self.get_serializer_class('GET')(transaction).data
            return Response(data, status=status.HTTP_200_OK)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        serializer = self.get_serializer_class('POST')(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        transaction_id = request.data.get(self.lookup_url_kwarg)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            serializer = self.get_serializer_class('PUT')(transaction, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            transaction.delete()
            return Response({"message": "Transaction deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

class TransactionLineAPI(APIView):
    lookup_url_kwarg = 'id'
    
    def get_serializer_class(self, method):
        if method in ['POST', 'PUT']:
            return TransactionLineFormSerializer
        return TransactionLineSerializer
    
    def get(self, request, format=None):
        line_id = request.GET.get(self.lookup_url_kwarg)
        if line_id:
            line = get_object_or_404(TransactionLine, id=line_id)
            data = self.get_serializer_class('GET')(line).data
            return Response(data, status=status.HTTP_200_OK)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        serializer = self.get_serializer_class('POST')(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        line_id = request.data.get(self.lookup_url_kwarg)
        if line_id:
            line = get_object_or_404(TransactionLine, id=line_id)
            serializer = self.get_serializer_class('PUT')(line, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        line_id = request.GET.get(self.lookup_url_kwarg)
        if line_id:
            line = get_object_or_404(TransactionLine, id=line_id)
            line.delete()
            return Response({"message": "Transaction Line deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

class AccountAPI(APIView):
    serializer_class = AccountSerializer
    lookup_url_kwarg = 'id'

    def get(self, request, format=None):
        account_id = request.GET.get(self.lookup_url_kwarg)
        if account_id:
            account = get_object_or_404(Account, id=account_id)
            data = self.serializer_class(account).data
            return Response(data, status=status.HTTP_200_OK)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        account_id = request.data.get(self.lookup_url_kwarg)
        if account_id:
            account = get_object_or_404(Account, id=account_id)
            serializer = self.serializer_class(account, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        account_id = request.GET.get(self.lookup_url_kwarg)
        if account_id:
            account = get_object_or_404(Account, id=account_id)
            account.delete()
            return Response({"message": "Account deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)