import pika
import sys, os

def main(agency_name):
    credentials = pika.PlainCredentials('user', 'password')
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost',
        credentials=credentials
    ))
    channel = connection.channel()

    channel.exchange_declare(exchange='advertise', exchange_type='fanout')

    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue

    # Bind the queue to the fanout exchange
    channel.queue_bind(exchange='advertise', queue=queue_name)

    print(f"[{agency_name}] Waiting for messages.")

    def callback(ch, method, properties, body):
        print(f"[{agency_name}] Received: {body.decode()}")

    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

    channel.start_consuming()

if __name__ == '__main__':
    agency_name = sys.argv[1] if len(sys.argv) > 1 else 'Agency'
    try:
        main(agency_name)
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
