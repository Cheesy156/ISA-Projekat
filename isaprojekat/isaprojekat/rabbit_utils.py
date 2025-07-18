import pika
import json

def send_ad_post_to_agencies(post):
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))  # zameni ako koristiš docker-compose mrežu
    channel = connection.channel()

    channel.exchange_declare(exchange='ad_agency_exchange', exchange_type='fanout')

    message = {
        'description': post.text,
        'time_posted': post.time_posted.isoformat(),
        'username': post.user.username
    }

    channel.basic_publish(
        exchange='ad_agency_exchange',
        routing_key='',
        body=json.dumps(message)
    )

    connection.close()
