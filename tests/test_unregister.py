from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_unregister_participant():
    activity = 'Chess Club'
    email = 'michael@mergington.edu'
    assert email in activities[activity]['participants']

    res = client.delete(f"/activities/{activity}/participants", params={"email": email})
    assert res.status_code == 200
    assert 'Unregistered' in res.json().get('message', '')
    assert email not in activities[activity]['participants']

    # try deleting again -> should 404
    res2 = client.delete(f"/activities/{activity}/participants", params={"email": email})
    assert res2.status_code == 404
