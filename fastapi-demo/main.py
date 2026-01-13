"""
FastAPI Demo Application
A simple API demonstrating basic CRUD operations and project structure.
This is a demo project for AI-assisted development demonstrations.
"""

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from config.settings import settings

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Demo API for AI-assisted development",
    version="0.1.0",
)

# TODO: Add rate limiting middleware here
# Example integration point for rate limiting:
# from slowapi import Limiter, _rate_limit_exceeded_handler
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded
#
# limiter = Limiter(key_func=get_remote_address)
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# =============================================================================
# Models
# =============================================================================

class UserBase(BaseModel):
    """Base user model with common fields."""
    name: str
    email: EmailStr


class UserCreate(UserBase):
    """Model for creating a new user."""
    pass


class UserUpdate(BaseModel):
    """Model for updating an existing user."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class User(UserBase):
    """Complete user model with all fields."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# =============================================================================
# In-memory database (for demo purposes)
# =============================================================================

# Simple in-memory storage - replace with real database in production
fake_db: dict[int, dict] = {
    1: {"id": 1, "name": "Alice Johnson", "email": "alice@example.com", "created_at": datetime.now()},
    2: {"id": 2, "name": "Bob Smith", "email": "bob@example.com", "created_at": datetime.now()},
}
next_id = 3


# =============================================================================
# Endpoints
# =============================================================================

@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns the current status of the API.

    TODO: Add rate limiting decorator here
    # @limiter.limit("10/minute")
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0",
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to the FastAPI Demo",
        "docs_url": "/docs",
        "health_url": "/health",
    }


# -----------------------------------------------------------------------------
# User CRUD Endpoints
# -----------------------------------------------------------------------------

@app.get("/users", response_model=list[User])
async def list_users():
    """
    List all users.

    TODO: Add rate limiting decorator here
    # @limiter.limit("30/minute")
    """
    return [User(**user) for user in fake_db.values()]


@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    """
    Get a specific user by ID.

    TODO: Add rate limiting decorator here
    # @limiter.limit("60/minute")
    """
    if user_id not in fake_db:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**fake_db[user_id])


@app.post("/users", response_model=User, status_code=201)
async def create_user(user: UserCreate):
    """
    Create a new user.

    TODO: Add rate limiting decorator here (stricter limit for writes)
    # @limiter.limit("10/minute")
    """
    global next_id

    # Check for duplicate email
    for existing_user in fake_db.values():
        if existing_user["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "id": next_id,
        "name": user.name,
        "email": user.email,
        "created_at": datetime.now(),
    }
    fake_db[next_id] = new_user
    next_id += 1

    return User(**new_user)


@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_update: UserUpdate):
    """
    Update an existing user.

    TODO: Add rate limiting decorator here
    # @limiter.limit("20/minute")
    """
    if user_id not in fake_db:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = fake_db[user_id]

    if user_update.name is not None:
        existing_user["name"] = user_update.name
    if user_update.email is not None:
        # Check for duplicate email
        for uid, u in fake_db.items():
            if uid != user_id and u["email"] == user_update.email:
                raise HTTPException(status_code=400, detail="Email already registered")
        existing_user["email"] = user_update.email

    return User(**existing_user)


@app.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int):
    """
    Delete a user.

    TODO: Add rate limiting decorator here (stricter limit for destructive operations)
    # @limiter.limit("5/minute")
    """
    if user_id not in fake_db:
        raise HTTPException(status_code=404, detail="User not found")

    del fake_db[user_id]
    return None


# =============================================================================
# Startup/Shutdown Events
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    print(f"Starting {settings.APP_NAME}...")
    # TODO: Initialize rate limiter storage (e.g., Redis connection)
    # await limiter.init()


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    print(f"Shutting down {settings.APP_NAME}...")
    # TODO: Close rate limiter connections
    # await limiter.close()


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
