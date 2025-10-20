def test_signup_and_unregister_flow(client):
    activity = 'Swimming Club'
    email = 'teststudent@mergington.edu'

    # Ensure not already present
    res_before = client.get('/activities')
    assert res_before.status_code == 200
    assert email not in res_before.json()[activity]['participants']

    # Signup
    signup_res = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert signup_res.status_code == 200
    assert 'Signed up' in signup_res.json().get('message', '')

    # Verify added
    res_after = client.get('/activities')
    assert email in res_after.json()[activity]['participants']

    # Unregister
    del_res = client.delete(f"/activities/{activity}/participants", params={"email": email})
    assert del_res.status_code == 200
    assert 'Unregistered' in del_res.json().get('message', '')

    # Verify removed
    res_final = client.get('/activities')
    assert email not in res_final.json()[activity]['participants']
