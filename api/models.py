from typing import *
import uuid, json, hashlib, struct
from datetime import datetime

from django.db import models
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder

DEFAULT_HASH = b'\x00'*32

def sha256(data: str | bytes) -> bytes:
    """Returns SHA-256 hash of the input."""
    if isinstance(data, str):
        return hashlib.sha256(data.encode()).digest()
    elif isinstance(data, bytes):
        return hashlib.sha256(data).digest()

def int_to_little_endian(value: int) -> bytes:
    """Convert an integer to little-endian format."""
    return struct.pack('<I', value)

def datetime_to_little_endian_bytes(dt: datetime=None) -> bytes:
    """Convert a datetime object to 4-byte little-endian format."""
    if dt is None:
        dt = datetime.now()
    unix_time = int(dt.timestamp())
    return struct.pack('<I', unix_time)

def little_endian_to_int(value: bytes) -> int:
    """Convert little-endian bytes to an integer."""
    return struct.unpack('<I', value)[0]

def little_endian_bytes_to_datetime(value: bytes) -> datetime:
    """Convert 4-byte little-endian bytes to a datetime object."""
    unix_time = struct.unpack('<I', value)[0]
    return datetime.fromtimestamp(unix_time)

def str_to_natural_byte_order(value: str) -> bytes:
    """Convert a string hash in hex format to natural (binary) byte order."""
    return bytes.fromhex(value)

def natural_byte_order_to_str(value: bytes) -> str:
    """Convert a 32-byte hash back to its hexadecimal string representation."""
    return value.hex()

# Accounting
ACCOUNT_TYPES = [
    ('asset', 'Asset'),
    ('liability', 'Liability'),
    ('equity', 'Equity'),
    ('revenue', 'Revenue'),
    ('expense', 'Expense'),
    ('undefined', 'Undefined'),
]

class Account(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default="undefined")
    
    def __str__(self):
        return f"{self.name} ({self.id})"

class GeneralJournal(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    company=models.CharField(max_length=255)
    period = models.DateField(verbose_name="Journal Period")
    total = models.FloatField(decimal_precision=2)
    
    def __str__(self):
        return self.id
    
    def save(self, *args, **kwargs):
        self.id=f"{self.company}: {self.period}"
        if self.transactions.is_balanced():
            self.total=self.transactions.total_debits()
        super(GeneralJournal, self).save(*args, **kwargs)

class Transaction(models.Model):
    id = models.BigAutoField(primary_key=True)
    date = models.DateTimeField(verbose_name="Transaction Date")
    description = models.CharField(max_length=255)
    journal = models.ForeignKey(
        GeneralJournal, on_delete=models.CASCADE, related_name="transactions"
    )
    
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
        super(Transaction, self).save(*args, **kwargs)

class TransactionLine(models.Model):
    transaction = models.ForeignKey(
        Transaction, on_delete=models.CASCADE, related_name="lines"
    )
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    is_debit = models.BooleanField()
    value = models.FloatField()
    
    def __str__(self):
        return f"{'Debit' if self.is_debit else 'Credit'}: {self.account.name} - {self.value}"
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(value__gt=0),
                name="check_positive_transaction_value",
            )
        ]

# Models
class BlockHeader(models.Model):
    timestamp = models.IntegerField(null=True)
    version = models.TextField(null=False, blank=False, default=natural_byte_order_to_str(int_to_little_endian(0x00000001)))
    bits = models.TextField(null=False, blank=False, default=natural_byte_order_to_str(int_to_little_endian(0x00000000)))
    nonce = models.TextField(null=False, blank=False, default=natural_byte_order_to_str(int_to_little_endian(0x00000000)))
    previous_hash = models.TextField(default=natural_byte_order_to_str(DEFAULT_HASH), null=False, blank=False)
    merkle_root = models.TextField(default=natural_byte_order_to_str(DEFAULT_HASH), null=False, blank=False)
    block_hash = models.TextField(primary_key=True, default=natural_byte_order_to_str(DEFAULT_HASH), null=False, blank=False)
    
    def __init__(self, *args, **kwargs):
        super(BlockHeader, self).__init__(*args, **kwargs)
        if not self.timestamp:
            self.timestamp = little_endian_to_int(datetime_to_little_endian_bytes(datetime.now()))
    
    def clean(self):
        if len(self.previous_hash) != 64:
            raise ValidationError("Invalid hash length for previous_hash.")
        if len(self.merkle_root) != 64:
            raise ValidationError("Invalid hash length for merkle_root.")

    def _header_data(self) -> bytes:
        if isinstance(self.version, int):
            self.version = natural_byte_order_to_str(int_to_little_endian(self.version))
        if isinstance(self.bits, int):
            self.bits = natural_byte_order_to_str(int_to_little_endian(self.bits))
        if isinstance(self.nonce, int):
            self.nonce = natural_byte_order_to_str(int_to_little_endian(self.nonce))
        
        if isinstance(self.previous_hash, str):
            self.previous_hash = natural_byte_order_to_str(str_to_natural_byte_order(self.previous_hash))
        if isinstance(self.merkle_root, str):
            self.merkle_root = natural_byte_order_to_str(str_to_natural_byte_order(self.merkle_root))
        
        return (
            int_to_little_endian(self.timestamp) +
            str_to_natural_byte_order(self.version) +
            str_to_natural_byte_order(self.bits) +
            str_to_natural_byte_order(self.nonce) +
            str_to_natural_byte_order(self.previous_hash) +
            str_to_natural_byte_order(self.merkle_root)
        )
    
    def save(self, *args, **kwargs):
        self.block_hash = natural_byte_order_to_str(sha256(self._header_data))
        super(BlockHeader, self).save(*args, **kwargs)
    
    def bits_to_target(self, bits: str) -> bytes:
        """Convert the compact bits representation to the full target in bytes."""
        if len(bits) != 8:
            raise ValueError("Bits must be exactly 8 characters long.")
        try:
            exponent = int(bits[:2], 16)
            coefficient = int(bits[2:], 16)
        except ValueError:
            raise ValueError("Bits must be a valid hexadecimal string.")
        target = coefficient * (2 ** (8 * (exponent - 3)))
        return target.to_bytes(32, byteorder='big')
    
    def mine(self, target):
        """Performs mining by finding a valid nonce such that the block hash is less than the target."""
        while True:
            hash_result = sha256(sha256(self._header_data))
            if hash_result[::-1] < target:
                self.block_hash = natural_byte_order_to_str(hash_result)
                break
            
            nonce_int = little_endian_to_int(str_to_natural_byte_order(self.nonce))
            nonce_int += 1
            self.nonce = natural_byte_order_to_str(int_to_little_endian(nonce_int))
        
        self.save()

class Blockchain(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="blockchains")
    target = models.CharField(max_length=64, default="0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.id
    
    def get_chain(self):
        """Retrieve the ordered chain of blocks."""
        return self.blocks.order_by('height')

    def validate_chain(self):
        """Validate the blockchain by checking hashes and connections."""
        chain:List[Block] = self.get_chain()
        previous_hash = natural_byte_order_to_str(DEFAULT_HASH)
        for index, block in enumerate(chain):
            if not block.header.is_valid():
                raise ValueError(f"Block {block.height} failed header validation.")
            if block.header.previous_hash != previous_hash:
                raise ValueError(f"Block {block.height} has incorrect previous hash.")
            hash_result = sha256(sha256(block.header._header_data))
            target = block.header.bits_to_target(block.header.bits)
            if hash_result[::-1] >= target:
                raise ValueError(f"Block {block.height} does not meet the proof-of-work requirement.")
            previous_hash = block.header.block_hash
        return True

class Block(models.Model):
    id = models.CharField(max_length=255, primary_key=True, editable=False)
    height = models.IntegerField(default=0, null=False, blank=False, db_index=True)
    blockchain = models.ForeignKey(Blockchain, on_delete=models.CASCADE, related_name="blocks")
    size = models.IntegerField(default=0, null=False, blank=False)
    header = models.ForeignKey(BlockHeader, on_delete=models.CASCADE)
    data = models.TextField(default='', null=False)
    
    def __str__(self):
        return f"Block #{self.height} of {self.blockchain}"
    
    def set_general_journal(self, journal: GeneralJournal):
        """Serialize GeneralJournal and save it to the data field."""
        transactions = [
            {
                "date": transaction.date.isoformat(),
                "description": transaction.description,
                "lines": [
                    {
                        "account": line.account.name,
                        "is_debit": line.is_debit,
                        "value": line.value,
                    }
                    for line in transaction.lines.all()
                ],
            }
            for transaction in journal.transactions.all()
        ]
        journal_data = {
            "id": journal.id,
            "company": journal.company,
            "period": journal.period.isoformat(),
            "total": journal.total,
            "transactions": transactions,
        }
        self.data = json.dumps(journal_data, cls=DjangoJSONEncoder)
        self.size = len(self.data)
    
    def get_general_journal(self) -> GeneralJournal:
        """Deserialize the data field into a GeneralJournal object."""
        journal_data = json.loads(self.data)
        return journal_data
    
    def save(self, *args, **kwargs):
        if not self.blockchain or not self.header:
            raise ValueError("Both blockchain and header must be set before saving the block.")
        self.id = f"{self.blockchain.id}-{self.header.block_hash}"
        self.size = len(self.data)
        
        if self.height == 0:
            self.header.previous_hash = natural_byte_order_to_str(DEFAULT_HASH)
        elif not self.header.previous_hash:
            prev_block = Block.objects.filter(blockchain=self.blockchain).order_by('-height').first()
            self.header.previous_hash = prev_block.header.block_hash if prev_block else natural_byte_order_to_str(DEFAULT_HASH)
        self.header.save()
        super(Block, self).save(*args, **kwargs)
