#!/usr/bin/env python3
import requests
import json

# Test the deployed API
API_URL = "https://smartchain-ai-backend-imvu.onrender.com"

def test_api():
    print("🔍 Testing deployed API...")
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Test login endpoint
    print("\n2. Testing login endpoint...")
    try:
        # Test with admin credentials
        login_data = {
            "username": "admin@smartchain.com",
            "password": "admin123"
        }
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Login successful!")
            print(f"   Token: {data.get('access_token', 'No token')[:20]}...")
        else:
            print(f"   ❌ Login failed")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Test signup endpoint
    print("\n3. Testing signup endpoint...")
    try:
        signup_data = {
            "email": "test@example.com",
            "password": "test123",
            "username": "testuser",
            "name": "Test User"
        }
        response = requests.post(f"{API_URL}/auth/signup", json=signup_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Signup successful!")
            print(f"   Token: {data.get('access_token', 'No token')[:20]}...")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Test with username login
    print("\n4. Testing login with username...")
    try:
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{API_URL}/auth/login", data=login_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Login with username successful!")
            print(f"   Token: {data.get('access_token', 'No token')[:20]}...")
        else:
            print(f"   ❌ Login with username failed")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    test_api() 