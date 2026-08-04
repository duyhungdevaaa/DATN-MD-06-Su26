import requests
import json

PROJECT_ID = "ketnoifirebase-3a966"
API_KEY = "AIzaSyAHcBLpG_b-zdkT7wacZfD4Dfde62m8IXU"
url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/products?key={API_KEY}"

r = requests.get(url)
print(f"Status: {r.status_code}")
if r.status_code == 200:
    res = r.json()
    docs = res.get('documents', [])
    for doc in docs:
        fields = doc.get('fields', {})
        name = fields.get('name', {}).get('stringValue', '')
        discount = fields.get('discount', {}).get('doubleValue', fields.get('discount', {}).get('integerValue', 'N/A'))
        sold = fields.get('sold', {}).get('integerValue', 'N/A')
        
        safe_name = name.encode('ascii', errors='replace').decode('ascii')
        print(f"Product: {safe_name} | discount: {discount} | sold: {sold}")
