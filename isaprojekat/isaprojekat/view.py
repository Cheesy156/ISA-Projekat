from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer, UserLoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

import time
from django.db import transaction, IntegrityError

@api_view(['POST'])
def register_user(request):

    time.sleep(2)

    with transaction.atomic():
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response({"error": "A user with this username or email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]

        # Generate JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "refresh": str(refresh), # Probably wont be used for this project
            "access": str(refresh.access_token), 
            "message": "Login successful!"
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)