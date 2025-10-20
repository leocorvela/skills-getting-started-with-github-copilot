from fastapi.testclient import TestClient
import pytest

from src.app import app, activities


@pytest.fixture
def client():
    # provide a TestClient for tests; activities is in-memory
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def reset_activities():
    # make a shallow copy of participants to restore after tests
    orig = {k: list(v["participants"]) for k, v in activities.items()}
    yield
    # restore
    for k, v in orig.items():
        activities[k]["participants"] = v
