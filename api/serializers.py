from rest_framework import serializers
from .models import BlockHeader, Blockchain, Block

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
