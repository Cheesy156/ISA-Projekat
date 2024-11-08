from django.db import models
import base64

class User(models.Model):
    ROLE_CHOICES = (
        ('user', 'Regular User'),
        ('admin', 'Administrator'),
    )

    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=5, choices=ROLE_CHOICES, default='user')
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    profile_pic_base64 = models.TextField(blank=True, null=True)

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
    title = models.CharField(max_length=200)
    text = models.TextField()
    picture = models.TextField(blank=True, null=True)  # Store image as base64 or URL
    userId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")

    def __str__(self):
        return self.title

class Comment(models.Model):
    text = models.TextField()
    postId = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    userId = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="comments")
    commentId = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name="replies")  # Self-referencing field for nested comments

    def __str__(self):
        return f"Comment by {self.userId} on {self.postId}"

class LikePost(models.Model):
    userId = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="liked_posts")
    postId = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")

    def __str__(self):
        return f"{self.userId} likes {self.postId}"

class LikeComment(models.Model):
    userId = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="liked_comments")
    commentId = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="likes")

    def __str__(self):
        return f"{self.userId} likes comment {self.commentId}"

class Followers(models.Model):
    # User that clicks the followbutton on someone
    FollowerId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    # User that gains a follower 
    FollowedId = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    def __str__(self):
        return f"{self.FollowerId} follows {self.FollowedId}"
    