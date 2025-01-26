from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.shortcuts import render, get_object_or_404, redirect

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from ..models import BlockHeader, Block, Blockchain, ChainUser, GeneralJournal, Transaction, TransactionLine, Account
from ..serializers import *
import json, time

# Create your views here.
def mine_block(blockchain: Blockchain, journal: GeneralJournal) -> Block:
    """
    Mines a new block for the given blockchain using the provided general journal.

    Args:
        blockchain (Blockchain): The blockchain to which the block will be added.
        journal (GeneralJournal): The general journal whose transactions will be included in the block.

    Returns:
        Block: The mined block.
    """
    blockchain.target="000ffff000000000000000000000000000000000000000000000000000000000"
    blockchain.save()
    t_0 = time.time()
    if not journal.transactions:
        raise ValueError("The GeneralJournal must contain at least one transaction.")
    
    full_target = int(blockchain.target, 16).to_bytes(32, byteorder="big")
    block_header = BlockHeader()
    
    previous_block = blockchain.blocks.last()
    if previous_block:
        block_header.previous_hash = previous_block.header.block_hash
    block_header.bits = BlockHeader.target_to_bits(full_target)
    block_header.save()

    new_block = Block(
        blockchain=blockchain,
        height=(previous_block.height + 1 if previous_block else 0),
        header=block_header
    )
    new_block.set_general_journal(journal)
    new_block.header.mine(blockchain.target)
    new_block.save()
    t_1 = time.time()
    dt = t_1 - t_0
    print(dt)
    
    return new_block

class MineAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        chain_user = request.user.chain_user
        blockchain = chain_user.blockchain
        if not blockchain:
            return Response({"error": "No blockchain associated with this user."}, status=400)

        journal_id = request.data.get("journal_id")
        if not journal_id:
            return Response({"error": "The journal_id is required."}, status=400)

        journal = get_object_or_404(GeneralJournal, id=journal_id)
        if not journal.transactions.exists():
            return Response(
                {"error": "Cannot mine a block with an empty General Journal."},
                status=400
            )

        try:
            new_block = mine_block(blockchain, journal)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        return Response({
            "message": "Block mined successfully.",
            "block": {
                "height": new_block.height,
                "hash": new_block.header.block_hash,
                "nonce": new_block.header.nonce,
                "merkle_root": new_block.header.merkle_root,
                "data": json.loads(new_block.data)
            }
        }, status=201)

class ValidateChainAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, blockchain_id):
        blockchain = get_object_or_404(Blockchain, pk=blockchain_id)
        is_valid = blockchain.validate_chain()
        
        if is_valid:
            return Response({"message": "Blockchain is valid."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Blockchain is invalid."}, status=status.HTTP_400_BAD_REQUEST)

class ConsensusAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user_blockchain = get_object_or_404(Blockchain, user=request.user)
        all_blockchains = Blockchain.objects.all()
        longest_chain = None
        max_length = 0
        
        for blockchain in all_blockchains:
            if blockchain.validate_chain():
                chain_length = blockchain.blocks.count()
                if chain_length > max_length:
                    max_length = chain_length
                    longest_chain = blockchain
        
        if not longest_chain:
            return Response(
                {"error": "No valid chains found in the network."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if user_blockchain != longest_chain:
            with transaction.atomic():
                user_blockchain.blocks.all().delete()
                for block in longest_chain.blocks.all():
                    Block.objects.create(
                        blockchain=user_blockchain,
                        height=block.height,
                        header=block.header,
                        data=block.data,
                        timestamp=block.timestamp,
                        size=block.size,
                    )
            
            return Response(
                {
                    "message": "Blockchain updated to the longest chain.",
                    "longest_chain_id": longest_chain.id,
                    "block_count": max_length,
                },
                status=status.HTTP_200_OK,
            )
        
        return Response(
            {"message": "Your blockchain is already the longest chain."},
            status=status.HTTP_200_OK,
        )
