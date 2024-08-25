import secrets

# Generate a 256-bit (32-byte) secret key
jwt_secret_key = secrets.token_hex(32)
print(jwt_secret_key)
