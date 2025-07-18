import pika
import json

def callback(ch, method, properties, body):
    message = json.loads(body)
    print("\n Reklamna poruka:")
    print(f"Opis: {message['description']}")
    print(f"Vreme: {message['time_posted']}")
    print(f"Korisnik: {message['username']}")

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Poveži se na isti exchange
channel.exchange_declare(exchange='ad_posts', exchange_type='fanout')

# Kreiraj privremeni red (automatski se briše kada se agencija ugasi)
result = channel.queue_declare('', exclusive=True)
queue_name = result.method.queue

# Poveži red na exchange
channel.queue_bind(exchange='ad_posts', queue=queue_name)

print(' [*] Čeka poruke. Pritisni CTRL+C za izlaz.')
channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
channel.start_consuming()
