from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import User  
import uuid

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 
            'first_name', 'last_name', 'address', 'city', 
            'country', 'profile_pic_base64'
        ]

    def validate(self, data):
        errors = {}

        # Check if email and username are unique
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email is already in use.")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username is already in use.")
        
        return data

    def create(self, validated_data):
        salt = uuid.uuid4().hex
        
        # Hash the password with the custom salt
        hashed_password = make_password(validated_data['password'], salt=salt)
        validated_data['password'] = hashed_password
        
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            address=validated_data.get('address'),
            city=validated_data.get('city'),
            country=validated_data.get('country'),
            profile_pic_base64=validated_data.get('profile_pic_base64'),
            role='user'
        )
        user.password = hashed_password
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get("username_or_email")
        password = data.get("password")
        
        # Check if the input is an email
        if "@" in username_or_email and "." in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            try:
                user = User.objects.get(username=username_or_email)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid username or password.")

        # Check if the password matches
        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid password.")
        
        data["user"] = user
        return data