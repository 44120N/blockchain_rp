from rest_framework import serializers
from .models import BlockHeader

class BlockHeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockHeader
        fields = '__all__'