from typing import List
import os, uuid, json
from datetime import datetime
from ecdsa import SigningKey, SECP256k1
from .utils import sha256, int_to_little_endian, datetime_to_little_endian, little_endian_to_int, little_endian_to_datetime, str_to_natural_byte_order, natural_byte_order_to_str, compute_merkle_root
from .accounting_models import GeneralJournal

from django.db import models
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.core.validators import MaxValueValidator, MinValueValidator

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
        default="1d00ffff"
    )
    nonce = models.IntegerField(
        null=False, blank=False, 
        default=0,
        validators=[
            MaxValueValidator(0xFFFFFFFF),
            MinValueValidator(0)
        ]
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
            str_to_natural_byte_order(self.version) +
            str_to_natural_byte_order(self.previous_hash) +
            str_to_natural_byte_order(self.merkle_root) +
            int_to_little_endian(self.timestamp) +
            str_to_natural_byte_order(self.bits) +
            int_to_little_endian(self.nonce)
        )
    
    def compute_block_hash(self) -> str:
        """Compute the block hash as the double SHA-256 of the header."""
        header = self._header_data()
        hash1 = sha256(header)
        hash2 = sha256(hash1)
        return natural_byte_order_to_str(hash2)
    
    def save(self, *args, **kwargs):
        self.block_hash = self.compute_block_hash()
        super(BlockHeader, self).save(*args, **kwargs)
    
    def bits_to_target(self, bits: str) -> bytes:
        """Convert the compact bits representation to the full target in bytes."""
        if len(bits) != 8:
            raise ValueError("Bits must be exactly 8 characters long.")
        exponent = int(bits[:2], 16)
        coefficient = int(bits[2:], 16)
        target = coefficient * (2 ** (8 * (exponent - 3)))
        return target.to_bytes(32, byteorder='big')
    
    @staticmethod
    def target_to_bits(target: bytes) -> str:
        """Convert the full target to its compact bits representation."""
        target_int = int.from_bytes(target, byteorder="big")
        hex_target = f"{target_int:064x}"
        first_non_zero = next((i for i, c in enumerate(hex_target) if c != "0"), len(hex_target))
        coefficient = int(hex_target[first_non_zero:first_non_zero + 6], 16)
        exponent = (len(hex_target) - first_non_zero + 2) // 2
        if coefficient > 0x7fffff:
            coefficient >>= 8
            exponent += 1
        bits = f"{exponent:02x}{coefficient:06x}"
        return bits
    
    def mine(self, target):
        """Mine the block by finding a nonce that produces a hash below the target."""
        target_bytes = int.from_bytes(target, byteorder="big")
        while True:
            self.block_hash = self.compute_block_hash()
            if int(self.block_hash, 16) < target_bytes:
                break
            self.nonce += 1
            if self.nonce > 0xFFFFFFFF:
                raise ValueError("Nonce overflow: No valid hash found.")
        self.save()

class Blockchain(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    target = models.TextField(default="0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
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
    
    def create_genesis_block(self):
        """Initialize the blockchain with a genesis block."""
        genesis_header = BlockHeader(
            version="01000000",
            previous_hash="00" * 32,
            merkle_root="3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a",
            timestamp=int(datetime.now().timestamp()),
            bits=self.target,
            nonce=0
        )
        genesis_header.save()

        genesis_block = Block(
            blockchain=self,
            height=0,
            header=genesis_header,
            data=json.dumps({"message": "Genesis Block"})
        )
        genesis_block.save()

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
        if not transactions.exists():
            raise ValueError("GeneralJournal must have at least one transaction.")
        
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
    public_key = models.TextField(null=True, blank=True)
    private_key = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Keys for Blockchain {self.blockchain.id}"
    
    def generate_keys(self):
        """Generate a 256-bit private key using ECDSA"""
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
