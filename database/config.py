from pydantic import BaseSettings

class DatabaseConfig(BaseSettings):
    """Database configuration settings"""
    HOST: str = "localhost"
    PORT: int = 5432
    USER: str = "postgres"
    PASSWORD: str = "postgres"
    DATABASE: str = "delilah_agentic"
    
    @property
    def url(self) -> str:
        """Get database URL"""
        return f"postgresql://{self.USER}:{self.PASSWORD}@{self.HOST}:{self.PORT}/{self.DATABASE}"
    
    class Config:
        env_prefix = "DB_"  # Prefix for environment variables