from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, get_object_or_404, redirect

from ..models import BlockHeader, Block, Blockchain, ChainUser, GeneralJournal, Transaction, TransactionLine, Account
from ..forms import LoginForm, SignUpForm
from ..serializers import *

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