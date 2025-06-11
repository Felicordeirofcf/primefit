import requests

# Coloque aqui o seu token válido (sem < > e sem aspas extras)
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZWxpaXBlZmNmQGdtYWlsLmNvbSIsImV4cCI6MTc0OTYyNzU2OX0.o4tOH5cGJ8qgbAzLqyldAQQ7D2NQHattAdIRHJgy3rY"

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
