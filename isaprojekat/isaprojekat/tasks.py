from celery import shared_task
from django.core.mail import send_mail
from isaprojekat.models import MyUser
from django.utils import timezone
from datetime import timedelta

@shared_task
def send_inactive_user_report():
    now = timezone.now()

    seven_days_ago_start = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago_end = (now - timedelta(days=7)).replace(hour=7, minute=59, second=59, microsecond=999999)

    inactive_users = MyUser.objects.filter(
        last_login__gte=seven_days_ago_start,
        last_login__lte=seven_days_ago_end
    )

    for user in inactive_users:
        email_subject = "COMEEE BACKEEE PLEASE WE NEED MONEY"
        email_body = (
            f"Dear {user.username},\n\n"
            "Come back please. "
            "We will give you less ads\n\n"
            "Best regards,\n"
            ":P"
        )
        send_mail(
            email_subject,
            email_body,
            'ffttnnnnttpp@gmail.com',  # Replace with your sender email
            ['ffttnnnnttpp@gmail.com'],
            fail_silently=False,
        )
