from celery import shared_task
from django.core.mail import send_mail
from isaprojekat.models import MyUser
from django.utils import timezone
from datetime import timedelta

@shared_task
def send_inactive_user_report():
    now = timezone.now()
    cutoff = now - timedelta(days=7)

    # Get time window from 7d ago at 00:00 to 07:59
    window_start = cutoff.replace(hour=0, minute=0, second=0, microsecond=0)
    window_end = cutoff.replace(hour=7, minute=59, second=59, microsecond=999999)

    inactive_users = MyUser.objects.filter(
        last_login__gte=window_start,
        last_login__lte=window_end
    )

    if not inactive_users.exists():
        print("No inactive users matching window")
        return

    for user in inactive_users:
        send_mail(
            subject="We miss you on the app!",
            message=f"Hi {user.username}, you haven't logged in since {user.last_login.date()}!",
            from_email='ffttnnnnttpp@gmail.com',
            recipient_list='ffttnnnnttpp@gmail.com',
            fail_silently=False,
        )
