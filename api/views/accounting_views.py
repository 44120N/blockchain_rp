from django.shortcuts import render, redirect, get_object_or_404
from ..forms import GeneralJournalForm, TransactionForm, TransactionLineForm, AccountForm
from ..models import GeneralJournal, Transaction, TransactionLine, Account

# Create your views here.

# Create General Journal
def create_general_journal(request):
    if request.method == 'POST':
        form = GeneralJournalForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('general_journal_list')
    else:
        form = GeneralJournalForm()
    return render(request, 'create_general_journal.html', {'form': form})

# Read General Journal List
def general_journal_list(request):
    journals = GeneralJournal.objects.all()
    return render(request, 'general_journal_list.html', {'journals': journals})

# Update General Journal
def update_general_journal(request, pk):
    journal = get_object_or_404(GeneralJournal, pk=pk)
    if request.method == 'POST':
        form = GeneralJournalForm(request.POST, instance=journal)
        if form.is_valid():
            form.save()
            return redirect('journal_list')
    else:
        form = GeneralJournalForm(instance=journal)
    return render(request, 'update_general_journal.html', {'form': form})

# Delete General Journal
def delete_general_journal(request, pk):
    journal = get_object_or_404(GeneralJournal, pk=pk)
    if request.method == 'POST':
        journal.delete()
        return redirect('journal_list')
    return redirect('journal_list')

# Create Transaction
def create_transaction(request, general_journal_id):
    general_journal = get_object_or_404(GeneralJournal, pk=general_journal_id)
    
    if request.method == 'POST':
        form = TransactionForm(request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.journal = general_journal
            transaction.save()
            return redirect('transaction_list', general_journal_id=general_journal.id)
    else:
        form = TransactionForm()
    
    return render(request, 'create_transaction.html', {'form': form, 'general_journal': general_journal})

# Read Transaction List
def transaction_list(request, general_journal_id):
    general_journal = get_object_or_404(GeneralJournal, pk=general_journal_id)
    transactions = Transaction.objects.filter(journal=general_journal)
    return render(request, 'transaction_list.html', {
        'transactions': transactions,
        'general_journal': general_journal
    })

# Update Transaction
def update_transaction(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk)
    if request.method == 'POST':
        form = TransactionForm(request.POST, instance=transaction)
        if form.is_valid():
            form.save()
            return redirect('transaction_list')
    else:
        form = TransactionForm(instance=transaction)
    return render(request, 'update_transaction.html', {'form': form, 'pk': pk})

# Delete Transaction
def delete_transaction(request, pk):
    transaction = get_object_or_404(Transaction, pk=pk)
    if request.method == 'POST':
        transaction.delete()
        return redirect('transaction_list')
    return redirect('transaction_list')

# Create Transaction Line
def create_transaction_line(request, transaction_id):
    transaction = get_object_or_404(Transaction, pk=transaction_id)
    if request.method == 'POST':
        form = TransactionLineForm(request.POST)
        if form.is_valid():
            transaction_line = form.save(commit=False)
            transaction_line.transaction = transaction
            transaction_line.save()
            return redirect('transaction_line_list', transaction_id=transaction_id)
    else:
        form = TransactionLineForm()
    return render(request, 'create_transaction_line.html', {'form': form})


# Read Transaction Line List
def transaction_line_list(request, transaction_id):
    transaction = get_object_or_404(Transaction, pk=transaction_id)
    transaction_lines = TransactionLine.objects.filter(transaction=transaction)
    return render(request, 'transaction_line_list.html', {
        'transaction_lines': transaction_lines,
        'transaction': transaction
    })

# Update Transaction Line
def update_transaction_line(request, pk):
    transaction_line = get_object_or_404(TransactionLine, pk=pk)
    if request.method == 'POST':
        form = TransactionLineForm(request.POST, instance=transaction_line)
        if form.is_valid():
            form.save()
            return redirect('transaction_line_list', transaction_id=transaction_line.transaction.id)
    else:
        form = TransactionLineForm(instance=transaction_line)
    return render(request, 'update_transaction_line.html', {'form': form, 'pk': pk})

# Delete Transaction Line
def delete_transaction_line(request, pk):
    transaction_line = get_object_or_404(TransactionLine, pk=pk)
    if request.method == 'POST':
        transaction_line.delete()
        return redirect('transaction_line_list')
    return redirect('transaction_line_list')

# Create Account
def create_account(request):
    if request.method == 'POST':
        form = AccountForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('account_list')
    else:
        form = AccountForm()
    return render(request, 'create_account.html', {'form': form})

# Read Account List
def account_list(request):
    accounts = Account.objects.all()
    return render(request, 'account_list.html', {'accounts': accounts})

# Update Account
def update_account(request, pk):
    account = get_object_or_404(Account, pk=pk)
    if request.method == 'POST':
        form = AccountForm(request.POST, instance=account)
        if form.is_valid():
            form.save()
            return redirect('account_list')
    else:
        form = AccountForm(instance=account)
    return render(request, 'update_account.html', {'form': form})

# Delete Account
def delete_account(request, pk):
    account = get_object_or_404(Account, pk=pk)
    if request.method == 'POST':
        account.delete()
        return redirect('account_list')
    return redirect('account_list')
