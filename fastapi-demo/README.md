# FastAPI Demo

A demonstration project for AI-assisted development workflows.

## Overview

This is a minimal FastAPI application showcasing:
- Basic REST API structure with CRUD operations
- Pydantic models for data validation
- Configuration management
- Test setup with pytest

**Note:** This is a demo project intended for demonstrating AI capabilities in code assistance, refactoring, and feature implementation. It is not intended for production use.

## Project Structure

```
fastapi-demo/
├── main.py              # Main application with API endpoints
├── requirements.txt     # Python dependencies
├── config/
│   ├── __init__.py
│   └── settings.py      # Application configuration
└── tests/
    ├── __init__.py
    └── test_main.py     # API tests
```

## Getting Started

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python main.py
   ```
   Or with uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

4. Access the API:
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

## Running Tests

```bash
pytest tests/ -v
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/users` | List all users |
| GET | `/users/{id}` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

## Future Enhancements

This project includes TODO comments marking where additional features would be integrated:
- Rate limiting middleware
- Database integration
- Authentication/Authorization
- Logging and monitoring

## Purpose

This demo project serves as a foundation for demonstrating AI-assisted development capabilities including:
- Code generation and completion
- Refactoring suggestions
- Feature implementation
- Test writing
- Documentation generation
