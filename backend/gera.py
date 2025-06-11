from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "f2d2285a38834b5ca43cd70f00ccbd0d06227304aedd57ea"
ALGORITHM = "HS256"

payload = {
    "sub": "feliipefcf@gmail.com",
    "user_id": "ed59772d-b745-4d46-a954-acf89ec4652f",  # <- substitua pelo ID correto
    "role": "client",
    "exp": datetime.utcnow() + timedelta(hours=2)
}

token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

print("TOKEN JWT GERADO:")
print(token)