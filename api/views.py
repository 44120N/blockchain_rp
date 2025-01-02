from django.db import transaction
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import BlockHeader, Block, Blockchain
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
import json

# Create your views here.
class BlockHeaderAPI(APIView):
    def get(self, request, block_hash=None):
        if block_hash:
            block_header = get_object_or_404(BlockHeader, block_hash=block_hash)
            serializer = BlockHeaderSerializer(block_header)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        block_headers = BlockHeader.objects.all()
        serializer = BlockHeaderSerializer(block_headers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BlockHeaderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, block_hash):
        block_header = get_object_or_404(BlockHeader, block_hash=block_hash)
        block_header.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BlockAPI(APIView):
    def get(self, request, block_id=None):
        if block_id:
            block = get_object_or_404(Block, pk=block_id)
            data = {
                "id": block.id,
                "height": block.height,
                "blockchain": block.blockchain.id,
                "size": block.size,
                "header": block.header.block_hash,
                "data": block.data,
            }
            return Response(data, status=status.HTTP_200_OK)
        
        blocks = Block.objects.all()
        data = [
            {
                "id": block.id,
                "height": block.height,
                "blockchain": block.blockchain.id,
                "size": block.size,
                "header": block.header.block_hash,
                "data": block.data,
            }
            for block in blocks
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        pass

    def delete(self, request, block_id):
        block = get_object_or_404(Block, pk=block_id)
        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BlockchainAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, blockchain_id=None):
        if blockchain_id:
            blockchain = get_object_or_404(Blockchain, id=blockchain_id)
            return Response({
                "id": blockchain.id,
                "user": blockchain.user.username,
                "created_at": blockchain.created_at,
                "block_count": blockchain.blocks.count(),
                "blocks": [
                    {
                        "id": block.id,
                        "height": block.height,
                        "data": block.data,
                        "timestamp": block.timestamp,
                        "hash": block.header.block_hash if block.header else None,
                    }
                    for block in blockchain.blocks.all()
                ]
            })

        blockchains = Blockchain.objects.filter(user=request.user)
        return Response([
            {
                "id": blockchain.id,
                "name": blockchain.name,
                "created_at": blockchain.created_at,
                "block_count": blockchain.blocks.count(),
            }
            for blockchain in blockchains
        ])

    def post(self, request):
        name = request.data.get('name', None)

        if not name:
            return Response({"error": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if Blockchain.objects.filter(user=request.user).exists():
            return Response(
                {"error": "A blockchain already exists for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        blockchain = Blockchain.objects.create(user=request.user, name=name)
        return Response({
            "message": "Blockchain created successfully.",
            "id": blockchain.id,
            "name": blockchain.name,
            "created_at": blockchain.created_at,
        }, status=status.HTTP_201_CREATED)

# Blockchain Actions
def mine_block(blockchain, data: str):
    target = int(blockchain.target, 16).to_bytes(32, byteorder='big') 
    block_header = BlockHeader()
    block_header.save()
    
    previous_block = blockchain.blocks.last()
    new_block = Block(
        blockchain=blockchain,
        height=(previous_block.height + 1 if previous_block else 0),
        header=block_header,
        data=data,
    )
    new_block.header.mine(target)
    return new_block

class MineAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blockchain = get_object_or_404(Blockchain, user=request.user)
        
        try:
            data = json.loads(request.body).get('data', 'No data provided')
        except json.JSONDecodeError:
            raise ValidationError("Invalid JSON format")
        
        new_block = mine_block(blockchain, data)
        new_block.save()
        
        return Response({
            "message": "Block mined successfully",
            "block_height": new_block.height,
            "block_hash": new_block.header.block_hash,
            "block_nonce": new_block.header.nonce,
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
