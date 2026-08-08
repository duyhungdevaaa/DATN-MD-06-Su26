import json
import requests
import google.auth
import google.auth.transport.requests
from google.oauth2 import service_account

# Load credentials
print("Loading service account credentials...")
creds = service_account.Credentials.from_service_account_file(
    'ketnoifirebase-3a966-firebase-adminsdk-fbsvc-38f26035d7.json',
    scopes=['https://www.googleapis.com/auth/datastore']
)

# Refresh credentials to get access token
print("Requesting OAuth access token...")
auth_req = google.auth.transport.requests.Request()
creds.refresh(auth_req)
token = creds.token
print("Token acquired successfully.")

project_id = creds.project_id
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/products"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 1. Fetch all products
print("Fetching all products via Firestore REST API...")
r = requests.get(base_url, headers=headers)
if r.status_code != 200:
    print(f"Error fetching products: {r.status_code} - {r.text}")
    exit(1)

res_json = r.json()
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
    # We use doubleValue for discount, and integerValue for sold
    payload = {
        "fields": {
            "discount": {"doubleValue": discount},
            "sold": {"integerValue": sold}
        }
    }
    
    # We patch the document using updateMask to only update discount and sold
    patch_url = f"https://firestore.googleapis.com/v1/{doc_path}?updateMask.fieldPaths=discount&updateMask.fieldPaths=sold"
    r_patch = requests.patch(patch_url, headers=headers, json=payload)
    if r_patch.status_code == 200:
        print(f"Successfully updated {doc_id}")
    else:
        print(f"Failed to update {doc_id}: {r_patch.status_code} - {r_patch.text}")

print("All updates completed successfully!")
