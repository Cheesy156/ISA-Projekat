from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import MyUser, Post, Comment, LikePost, LikeComment
import uuid
import base64

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = MyUser
        fields = [
            'username', 'email', 'password', 
            'first_name', 'last_name', 'address', 'city', 
            'country', 'profile_pic_base64'
        ]

    def validate(self, data):
        # Check if email and username are unique
        if MyUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email is already in use.")
        if MyUser.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username is already in use.")
        
        return data

    def create(self, validated_data):
        salt = uuid.uuid4().hex
        
        # Hash the password with the custom salt
        hashed_password = make_password(validated_data['password'], salt=salt)
        validated_data['password'] = hashed_password
        
        user = MyUser(
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
                user = MyUser.objects.get(email=username_or_email)
            except MyUser.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            try:
                user = MyUser.objects.get(username=username_or_email)
            except MyUser.DoesNotExist:
                raise serializers.ValidationError("Invalid username or password.")

        # Check if the password matches
        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid password.")
        
        data["user"] = user

        return data
    
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'text', 'latitude', 'longitude', 'time_posted', 'picture', 'user']

    # Validate if base64 can be decoded
    def validate_picture_base64(self, value):
        try:
            base64.b64decode(value)
        except Exception:
            raise serializers.ValidationError("Invalid image data.")
        return value



class CommentSerializer(serializers.ModelSerializer):
    subcomments = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'text', 'post', 'user', 'parent_comment', 'likes_count', 'username', 'subcomments']

    def get_subcomments(self, obj):
        # Get sub-comments if there are any
        subcomments = Comment.objects.filter(parent_comment=obj)
        return CommentSerializer(subcomments, many=True, context=self.context).data
    
    def get_likes_count(self, obj):
        # Get the number of likes for the comment
        return LikeComment.objects.filter(comment=obj).count()

    def get_username(self, obj):
        # Retrieve the username from the user field of the post
        return obj.user.username if obj.user else None

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)

class PostCommentSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'text', 'latitude', 'longitude', 'time_posted', 'picture', 'user_id', 'likes_count', 'username', 'comments']

    def get_comments(self, obj):
        # Get only top-level comments for the post
        top_level_comments = Comment.objects.filter(post=obj, parent_comment__isnull=True)
        return CommentSerializer(top_level_comments, many=True, context=self.context).data
    
    def get_likes_count(self, obj):
        # Get the number of likes for the post
        return LikePost.objects.filter(post=obj).count()
    
    def get_username(self, obj):
        # Get the username from the User model based on user_id
        return MyUser.objects.get(id=obj.user_id).username
