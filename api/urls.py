from django.urls import path
from .views import *

urlpatterns = [
    # Block-header API
    path('block-headers/', BlockHeaderAPI.as_view(), name='block-header'),
    path('block-headers/<str:block_hash>/', BlockHeaderAPI.as_view(), name='block-header-detail'),
    
    # Block API
    path('blocks/', BlockAPI.as_view(), name='block-list'),
    path('blocks/<int:block_id>/', BlockAPI.as_view(), name='block-detail'),

    # Blockchain API
    path('blockchains/', BlockchainAPI.as_view(), name='blockchain-list'),
    path('blockchains/<int:bloackchain_id>/', BlockchainAPI.as_view(), name='blockchain-detail'),
    
    # Blockchain actions
    path('blockchain/<int:blockchain_id>/mine/', mine_block, name='mine_block'),
    path('blockchain/<int:blockchain_id>/validate/', ValidateChainAPI.as_view(), name='validate-chain'),
]
