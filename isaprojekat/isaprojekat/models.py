from django.db import models
import base64
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class MyUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'Regular User'),
        ('admin', 'Administrator'),
    )

    role = models.CharField(max_length=5, choices=ROLE_CHOICES, default='user')
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    profile_pic_base64 = models.TextField(blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    def set_profile_pic(self, image_path):
        """
        Converts an image to base64 format and stores it.
        """
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            self.profile_pic_base64 = encoded_string

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Post(models.Model):
    text = models.TextField()
    latitude = models.DecimalField(max_digits=24, decimal_places=20, blank=True, null=True)  
    longitude = models.DecimalField(max_digits=24, decimal_places=20, blank=True, null=True) 
    time_posted = models.DateTimeField(default=timezone.now)  # Auto-filled with current time
    picture = models.TextField(blank=True, null=True)  # Store image as base64 or URL
    advertised_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="posts")

    def __str__(self):
        return self.text
    
    def is_advertised(self):
        return self.advertised_at is not None

class Comment(models.Model):
    text = models.TextField()
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(MyUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="comments")
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name="replies")  # Self-referencing field for nested comments

    def __str__(self):
        return f"Comment by {self.user} on {self.post}"

class LikePost(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="liked_posts")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")

    def __str__(self):
        return f"{self.user} likes {self.post}"

class LikeComment(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="liked_comments")
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="likes")

    def __str__(self):
        return f"{self.user} likes comment {self.comment}"

class Followers(models.Model):
    # User that clicks the followbutton on someone
    Follower = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="following")
    # User that gains a follower 
    Followed = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name="followers")

    def __str__(self):
        return f"{self.Follower} follows {self.Followed}"
    