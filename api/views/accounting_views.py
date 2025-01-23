from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import json

from django.shortcuts import get_object_or_404
from ..models import GeneralJournal, Transaction, TransactionLine, Account
from ..serializers import (
    GeneralJournalSerializer, TransactionSerializer, TransactionLineSerializer, AccountSerializer,
    GeneralJournalFormSerializer, TransactionFormSerializer, TransactionLineFormSerializer, AccountFormSerializer
)
from .blockchain_views import mine_block

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
            journal = get_object_or_404(GeneralJournal, id=journal_id, is_deleted=False)
            serializer = self.get_serializer_class('GET')(journal)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            journals = GeneralJournal.objects.filter(is_deleted=False).all()
            serializer = self.get_serializer_class('GET')(journals, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, format=None):
        serializer = self.get_serializer_class('POST')(data=request.data)
        if serializer.is_valid():
            if GeneralJournal.objects.filter(
                company=serializer.validated_data.get('company'),
                period=serializer.validated_data.get('period'),
                is_deleted=False
            ).exists():
                return Response({"status": "General Journal with the same credentials has been created"}, status=status.HTTP_400_BAD_REQUEST)
            journal = serializer.save()
            
            blockchain = request.user.chain_user.blockchain
            if not blockchain:
                return Response({"error": "No blockchain associated with this user. Please create a blockchain first."}, status=400)

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
                    is_deleted=False
                ).exclude(id=journal_id).exists():
                    return Response({"status": "General Journal with the same credentials has been created"}, status=status.HTTP_400_BAD_REQUEST)
                
                journal = serializer.save()
                blockchain = request.user.chain_user.blockchain
                if not blockchain:
                    return Response({"error": "No blockchain associated with this user. Please create a blockchain first."}, status=400)
                try:
                    mine_block(blockchain, journal)
                except ValueError as e:
                    return Response({"error": f"Failed to mine block: {str(e)}"}, status=400)
                
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
                    is_deleted=False
                ).exclude(id=journal_id).exists():
                    return Response({"status": "General Journal with the same credentials has been created"}, status=status.HTTP_400_BAD_REQUEST)
                
                journal = serializer.save()
                blockchain = request.user.chain_user.blockchain
                if not blockchain:
                    return Response({"error": "No blockchain associated with this user. Please create a blockchain first."}, status=400)
                try:
                    mine_block(blockchain, journal)
                except ValueError as e:
                    return Response({"error": f"Failed to mine block: {str(e)}"}, status=400)
                
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            journal.is_deleted = True
            journal.save()

            blockchain = request.user.chain_user.blockchain
            if not blockchain:
                return Response({"error": "No blockchain associated with this user. Please create a blockchain first."}, status=400)
            try:
                mine_block(blockchain, journal)
            except ValueError as e:
                return Response({"error": f"Failed to mine block: {str(e)}"}, status=400)
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
        elif transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            serializer = self.get_serializer_class('GET')(transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            transaction = Transaction.objects.all()
            serializer = self.get_serializer_class('GET')(transaction, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, format=None):
        journal_id = request.GET.get(self.lookup_url_kwarg_journal)
        if journal_id:
            journal = get_object_or_404(GeneralJournal, id=journal_id)
            if journal:
                data = request.data.copy()
                data['journal'] = journal_id
                
                serializer = self.get_serializer_class('POST')(data=data)
                if serializer.is_valid():
                    transaction = serializer.save()
                    
                    blockchain = request.user.chain_user.blockchain
                    if not blockchain:
                        return Response({"error": "No blockchain associated with this General Journal."}, status=400)
                    
                    try:
                        mine_block(blockchain, journal)
                    except ValueError as e:
                        return Response({"error": f"Failed to mine block: {str(e)}"}, status=400)
                    
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "Transaction not found"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Journal id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            journal = transaction.journal
            serializer = self.get_serializer_class('PUT')(transaction, data=request.data)
            if serializer.is_valid():
                transaction = serializer.save()
                
                blockchain = request.user.chain_user.blockchain
                if not blockchain:
                    return Response({"error": "No blockchain associated with this General Journal."}, status=400)
                
                try:
                    mine_block(blockchain, journal)
                except ValueError as e:
                    return Response({"error": f"Failed to mine block: {str(e)}"}, status=400)
                    
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            journal = transaction.journal

            serializer = self.get_serializer_class('PATCH')(transaction, data=request.data, partial=True)
            if serializer.is_valid():
                transaction = serializer.save()
                
                blockchain = request.user.chain_user.blockchain
                if not blockchain:
                        return Response({"error": "No blockchain associated with this General Journal."}, status=400)
                
                try:
                    mine_block(blockchain, journal)
                except ValueError as e:
                    return Response({"error": f"Failed to mine block: {str(e)}"}, status=400)
                
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        if transaction_id:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            journal = transaction.journal
            transaction.delete()
            
            blockchain = request.user.chain_user.blockchain
            if not blockchain:
                return Response({"error": "No blockchain associated with this General Journal."}, status=400)
            
            try:
                mine_block(blockchain, journal)
            except ValueError as e:
                return Response({"error": f"Failed to mine block: {str(e)}"}, status=400)
            
            return Response({"message": "Transaction deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

class TransactionLineAPI(APIView):
    lookup_url_kwarg_transaction = 'transaction_id'
    lookup_url_kwarg_line = 'transaction-line_id'
    
    def get_serializer_class(self, method):
        if method in ['POST', 'PUT', 'PATCH']:
            return TransactionLineFormSerializer
        return TransactionLineSerializer
    
    def get(self, request, format=None):
        line_id = request.GET.get(self.lookup_url_kwarg_line)
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        if line_id:
            line = get_object_or_404(TransactionLine, id=line_id)
            serializer = self.get_serializer_class('GET')(line)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif transaction_id:
            lines = get_object_or_404(TransactionLine, transaction=transaction_id)
            serializer = self.get_serializer_class('GET')(lines, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            lines = TransactionLine.objects.all()
            serializer = self.get_serializer_class('GET')(lines, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, format=None):
        transaction_id = request.GET.get(self.lookup_url_kwarg_transaction)
        if transaction_id:
            transaction = Transaction.objects.filter(id=transaction_id)
            if transaction.exists():
                data = request.data.copy()
                data['transaction'] = transaction_id
                
                serializer = self.get_serializer_class('POST')(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "transaction does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "transaction parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        line_id = request.data.get(self.lookup_url_kwarg_line)
        if line_id:
            line = get_object_or_404(TransactionLine, id=line_id)
            serializer = self.get_serializer_class('PUT')(line, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        line_id = request.GET.get(self.lookup_url_kwarg_line)
        if line_id:
            line = get_object_or_404(TransactionLine, id=line_id)
            line.delete()
            return Response({"message": "Transaction Line deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

class AccountAPI(APIView):
    serializer_class = AccountSerializer
    lookup_url_kwarg = 'id'
    
    def get_serializer_class(self, method):
        if method in ['POST', 'PUT', 'PATCH']:
            return AccountFormSerializer
        return AccountSerializer

    def get(self, request, format=None):
        account_id = request.GET.get(self.lookup_url_kwarg)
        if account_id:
            account = get_object_or_404(Account, id=account_id)
            serializer = self.get_serializer_class('GET')(account)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            account = Account.objects.all()
            serializer = self.get_serializer_class('GET')(account, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        serializer = self.get_serializer_class('POST')(data=request.data)
        if serializer.is_valid():
            if Account.objects.filter(
                ref=serializer.validated_data.get('ref'),
            ).exists():
                return Response({"status": "Account with the same refference has been created"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        account_id = request.GET.get(self.lookup_url_kwarg)
        if account_id:
            account = get_object_or_404(Account, id=account_id)
            serializer = self.get_serializer_class('PUT')(account, data=request.data)
            if serializer.is_valid():
                if Account.objects.filter(
                    ref=serializer.validated_data.get('ref'),
                ).exists():
                    return Response({"status": "Account with the same refference has been created"}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, format=None):
        account_id = request.GET.get(self.lookup_url_kwarg)
        if account_id:
            account = get_object_or_404(Account, id=account_id)
            serializer = self.get_serializer_class('PATCH')(account, data=request.data, partial=True)
            if serializer.is_valid():
                if Account.objects.filter(
                    ref=serializer.validated_data.get('ref'),
                ).exists():
                    return Response({"status": "Account with the same refference has been created"}, status=status.HTTP_400_BAD_REQUEST)
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