import json
import time
import requests
import jwt

# Load service account JSON info
print("Loading service account info...")
with open('ketnoifirebase-3a966-firebase-adminsdk-fbsvc-38f26035d7.json') as f:
    info = json.load(f)

private_key = info['private_key']
client_email = info['client_email']
private_key_id = info['private_key_id']
project_id = info['project_id']

# Generate signed JWT manually with a -15 minute (900 seconds) clock offset
print("Generating signed JWT assertion with time offset...")
now = int(time.time())
payload = {
    "iss": client_email,
    "scope": "https://www.googleapis.com/auth/datastore",
    "aud": "https://oauth2.googleapis.com/token",
    "iat": now - 900,  # Offset by 15 minutes to compensate for local clock drift
    "exp": now + 2700
}
headers = {
    "kid": private_key_id
}

assertion = jwt.encode(payload, private_key, algorithm='RS256', headers=headers)

# Request access token
print("Exchanging JWT for OAuth access token...")
token_url = "https://oauth2.googleapis.com/token"
data = {
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "assertion": assertion
}
r_token = requests.post(token_url, data=data)
if r_token.status_code != 200:
    print(f"[ERROR] Failed to obtain access token: {r_token.status_code} - {r_token.text}")
    exit(1)

token_data = r_token.json()
token = token_data.get('access_token')
print("[SUCCESS] OAuth access token acquired.")

# Firestore REST API URL
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/products"
req_headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 1. Fetch all products
print("Fetching all products via Firestore REST API...")
r_products = requests.get(base_url, headers=req_headers)
if r_products.status_code != 200:
    print(f"[ERROR] Failed to fetch products: {r_products.status_code} - {r_products.text}")
    exit(1)

res_json = r_products.json()
documents = res_json.get('documents', [])
print(f"Found {len(documents)} products.")

# 2. Update each product
for doc in documents:
    doc_path = doc.get('name')  # projects/{project_id}/databases/(default)/documents/products/{doc_id}
    doc_id = doc_path.split('/')[-1]
    
    # Retrieve current fields
    fields = doc.get('fields', {})
    product_name_field = fields.get('name', {})
    product_name = product_name_field.get('stringValue', '')
    
    # Determine discount and sold values based on name
    discount = 0.0
    sold = 5
    if product_name:
        lower = product_name.lower()
        if 'kính' in lower or 'oversized' in lower or 'sandal' in lower or 'kiểu' in lower:
            discount = 20.0
            sold = 85
        elif 'short' in lower or 'jean' in lower or 'thun' in lower:
            discount = 10.0
            sold = 120
        elif 'đầm' in lower or 'midi' in lower or 'lụa' in lower or 'váy' in lower:
            discount = 15.0
            sold = 95
        else:
            discount = 0.0
            sold = 15
            
    print(f"Updating product {doc_id} ({product_name}): discount={discount}, sold={sold}")
    
    # Firestore REST PATCH payload
    payload = {
        "fields": {
            "discount": {"doubleValue": discount},
            "sold": {"integerValue": sold}
        }
    }
    
    # We patch the document using updateMask to only update discount and sold
    patch_url = f"https://firestore.googleapis.com/v1/{doc_path}?updateMask.fieldPaths=discount&updateMask.fieldPaths=sold"
    r_patch = requests.patch(patch_url, headers=req_headers, json=payload)
    if r_patch.status_code == 200:
        print(f"Successfully updated {doc_id}")
    else:
        print(f"Failed to update {doc_id}: {r_patch.status_code} - {r_patch.text}")

print("[FINISHED] All updates completed successfully!")
