import secrets

# Gera uma string hexadecimal de 32 bytes (64 caracteres)
secret_key = secrets.token_hex(32)
print(secret_key)
