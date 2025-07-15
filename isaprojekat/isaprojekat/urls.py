"""isaprojekat URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import register_user, create_post, LoginView,get_posts_with_comments, create_comment, user_profile_view, check_user_view, get_username_view, get_all_post_locations
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', register_user, name='register_user'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/create_post/', create_post, name='create_post'),
    path('api/posts/', get_posts_with_comments, name='get_posts_with_comments'),
    path('api/posts/comments', create_comment, name='create_comment'),
    path('api/profile/<str:username>/',user_profile_view, name='user_profile'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/check_user/<str:username>/', check_user_view, name='check-user'),
    path('api/get_username/', get_username_view, name='get_username'),
    path('api/get_post_locations/', get_all_post_locations, name='get_all_post_locations'),
]
