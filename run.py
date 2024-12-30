from database.models import Base
from database.session import engine
import uvicorn

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    
    print("Starting FastAPI server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )