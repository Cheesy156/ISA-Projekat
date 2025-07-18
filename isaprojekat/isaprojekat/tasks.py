from huey.contrib.djhuey import task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta

from isaprojekat.models import MyUser, Post 


# So i won't add another database (column database for logging) that saves every log (when someone likes, follows or unfollows) 
# Only get the latest posts 
@task()
def send_weekly_post_summary():
    one_week_ago = timezone.now() - timedelta(days=7)

    # Get all posts from the last 7 days
    recent_posts = Post.objects.filter(time_posted__gte=one_week_ago)
    post_count = recent_posts.count()

    if post_count == 0:
        return  # Nothing to report

    # Send to users who haven't logged in for 7+ days
    inactive_users = MyUser.objects.filter(last_login__lt=one_week_ago)

    for user in inactive_users:
        if post_count > 0:
            send_mail(
                subject='Come back plz',
                message=f"New post count on the platform: {post_count}\nThis data is from the last 7 days.\n{user.username}",
                from_email='ffttnnnnttpp@gmail.com',
                recipient_list=['ffttnnnnttpp@gmail.com'],
                fail_silently=False,
            )