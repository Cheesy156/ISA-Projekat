import pika
import json

def send_post_to_agencies(post):
    credentials = pika.PlainCredentials('user', 'password')
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost',
        credentials=credentials
    ))
    channel = connection.channel()

    channel.exchange_declare(exchange='advertise', exchange_type='fanout')
    message = json.dumps({
        'description': post.text,
        'time_posted': post.time_posted.isoformat(),
        'username': post.user.username,
    })

    channel.basic_publish(exchange='advertise', routing_key='', body=message)
    connection.close()