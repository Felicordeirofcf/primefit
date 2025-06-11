from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "sua_chave_secreta"
ALGORITHM = "HS256"

def gerar_token():
    dados = {
        "sub": "feliipefcf@gmail.com",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(dados, SECRET_KEY, algorithm=ALGORITHM)
    print(token)

gerar_token()