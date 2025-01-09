from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import json

from django.shortcuts import get_object_or_404
from ..forms import GeneralJournalForm, TransactionForm, TransactionLineForm, AccountForm
from ..models import GeneralJournal, Transaction, TransactionLine, Account
from ..serializers import (
    GeneralJournalSerializer, TransactionSerializer, TransactionLineSerializer, AccountSerializer,
    GeneralJournalFormSerializer, TransactionFormSerializer, TransactionLineFormSerializer
)

# Create your views here.

class GeneralJournalAPI(APIView):
    parser_classes = [MultiPartParser]
    lookup_url_kwarg = 'id'
    
    def get_serializer_class(self, method):
        if method in ['POST', 'PUT', 'PATCH']:
            return GeneralJournalFormSerializer
        return GeneralJournalSerializer
    
    def get(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            serializer = self.get_serializer_class('GET')(journal)
            
            # data = {
            #     'company': serializer.data['company'],
            #     'period': serializer.data['period'],
            #     'transactions': serializer.data['transactions'],
            # }
            # print(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            journals = GeneralJournal.objects.all()
            serializer = self.get_serializer_class('GET')(journals, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, format=None):
        # It needs blockchain_id to create the journal
        # blockchain_id = request.GET.get(self.lookup_url_kwarg)
        # blockchain = get_object_or_404(Blockchain, id =blockchain_id)
        serializer = self.get_serializer_class('POST')(data=request.data)
        if serializer.is_valid():
            if GeneralJournal.objects.filter(
                company=serializer.validated_data.get('company'),
                period=serializer.validated_data.get('period'),
            ).exists():
                return Response({"status": "General Journal with the same credentials has been created"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            serializer = self.get_serializer_class('PUT')(journal, data=request.data)
            if serializer.is_valid():
                if GeneralJournal.objects.filter(
                    company=serializer.validated_data.get('company'),
                    period=serializer.validated_data.get('period'),
                    balance=serializer.validated_data.get('balance'),
                ).exclude(id=journal_id).exists():
                    return Response({"status": "General Journal with the same credentials has been created"}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            serializer = self.get_serializer_class('PATCH')(journal, data=request.data, partial=True)
            if serializer.is_valid():
                if GeneralJournal.objects.filter(
                    company=serializer.validated_data.get('company'),
                    period=serializer.validated_data.get('period'),
                ).exclude(id=journal_id).exists():
                    return Response({"status": "General Journal with the same credentials has been created"}, status=status.HTTP_400_BAD_REQUEST)
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
    parser_classes = [MultiPartParser]
    lookup_url_kwarg_journal = 'journal_id'
    lookup_url_kwarg_transaction = 'transaction_id'
    
    def get_serializer_class(self, method):
        if method in ['POST', 'PUT', 'PATCH']:
            return TransactionFormSerializer
        return TransactionSerializer

    def get(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg_journal)
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        
        if journal_id:
            transaction = get_object_or_404(Transaction, journal=journal_id)
            serializer = self.get_serializer_class('GET')(transaction, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            serializer = self.get_serializer_class('GET')(transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        transaction = Transaction.objects.all()
        serializer = self.get_serializer_class('GET')(transaction, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg_journal)
        if journal_id:
            journal = GeneralJournal.objects.filter(id=journal_id)
            if journal.exists():
                data = request.data.copy()
                data['journal'] = journal_id
                
                serializer = self.get_serializer_class('POST')(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "Transaction not found"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Transaction id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            serializer = self.get_serializer_class('PUT')(transaction, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            serializer = self.get_serializer_class('PATCH')(transaction, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
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