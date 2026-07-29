import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time

# Khởi tạo Firebase Admin với file JSON
try:
    cred = credentials.Certificate('ketnoifirebase-3a966-firebase-adminsdk-fbsvc-38f26035d7.json')
    firebase_admin.initialize_app(cred)
    print("✅ Đã kết nối Firebase Admin SDK.")
except Exception as e:
    print(f"❌ Lỗi kết nối Admin SDK: {e}")
    exit(1)

db = firestore.client()
current_time_ms = int(time.time() * 1000)

# Dữ liệu đánh giá giả lập
data = {
    'productId': 'test_product_python',
    'userId': 'admin_python',
    'userName': 'Python Admin Tester',
    'rating': 5.0,
    'comment': 'Đây là đánh giá test với quyền Admin SDK. Chúc mừng bạn đã kết nối thành công!',
    'timestamp': current_time_ms
}

print("Đang đẩy dữ liệu lên Firestore...")
try:
    doc_ref = db.collection('reviews').document()
    doc_ref.set(data)
    print(f"✅ GHI DỮ LIỆU THÀNH CÔNG!")
    print(f"Document ID vừa được tạo: {doc_ref.id}")
    print(f"Nội dung: {data['comment']}")
except Exception as e:
    print(f"❌ Lỗi khi ghi dữ liệu: {e}")
