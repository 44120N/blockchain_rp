from django.shortcuts import render, get_object_or_404, redirect

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from ..models import BlockHeader, Block, Blockchain, ChainUser, GeneralJournal, Transaction, TransactionLine, Account
from ..serializers import *
import json

# Create your views here.
# Blockchain
def mine_block(blockchain: Blockchain, journal: GeneralJournal) -> Block:
    """
    Mines a new block for the given blockchain using the provided general journal.

    Args:
        blockchain (Blockchain): The blockchain to which the block will be added.
        journal (GeneralJournal): The general journal whose transactions will be included in the block.

    Returns:
        Block: The mined block.
    """
    
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
    new_block.header.mine(full_target)
    new_block.save()
    return new_block

class MineAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        chain_user = request.user.chain_user
        blockchain = chain_user.blockchain
        if not blockchain:
            return Response({"error": "No blockchain associated with this user."}, status=400)
        
        try:
            body = json.loads(request.body)
            journal_id = body.get("journal_id")
            if not journal_id:
                raise ValidationError("journal_id is required.")
        except json.JSONDecodeError:
            raise ValidationError("Invalid JSON format.")
        
        journal = get_object_or_404(GeneralJournal, id=journal_id)
        try:
            new_block = mine_block(blockchain, journal)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        
        return Response({
            "message": "Block mined successfully",
            "block_height": new_block.height,
            "block_hash": new_block.header.block_hash,
            "block_nonce": new_block.header.nonce,
            "merkle_root": new_block.header.merkle_root,
            "block_data": json.loads(new_block.data)
        })

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
