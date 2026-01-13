"""
Tests for the FastAPI Demo application.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# =============================================================================
# Health Check Tests
# =============================================================================

@pytest.mark.anyio
async def test_health_check(client):
    """Test the health check endpoint returns healthy status."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data


@pytest.mark.anyio
async def test_root_endpoint(client):
    """Test the root endpoint returns API information."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs_url" in data


# =============================================================================
# User CRUD Tests
# =============================================================================

@pytest.mark.anyio
async def test_list_users(client):
    """Test listing all users."""
    response = await client.get("/users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2  # We have 2 seed users


@pytest.mark.anyio
async def test_get_user(client):
    """Test getting a specific user."""
    response = await client.get("/users/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "name" in data
    assert "email" in data


@pytest.mark.anyio
async def test_get_user_not_found(client):
    """Test getting a non-existent user returns 404."""
    response = await client.get("/users/9999")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_create_user(client):
    """Test creating a new user."""
    new_user = {
        "name": "Test User",
        "email": "testuser@example.com"
    }
    response = await client.post("/users", json=new_user)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == new_user["name"]
    assert data["email"] == new_user["email"]
    assert "id" in data
    assert "created_at" in data


@pytest.mark.anyio
async def test_create_user_duplicate_email(client):
    """Test creating a user with duplicate email fails."""
    # First, create a user
    new_user = {
        "name": "First User",
        "email": "duplicate@example.com"
    }
    response = await client.post("/users", json=new_user)
    assert response.status_code == 201

    # Try to create another user with the same email
    duplicate_user = {
        "name": "Second User",
        "email": "duplicate@example.com"
    }
    response = await client.post("/users", json=duplicate_user)
    assert response.status_code == 400


@pytest.mark.anyio
async def test_update_user(client):
    """Test updating an existing user."""
    update_data = {"name": "Updated Name"}
    response = await client.put("/users/1", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


@pytest.mark.anyio
async def test_delete_user(client):
    """Test deleting a user."""
    # First create a user to delete
    new_user = {
        "name": "To Delete",
        "email": "todelete@example.com"
    }
    create_response = await client.post("/users", json=new_user)
    user_id = create_response.json()["id"]

    # Delete the user
    delete_response = await client.delete(f"/users/{user_id}")
    assert delete_response.status_code == 204

    # Verify the user is gone
    get_response = await client.get(f"/users/{user_id}")
    assert get_response.status_code == 404


# =============================================================================
# TODO: Rate Limiting Tests
# =============================================================================

# @pytest.mark.anyio
# async def test_rate_limiting(client):
#     """Test that rate limiting is enforced."""
#     # Make requests until rate limit is hit
#     for i in range(15):
#         response = await client.get("/health")
#         if response.status_code == 429:
#             # Rate limit hit as expected
#             assert "Retry-After" in response.headers
#             return
#
#     # If we get here, rate limiting might not be enabled
#     pytest.skip("Rate limiting not enabled or limit not reached")
