import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('ketnoifirebase-3a966-firebase-adminsdk-fbsvc-38f26035d7.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

print("Connection ok. Trying to write to test_col...")
try:
    db.collection('test_col').document('test_doc').set({'test_key': 'test_val'})
    print("Write success!")
except Exception as e:
    print(f"Write error: {e}")
