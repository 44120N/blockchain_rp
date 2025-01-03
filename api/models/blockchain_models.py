from typing import List
import os, uuid, json
from datetime import datetime
from ecdsa import SigningKey, SECP256k1
from .utils import sha256, int_to_little_endian, datetime_to_little_endian, little_endian_to_int, little_endian_to_datetime, str_to_natural_byte_order, natural_byte_order_to_str, compute_merkle_root
from .accounting_models import GeneralJournal

from django.db import models
from django.contrib.auth.models import User
from django.core.serializers import serialize
from rest_framework.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder

DEFAULT_HASH = b'\x00'*32

# Models
class BlockHeader(models.Model):
    timestamp = models.IntegerField(null=True)
    version = models.TextField(
        null=False, blank=False, 
        default=natural_byte_order_to_str(int_to_little_endian(0x20000000))
    )
    bits = models.TextField(
        null=False, blank=False, 
        default=natural_byte_order_to_str(int_to_little_endian(0x00000000))
    )
    nonce = models.TextField(
        null=False, blank=False, 
        default=natural_byte_order_to_str(int_to_little_endian(0x00000000))
    )
    previous_hash = models.TextField(
        default=natural_byte_order_to_str(DEFAULT_HASH), 
        null=False, blank=False
    )
    merkle_root = models.TextField(
        default=natural_byte_order_to_str(DEFAULT_HASH), 
        null=False, blank=False
    )
    block_hash = models.TextField(
        primary_key=True, default=natural_byte_order_to_str(DEFAULT_HASH), 
        null=False, blank=False
    )
    
    def __init__(self, *args, **kwargs):
        super(BlockHeader, self).__init__(*args, **kwargs)
        if not self.timestamp:
            self.timestamp = little_endian_to_int(datetime_to_little_endian(datetime.now()))
    
    def clean(self):
        super().clean()
        if len(self.previous_hash) != 64:
            raise ValidationError("Invalid hash length for previous_hash.")
        if len(self.merkle_root) != 64:
            raise ValidationError("Invalid hash length for merkle_root.")
        version_int = little_endian_to_int(str_to_natural_byte_order(self.version))
        if version_int < 0x20000000:
            raise ValidationError("Version must be at least 0x20000000 to be valid.")

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
        self.block_hash = natural_byte_order_to_str(sha256(self._header_data()))
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
            hash_result = sha256(sha256(self._header_data()))
            if hash_result[::-1] < target:
                self.block_hash = natural_byte_order_to_str(hash_result)
                break
            
            nonce_int = little_endian_to_int(str_to_natural_byte_order(self.nonce))
            nonce_int += 1
            self.nonce = natural_byte_order_to_str(int_to_little_endian(nonce_int))
        
        self.save()

class Blockchain(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
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
            hash_result = sha256(sha256(block.header._header_data()))
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
        """Serialize GeneralJournal's transactions and compute Merkle Root."""
        transactions = journal.transactions.all()
        txids = [tx.txid for tx in transactions]
        self.header.merkle_root = compute_merkle_root(txids)
        
        transaction_data = [
            {
                "txid": tx.txid,
                "date": tx.date.isoformat(),
                "description": tx.description,
                "value": tx.total,
            }
            for tx in transactions
        ]
        self.data = json.dumps({"transactions": transaction_data}, cls=DjangoJSONEncoder)
        self.size = len(self.data)
        self.save()
    
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

class ChainUser(models.Model):
    user = models.OneToOneField(User, unique=True, on_delete=models.CASCADE, related_name="chain_user")
    blockchain = models.ForeignKey(Blockchain, null=True, blank=True, on_delete=models.SET_NULL, related_name="user")
    public_key = models.TextField()
    private_key = models.TextField()

    def __str__(self):
        return f"Keys for Blockchain {self.blockchain.id}"
    
    def generate_keys(self):
        """Generate a 256-bit private key"""
        private_key_bytes = os.urandom(32)
        private_key_hex = private_key_bytes.hex()
        
        # Generate the public key
        sk = SigningKey.from_string(private_key_bytes, curve=SECP256k1)
        vk = sk.verifying_key
        public_key_bytes = vk.to_string()
        
        # Compressed public key
        x = public_key_bytes[:32]
        y = public_key_bytes[32:]
        prefix = b'\x02' if y[-1] % 2 == 0 else b'\x03'
        compressed_public_key = prefix + x

        self.private_key = private_key_hex
        self.public_key = compressed_public_key.hex()
        self.save()

        return self.private_key, self.public_key
