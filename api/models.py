from django.db import models
import hashlib, struct
from datetime import datetime

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
        if self.timestamp is None:
            current_time = datetime.now()
            self.timestamp = little_endian_to_int(datetime_to_little_endian_bytes(current_time))

    def save(self, *args, **kwargs):        
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

        header = (
            int_to_little_endian(self.timestamp) + 
            str_to_natural_byte_order(self.version) + 
            str_to_natural_byte_order(self.bits) + 
            str_to_natural_byte_order(self.nonce) + 
            str_to_natural_byte_order(self.previous_hash) + 
            str_to_natural_byte_order(self.merkle_root) 
        )
        self.block_hash = natural_byte_order_to_str(sha256(header))
        super(BlockHeader, self).save(*args, **kwargs)
    
    def bits_to_target(self, bits: str) -> bytes:
        """Convert the compact bits representation to the full target in bytes."""
        exponent = int(bits[:2], 16)
        coefficient = int(bits[2:], 16)
        target = coefficient * (2 ** (8 * (exponent - 3)))
        
        return target.to_bytes(32, byteorder='big')
    
    def mine(self):
        """Performs mining by finding a valid nonce such that the block hash is less than the target."""
        target_bytes = self.bits_to_target(self.bits)
        while True:
            header = (
                int_to_little_endian(self.timestamp) +
                str_to_natural_byte_order(self.version) +
                str_to_natural_byte_order(self.bits) +
                str_to_natural_byte_order(self.nonce) +
                str_to_natural_byte_order(self.previous_hash) +
                str_to_natural_byte_order(self.merkle_root)
            )
            
            hash_result = sha256(sha256(header))
            if hash_result[::-1] < target_bytes:
                self.block_hash = natural_byte_order_to_str(hash_result)
                break
            
            nonce_int = little_endian_to_int(str_to_natural_byte_order(self.nonce))
            nonce_int += 1
            self.nonce = natural_byte_order_to_str(int_to_little_endian(nonce_int))
        
        self.save()

class Block(models.Model):
    id = models.AutoField(primary_key=True)
    index = models.IntegerField(default=0, null=False, blank=False)
    block_size = models.IntegerField(default=0, null=False, blank=False)
    block_header = models.ForeignKey(BlockHeader, on_delete=models.CASCADE)
    data = models.TextField(default='', null=False)
    
    def save(self, *args, **kwargs):
        self.block_size = len(self.data)
        super(Block, self).save(*args, **kwargs)

class Blockchain(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, default="Blockchain", null=False, blank=False)
    chain = models.ManyToManyField(Block)
    target = models.CharField(max_length=255, default="0")
    
    def consensus(self, *args, **kwargs):
        pass
