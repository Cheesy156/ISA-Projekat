from django.apps import AppConfig

class IsaprojekatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'isaprojekat'

    def ready(self):
        import isaprojekat.tasks  # this ensures tasks register with Huey
