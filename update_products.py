import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

try:
    cred = credentials.Certificate('ketnoifirebase-3a966-firebase-adminsdk-fbsvc-38f26035d7.json')
    firebase_admin.initialize_app(cred)
    print("[SUCCESS] Connected to Firebase Admin SDK.")
except Exception as e:
    print(f"[ERROR] Connection error: {e}")
    exit(1)

db = firestore.client()

print("Updating product documents with real discount and sold values...")
try:
    docs = db.collection('products').stream()
    count = 0
    for doc in docs:
        data = doc.to_dict()
        name = data.get('name', '')
        updates = {}
        
        # Decide discount and sold count based on the product name
        if name:
            lower = name.lower()
            if 'kính' in lower or 'oversized' in lower or 'sandal' in lower or 'kiểu' in lower:
                updates['discount'] = 20.0
                updates['sold'] = 85
            elif 'short' in lower or 'jean' in lower or 'thun' in lower:
                updates['discount'] = 10.0
                updates['sold'] = 120
            elif 'đầm' in lower or 'midi' in lower or 'lụa' in lower or 'váy' in lower:
                updates['discount'] = 15.0
                updates['sold'] = 95
            else:
                updates['discount'] = 0.0
                updates['sold'] = 15
        else:
            updates['discount'] = 0.0
            updates['sold'] = 5
            
        db.collection('products').document(doc.id).update(updates)
        # Convert name to safe encoding or ascii representation to avoid console crashes
        safe_name = name.encode('ascii', errors='replace').decode('ascii')
        print(f"[OK] Updated product {doc.id} ({safe_name}): discount={updates['discount']}, sold={updates['sold']}")
        count += 1
    print(f"[FINISHED] Update completed! Updated {count} products.")
except Exception as e:
    print(f"[ERROR] Error during update: {e}")
