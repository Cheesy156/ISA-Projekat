from django.contrib import admin
from .models import MyUser, Post, Comment, LikePost, LikeComment, Followers
from django_celery_beat.models import PeriodicTask, IntervalSchedule


admin.site.register(MyUser)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(LikePost)
admin.site.register(LikeComment)
admin.site.register(Followers)

# Create an interval schedule (e.g., every 8 hours)
schedule, created = IntervalSchedule.objects.get_or_create(
    every=8,
    period=IntervalSchedule.HOURS,
)

task_name = 'Send Inactive User Report'
if not PeriodicTask.objects.filter(name=task_name).exists():
    PeriodicTask.objects.create(
        interval=schedule,
        name=task_name,
        task='isaprojekat.tasks.send_inactive_user_report',
    )
