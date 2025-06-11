import requests

# Coloque aqui o seu token válido (sem < > e sem aspas extras)
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZWxpaXBlZmNmQGdtYWlsLmNvbSIsInVzZXJfaWQiOiJlZDU5NzcyZC1iNzQ1LTRkNDYtYTk1NC1hY2Y4OWVjNDY1MmYiLCJyb2xlIjoiY2xpZW50IiwiZXhwIjoxNzQ5NjI4Mjc1fQ.iaETVk1y9Fwr8V3_IEDtllUCO-nAhBw7o5WaCU6jZOU"

# URL da rota que estava retornando 401
URL = "https://primefit-production-e300.up.railway.app/profiles?skip=0&limit=100"

# Cabeçalho com o token JWT
headers = {
    "Authorization": f"Bearer {TOKEN}"
}

# Fazendo a requisição
response = requests.get(URL, headers=headers)

# Exibindo o resultado
print("Status:", response.status_code)
print("Resposta:", response.json())
