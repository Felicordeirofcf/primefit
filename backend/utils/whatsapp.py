import requests

def enviar_mensagem(numero, mensagem):
    url = f"https://api.z-api.io/instanceID/token/send-messages"
    body = {
        "phone": numero,
        "message": mensagem
    }
    requests.post(url, json=body)
