from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404, redirect

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import BlockHeader, Block, Blockchain, ChainUser
from .forms import LoginForm, SignUpForm
from .serializers import *
import json

# Create your views here.
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
            else:
                return render(request, 'login.html', {'form': form, 'error': 'Invalid credentials'})
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

def user_signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            blockchain = Blockchain.objects.create()
            chain_user = ChainUser.objects.create(user=user, blockchain=blockchain)
            private_key, public_key = chain_user.generate_keys()
            request.session['private_key'] = private_key
            login(request, user)
            return redirect('dashboard')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})

@login_required
def user_logout(request):
    logout(request)
    return redirect('login')

@login_required
def dashboard(request):
    user = request.user
    try:
        chain_user = ChainUser.objects.get(user=user)
        blockchain_id = chain_user.blockchain.id if chain_user.blockchain else "No Blockchain"
        context = {
            'username': user.username,
            'email': user.email,
            'user_id': user.id,
            'public_key': chain_user.public_key,
            'blockchain_id': blockchain_id,
        }
    except ChainUser.DoesNotExist:
        context = {
            'username': user.username,
            'email': user.email,
            'user_id': user.id,
            'public_key': "No public key available",
            'blockchain_id': "No Blockchain",
        }
    
    private_key = request.session.pop('private_key', None)
    if private_key:
        context['private_key'] = private_key
    return render(request, 'dashboard.html', context)

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
