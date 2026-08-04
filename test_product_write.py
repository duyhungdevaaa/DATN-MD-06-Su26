import requests
import json

PROJECT_ID = "ketnoifirebase-3a966"
API_KEY = "AIzaSyAHcBLpG_b-zdkT7wacZfD4Dfde62m8IXU"
doc_id = "prod_midi_couture"

url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/products/{doc_id}?key={API_KEY}&updateMask.fieldPaths=discount&updateMask.fieldPaths=sold"

payload = {
    "fields": {
        "discount": {"doubleValue": 25.0},
        "sold": {"integerValue": 42}
    }
}

headers = {
    "Content-Type": "application/json"
}

print("Trying to update product via REST API with API key...")
r = requests.patch(url, headers=headers, data=json.dumps(payload))
print(f"Status: {r.status_code}")
print(r.text)
