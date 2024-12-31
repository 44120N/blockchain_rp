from django.test import TestCase

# Create your tests here.
import hashlib
from typing import List

def reverse_byte_order(hex_str: str) -> bytes:
    """Reverse byte order of a hex string."""
    return bytes.fromhex(hex_str)[::-1]

def calculate_merkle_root(txids: List[str]) -> bytes:
    """Calculate Merkle root from a list of TXIDs."""
    def hash_pair(left: bytes, right: bytes) -> bytes:
        """Hash a pair of bytes together."""
        return hashlib.sha256(hashlib.sha256(left + right).digest()).digest()

    # Convert TXIDs from reverse byte order to natural byte order
    txids = [reverse_byte_order(txid) for txid in txids]
    
    # Ensure there is an even number of TXIDs (pad with duplicates if necessary)
    if len(txids) % 2 != 0:
        txids.append(txids[-1])
    
    # Create the Merkle tree
    while len(txids) > 1:
        txids = [hash_pair(txids[i], txids[i + 1]) for i in range(0, len(txids), 2)]
    
    return txids[0]

from typing import List, Tuple
from enum import Enum

def get_choices(enum_class: Enum) -> List[Tuple[str, str]]:
    """Helper function to convert Enum class to choices for Django models."""
    choices = [(choice.name, choice.value) for choice in enum_class]
    return [(key, value) for key, value in choices if value != '']

# Enum Choices
class Choices(Enum):
    opt1 = "val1"
    opt2 = "val2"
