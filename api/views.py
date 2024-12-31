from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import BlockHeader, Block, Blockchain
from .serializers import BlockHeaderSerializer

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
    def get(self, request):
        pass
    
    def post(self, request):
        pass
    
    def delete(self, request):
        pass
    
    def put(self, request):
        pass
