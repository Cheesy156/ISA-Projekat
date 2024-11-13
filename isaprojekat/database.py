import os
import django
import random
from faker import Faker
from django.utils import timezone
import base64
# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'isaprojekat.settings')
django.setup()

from isaprojekat.models import MyUser, Post, Comment, LikePost, LikeComment, Followers

# Initialize Faker for generating random data
fake = Faker()

def delete_data():
    MyUser.objects.all().delete()
    Post.objects.all().delete()
    Comment.objects.all().delete()
    LikePost.objects.all().delete()
    LikeComment.objects.all().delete()
    Followers.objects.all().delete()


def convert_image_to_base64(image_path):
    """
    Converts an image file to base64 string.
    """
    with open(image_path, "rb") as image_file:
        # Read the image file and encode it to base64
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

        return f"data:image/png;base64,{encoded_string}"

def create_users(num_users=10):
    users = []
    base64_image = convert_image_to_base64('user.webp')

    useruser = MyUser.objects.create_user(
            username="user",
            email="user@gmail.com",
            password="user",
            first_name="User",
            last_name="Userovic",
            role='user',
            address=fake.address(),
            city=fake.city(),
            country=fake.country(),
        )
    
    adminuser = MyUser.objects.create_user(
            username="admin",
            email="admin@gmail.com",
            password="admin",
            first_name="Admin",
            last_name="Adminovic",
            role='admin',
            address=fake.address(),
            city=fake.city(),
            country=fake.country(),
        )
    users.append(useruser)
    users.append(adminuser)

    for _ in range(num_users):
        user = MyUser.objects.create_user(
            username=fake.unique.user_name(),
            email=fake.email(),
            password="password",
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            role='user',
            address=fake.address(),
            city=fake.city(),
            country=fake.country(),
            profile_pic_base64 = base64_image
        )
        users.append(user)

    print(f"Created {num_users+2} users.")
    return users

def create_posts(users, num_posts=20):
    posts = []
    base64_image = convert_image_to_base64('user.webp')
    for _ in range(num_posts):
        post = Post.objects.create(
            text=fake.text(max_nb_chars=200),
            latitude=fake.latitude(),
            longitude=fake.longitude(),
            time_posted=timezone.now(),
            user=random.choice(users),
            picture = base64_image
        )
        posts.append(post)
    print(f"Created {num_posts} posts.")
    return posts

def create_comments(users, posts, num_comments=50):
    comments = []
    for _ in range(num_comments):
        post = random.choice(posts)
        user = random.choice(users)
        
        # Decide if this comment will be a top-level comment or a reply
        parent_comment = random.choice(comments) if comments and random.random() < 0.3 else None
        
        comment = Comment.objects.create(
            text=fake.text(max_nb_chars=100),
            post=post,
            user=user,
            parent_comment=parent_comment
        )
        comments.append(comment)
    print(f"Created {num_comments} comments, including nested replies.")
    return comments

def create_likes_on_posts(users, posts, num_likes=30):
    for _ in range(num_likes):
        LikePost.objects.create(
            user=random.choice(users),
            post=random.choice(posts)
        )
    print(f"Created {num_likes} likes on posts.")

def create_likes_on_comments(users, comments, num_likes=30):
    for _ in range(num_likes):
        LikeComment.objects.create(
            user=random.choice(users),
            comment=random.choice(comments)
        )
    print(f"Created {num_likes} likes on comments.")

def create_followers(users, num_follows=15):
    for _ in range(num_follows):
        follower, followed = random.sample(users, 2)
        Followers.objects.create(Follower=follower, Followed=followed)
    print(f"Created {num_follows} follower relationships.")

def populate_database(num_users=10, num_posts=40, num_comments=200, num_likes_post=300, num_likes_comment=300, num_follows=20 ):
    print("Starting database population script...")
    users = create_users(num_users)
    posts = create_posts(users, num_posts)
    comments = create_comments(users, posts, num_comments)
    create_likes_on_posts(users, posts, num_likes_post)
    create_likes_on_comments(users, comments, num_likes_comment)
    create_followers(users, num_follows)
    print("Database population complete.")
    print("To test basic user username: user, password: user, email:user@gmail.com, role:user")
    print("To test admin username: admin, password: admin, email: admin@gmail.com, role:admin")
    print("To test any user password: password")

if __name__ == '__main__':
    num_users = 10
    num_posts = 40
    num_comments = 200
    num_likes_post = 300
    num_likes_comments = 300
    num_follows = 20
    
    delete_data()
    populate_database()