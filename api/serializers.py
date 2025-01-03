from rest_framework import serializers
from .models import BlockHeader, Blockchain, Block, ChainUser, TransactionLine, Transaction, GeneralJournal, Account

class BlockHeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockHeader
        fields = '__all__'

class BlockchainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blockchain
        fields = '__all__'

class BlockSerializer(serializers.ModelSerializer):
    header = BlockHeaderSerializer()
    class Meta:
        model = Block
        fields = '__all__'

class ChainUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChainUser
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class TransactionLineSerializer(serializers.ModelSerializer):
    account = AccountSerializer(required=True)
    class Meta:
        model = TransactionLine
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    lines = TransactionLineSerializer(many=True, required=False)

    class Meta:
        model = Transaction
        fields = '__all__'

class GeneralJournalSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, required=False)

    class Meta:
        model = GeneralJournal
        fields = '__all__'
