from geopy.geocoders import Nominatim
from math import radians, sin, cos, sqrt, atan2
import time
from functools import wraps
from rest_framework.response import Response

def geocode_address(address, city, country):
    geolocator = Nominatim(user_agent="isa_project")
    location = geolocator.geocode(f"{address}, {city}, {country}")
    if location:
        return location.latitude, location.longitude
    return None, None

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

# Global storage for rate_limiter
rate_limit_storage = {}

def rate_limiter(max_requests=5, period=60):

    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            user_id = request.user.id if request.user.is_authenticated else request.META.get('REMOTE_ADDR')

            now = time.time()
            window_start = now - period

            if user_id not in rate_limit_storage:
                rate_limit_storage[user_id] = []

            recent_requests = [timestamp for timestamp in rate_limit_storage[user_id] if timestamp > window_start]
            rate_limit_storage[user_id] = recent_requests

            if len(recent_requests) >= max_requests:
                return Response({
                    "error": "Rate limit exceeded. Only 5 request per minute allowed."
                }, status=429)

            rate_limit_storage[user_id].append(now)

            return func(request, *args, **kwargs)

        return wrapper
    return decorator
