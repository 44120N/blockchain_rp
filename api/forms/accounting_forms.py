from django import forms
from ..models import GeneralJournal, Transaction, TransactionLine, Account

class GeneralJournalForm(forms.ModelForm):
    class Meta:
        model = GeneralJournal
        fields = ['company', 'period']
        widgets = {
            'period': forms.DateInput(attrs={'type': 'date'}),
        }

class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ['date', 'description']
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

class TransactionLineForm(forms.ModelForm):
    class Meta:
        model = TransactionLine
        fields = ['account', 'is_debit', 'value']

class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ['id', 'name', 'type']