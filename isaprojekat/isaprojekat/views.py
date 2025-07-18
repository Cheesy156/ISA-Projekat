from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer, UserLoginSerializer, PostSerializer, CommentSerializer, PostCommentSerializer, UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes
from django.core.cache import cache
from rest_framework.views import APIView
import time
import json
from rest_framework_simplejwt.authentication import JWTAuthentication
import jwt
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import transaction, IntegrityError
from django.views.decorators.csrf import csrf_exempt
from .models import Post, MyUser, LikePost
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django_ratelimit.exceptions import Ratelimited
from django.utils.timezone import now
from .utils import geocode_address, haversine
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from .utils import rate_limiter


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', block=False)
def register_user(request):
    if getattr(request, 'limited', False): 
        return Response(
            {"error": "Too many requests. Please try again later."},
            status=429
        )
    
    time.sleep(2)

    with transaction.atomic():
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():

            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_user(request):
    response = Response({"message": "Logout successful!"})
    response.delete_cookie('access_token')
    return response

@api_view(['GET'])
@rate_limiter(max_requests=5, period=60)
def user_nearby_posts(request):
    token = request.headers.get('Authorization')
    if not token:
            return Response(
                {"error": "Bearer token missing or incorrectly formatted"},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    # Check token format (make sure it starts with "Bearer ")
    if not token.startswith("Bearer "):
        return Response(
            {"error": "Token format is incorrect"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    try:
        token = token.split()[1]
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user = MyUser.objects.get(id=decoded['user_id'])
        # Geocode user's profile location
        lat, lon = geocode_address(user.address, user.city, user.country)
        if not lat or not lon:
            return Response({"error": "Could not geocode user location"}, status=400)

        user_location = {
            "latitude": lat,
            "longitude": lon
        }

        # Get radius from query param or default to 5 km
        try:
            radius_km = float(request.GET.get('radius', 5))
        except ValueError:
            return Response({"error": "Invalid radius value"}, status=400)

        # Get all cached post locations
        cached_locations = cache.get('all_post_locations')
        if not cached_locations:
            # If not cached, cache them
            posts = Post.objects.all()
            cached_locations = []
            for post in posts:
                if post.latitude and post.longitude:
                    cached_locations.append({
                        'post_id': post.id,
                        'latitude': float(post.latitude),
                        'longitude': float(post.longitude),
                    })
            cache.set('all_post_locations', cached_locations, timeout=600)

        # Filter post IDs inside radius
        nearby_post_ids = []
        for loc in cached_locations:
            dist = haversine(lat, lon, loc['latitude'], loc['longitude'])
            if dist <= radius_km:
                nearby_post_ids.append(loc['post_id'])

        # Fetch posts data only for nearby post IDs
        nearby_posts = Post.objects.filter(id__in=nearby_post_ids)
        serializer = PostCommentSerializer(nearby_posts, many=True)
        
        return Response({
            "user_location": user_location, 
            "nearby_posts": serializer.data
        })
        
    except jwt.ExpiredSignatureError:
        return Response({"error": "Token expired"}, status=401)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token"}, status=401)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)



@api_view(['POST'])
def create_post(request):
    try:
        # Extract token and decode it
        token = request.headers.get('Authorization')
        if not token:
            return Response(
                {"error": "Bearer token missing or incorrectly formatted"},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
        # Check token format (make sure it starts with "Bearer ")
        if not token.startswith("Bearer "):
            return Response(
                {"error": "Token format is incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token = token.split()[1]  # Extract the token part after 'Bearer'

        decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

        user_id = decoded_data.get('user_id')

        data = request.data.copy()
        data['user'] = user_id 

        serializer = PostSerializer(data=data)
        if serializer.is_valid():
            # Save the post data
            post = serializer.save()

            if 'latitude' in data and 'longitude' in data:
                # Cache single post location
                cache_key = f"post_location_{post.id}"
                cache.set(cache_key, (post.latitude, post.longitude), timeout=86400)

                # Invalidate full locations cache so it refreshes on next GET
                cache.delete('all_post_locations')
                

            return Response({
                "message": "Post created successfully!",
                "post": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except jwt.ExpiredSignatureError:
        return Response(
            {"error": "Token has expired"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        return Response(
            {"error": "Invalid token"},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to access this view
    
    @method_decorator(ratelimit(key='ip', rate='5/m', block=False))
    def post(self, request, *args, **kwargs):
        if getattr(request, 'limited', False):  # `limited` attribute is set by Ratelimit
            return Response(
                {"error": "Too many requests. Please try again later."},
                status=429
            )
        try:
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data["user"]

                # Update the last_login field
                user.last_login = now()
                user.save(update_fields=['last_login'])

                # Generate JWT tokens for the user
                refresh = RefreshToken.for_user(user)

                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),  # Optional if not used
                    "message": "Login successful!"
                }, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Ratelimited:
            return Response(
                {"error": "Too many requests. Please try again later."},
                status=429
            )
        
@api_view(['POST'])
def create_comment(request):
    # Verify and decode the JWT token
    token = request.headers.get('Authorization')
    if not token or not token.startswith("Bearer "):
        return Response(
            {"error": "Bearer token missing or incorrectly formatted"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        token = token.split()[1]  # Extract the actual token after 'Bearer'
        decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_data.get('user_id')

        if not user_id:
            return Response(
                {"error": "Invalid token: user ID not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Prepare data with user_id, post_id, and other fields from request data
        data = request.data.copy()
        data['user'] = user_id

        # Serialize and save the comment
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Comment created successfully!"}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except jwt.ExpiredSignatureError:
        return Response(
            {"error": "Token has expired"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        return Response(
            {"error": "Invalid token"},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_posts_with_comments(request):
    posts = Post.objects.all()
    serializer = PostCommentSerializer(posts, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_profile_view(request, username):
    try:
        user = MyUser.objects.get(username=username)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def check_user_view(request, username):
    token = request.headers.get('Authorization')
    
    if not token or not token.startswith("Bearer "):
        return Response(
            {"error": "Bearer token missing or incorrectly formatted"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        token = token.split()[1]  # Extract the actual token after 'Bearer'
        decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_data.get('user_id')

        if not user_id:
            return Response(
                {"error": "Invalid token: user ID not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )

    except jwt.ExpiredSignatureError:
        return Response(
            {"error": "Token has expired"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        return Response(
            {"error": "Invalid token"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        logged_in_user = MyUser.objects.get(id=user_id)
    except MyUser.DoesNotExist:
        return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if the logged-in user's username matches the username parameter
    if logged_in_user.username == username:
        return Response({"message": "User is authenticated and matches."}, status=status.HTTP_200_OK)
    else:
        return Response({"message": "User is authenticated but does not match."}, status=status.HTTP_403_FORBIDDEN)
    

@api_view(['GET'])
def get_username_view(request):
    token = request.headers.get('Authorization')
    
    if not token or not token.startswith("Bearer "):
        return Response(
            {"error": "Bearer token missing or incorrectly formatted"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        token = token.split()[1]  # Extract the actual token after 'Bearer'
        decoded_data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_data.get('user_id')

        if not user_id:
            return Response(
                {"error": "Invalid token: user ID not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )

    except jwt.ExpiredSignatureError:
        return Response(
            {"error": "Token has expired"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        return Response(
            {"error": "Invalid token"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        logged_in_user = MyUser.objects.get(id=user_id)
    except MyUser.DoesNotExist:
        return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response({'username': logged_in_user.username})