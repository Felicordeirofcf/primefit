from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "f2d2285a38834b5ca43cd70f00ccbd0d06227304aedd57ea"
ALGORITHM = "HS256"

payload = {
    "sub": "feliipefcf@gmail.com",
    "user_id": "82d8a6f5-9454-489e-b84f-21245217565b",  # <- substitua pelo ID correto
    "role": "client",
    "exp": datetime.utcnow() + timedelta(hours=2)
}

token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

print("TOKEN JWT GERADO:")
print(token)