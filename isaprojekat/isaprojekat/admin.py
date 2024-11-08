from django.contrib import admin
from .models import User, Post, Comment, LikePost, LikeComment, Followers

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(LikePost)
admin.site.register(LikeComment)
admin.site.register(Followers)