import uuid
from .utils import sha256, str_to_natural_byte_order, natural_byte_order_to_str
from django.db import models

# Models
ACCOUNT_TYPES = [
    ('asset', 'Asset'),
    ('liability', 'Liability'),
    ('equity', 'Equity'),
    ('revenue', 'Revenue'),
    ('expense', 'Expense'),
    ('', 'Undefined')
]

class Account(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, max_length=255)
    ref = models.CharField(max_length=10, default='', unique=True)
    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default="")
    
    def __str__(self):
        return f"{self.name}({self.id})"

class GeneralJournal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, max_length=255)
    company = models.CharField(max_length=255)
    period = models.DateField(verbose_name="Journal Period")
    balance = models.DecimalField(decimal_places=2, max_digits=100)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.id
    
    def save(self, *args, **kwargs):
        self.balance = sum(tx.total_debits() for tx in self.transactions.all())
        super(GeneralJournal, self).save(*args, **kwargs)

class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    # Date must be lower than journal.period
    date = models.DateTimeField(verbose_name="Transaction Date") 
    description = models.TextField(null=True, blank=True)
    journal = models.ForeignKey(
        GeneralJournal, on_delete=models.CASCADE, related_name="transactions"
    )
    txid = models.CharField(max_length=64, unique=True, blank=True, null=True)
    total = models.DecimalField(decimal_places=2, max_digits=100)
    
    def __str__(self):
        return f"Transaction #{self.id}: {self.description}"
    
    def total_debits(self):
        """Sum of all debit values for this transaction."""
        return sum(line.value for line in self.lines.filter(is_debit=True))
    
    def total_credits(self):
        """Sum of all credit values for this transaction."""
        return sum(line.value for line in self.lines.filter(is_debit=False))
    
    def is_balanced(self):
        """Check if the transaction is balanced."""
        return self.total_debits() == self.total_credits()
    
    def save(self, *args, **kwargs):
        if not self.is_balanced():
            raise ValueError("Transaction is not balanced: Debits and Credits do not match.")
        else:
            self.total = self.total_debits()
        if not self.txid:
            serialized_data = f"{self.date.isoformat()}-{self.description}-{self.journal.id}"
            self.txid = natural_byte_order_to_str(sha256(serialized_data.encode()))
        super(Transaction, self).save(*args, **kwargs)

class TransactionLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    transaction = models.ForeignKey(
        Transaction, on_delete=models.CASCADE, related_name="lines"
    )
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    is_debit = models.BooleanField()
    value = models.DecimalField(decimal_places=2, max_digits=100)
    
    def __str__(self):
        return f"{'Debit' if self.is_debit else 'Credit'}: {self.account.name} - {self.value}"
        
    def save(self, *args, **kwargs):
        super(TransactionLine, self).save(*args, **kwargs)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(value__gt=0),
                name="check_positive_transaction_value",
            )
        ]
