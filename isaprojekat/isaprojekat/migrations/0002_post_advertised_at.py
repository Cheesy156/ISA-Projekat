# Generated by Django 5.2.4 on 2025-07-19 04:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('isaprojekat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='advertised_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
