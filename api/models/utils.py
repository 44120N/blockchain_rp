import hashlib, struct
from datetime import datetime

def sha256(data: str | bytes) -> bytes:
    """Returns SHA-256 hash of the input."""
    if isinstance(data, str):
        return hashlib.sha256(data.encode()).digest()
    elif isinstance(data, bytes):
        return hashlib.sha256(data).digest()

def int_to_little_endian(value: int | str) -> bytes:
    """Convert an integer to little-endian format."""
    if isinstance(value, str):
        value = int(value, 16)
        return struct.pack('<I', value)
    if isinstance(value, int):
        return struct.pack('<I', value)
    raise TypeError(f"Expected a string or bytes, got {type(value).__name__}.")

def datetime_to_little_endian(dt: datetime=None) -> bytes:
    """Convert a datetime object to 4-byte little-endian format."""
    if dt is None:
        dt = datetime.now()
    unix_time = int(dt.timestamp())
    return struct.pack('<I', unix_time)

def little_endian_to_int(value: bytes) -> int:
    """Convert little-endian bytes to an integer."""
    return struct.unpack('<I', value)[0]

def little_endian_to_datetime(value: bytes) -> datetime:
    """Convert 4-byte little-endian bytes to a datetime object."""
    unix_time = struct.unpack('<I', value)[0]
    return datetime.fromtimestamp(unix_time)

def str_to_natural_byte_order(value: str) -> bytes:
    """Convert a string hash in hex format to natural (binary) byte order."""
    if isinstance(value, str):
        return bytes.fromhex(value)
    raise TypeError(f"Expected a string or bytes, got {type(value).__name__}.")

def natural_byte_order_to_str(value: bytes) -> str:
    """Convert a 32-byte hash back to its hexadecimal string representation."""
    return value.hex()

def compute_merkle_root(txids: list[str]) -> str:
    """Compute the Merkle Root from a list of TXIDs."""
    if not txids:
        return natural_byte_order_to_str(sha256(b''))
    
    while len(txids) > 1:
        if len(txids) % 2 == 1:
            txids.append(txids[-1])
        txids = [
            natural_byte_order_to_str(sha256(sha256(bytes.fromhex(txids[i] + txids[i + 1]))))
            for i in range(0, len(txids), 2)
        ]
    return txids[0]
