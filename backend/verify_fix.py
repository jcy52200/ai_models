import urllib.request
import urllib.parse
import json
import ssl

# Ignore SSL (localhost)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://localhost:8000/v1"

def login(username, password):
    url = f"{BASE_URL}/auth/login"
    data = json.dumps({"account": username, "password": password}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            return res_json['data']['token']
    except Exception as e:
        print(f"Login failed: {e}")
        try:
             if hasattr(e, 'read'): print(e.read().decode())
        except: pass
        return None

def upload_file(token):
    # Create dummy file content
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    data = []
    data.append(f'--{boundary}')
    data.append('Content-Disposition: form-data; name="file"; filename="test.png"')
    data.append('Content-Type: image/png')
    data.append('')
    
    # Needs to be bytes
    body_parts = []
    for item in data:
        body_parts.append(item.encode('utf-8'))
    
    # Inject binary content for "fake image" if strict check, but text is fine?
    # backend checks startsWith("image/") content-type header of the part
    # file.content_type in fastapi comes from the header
    
    body_parts[-2] = b'fakeimagecontent' # replace empty string with content
    
    # Construct body
    final_body = b''
    for part in body_parts:
        final_body += part + b'\r\n'
    final_body += f'--{boundary}--\r\n'.encode('utf-8')
    
    
    url = f"{BASE_URL}/upload"
    req = urllib.request.Request(url, data=final_body, headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': f'multipart/form-data; boundary={boundary}'
    }, method='POST')
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            print("Upload Success:", res_json)
            return True
    except urllib.error.HTTPError as e:
        print(f"Upload failed: {e.code} {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"Upload error: {e}")
        return False

# Test
print("Attempting login as testuser...")
token = login("testuser", "test123")
if token:
    print("Logged in as testuser.")
    print("Attempting upload...")
    if upload_file(token):
        print("VERIFICATION PASSED: User can upload files.")
    else:
        print("VERIFICATION FAILED: User cannot upload files.")
else:
    print("Could not login. Trying admin to ensure server is up.")
    token = login("admin", "admin123")
    if token:
         print("Admin login worked, but testuser failed. Check init_data.")
    else:
         print("Server might be down or unreachable.")
