from dotenv import load_dotenv
import os

load_dotenv()

print("Environment variables:")
print(f"POSTGRES_USER: {os.getenv('POSTGRES_USER')}")
print(f"POSTGRES_PASSWORD: {os.getenv('POSTGRES_PASSWORD')}")
print(f"POSTGRES_SERVER: {os.getenv('POSTGRES_SERVER')}")
print(f"POSTGRES_PORT: {os.getenv('POSTGRES_PORT')}")
print(f"POSTGRES_DB: {os.getenv('POSTGRES_DB')}")