def test_get_activities(client):
    res = client.get('/activities')
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    # Expect some known activities present
    assert 'Chess Club' in data
    assert 'Programming Class' in data
