import requests
import json
import time

PROJECT_ID = "ketnoifirebase-3a966"
API_KEY = "AIzaSyAHcBLpG_b-zdkT7wacZfD4Dfde62m8IXU"
COLLECTION = "reviews"

url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}?key={API_KEY}"

# Dữ liệu giả lập 1 bình luận
current_time_ms = int(time.time() * 1000)
payload = {
    "fields": {
        "productId": {"stringValue": "test_product_123"},
        "userId": {"stringValue": "user_python_01"},
        "userName": {"stringValue": "Bot Tester (Python)"},
        "rating": {"doubleValue": 5.0},
        "comment": {"stringValue": "Sản phẩm quá tuyệt vời! Đây là bình luận được tự động push từ script Python để test."},
        "timestamp": {"integerValue": str(current_time_ms)}
    }
}

headers = {
    "Content-Type": "application/json"
}

print(f"Đang gửi request lên Firestore ({PROJECT_ID})...")
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
response = requests.post(url, headers=headers, data=json.dumps(payload), verify=False)

if response.status_code == 200:
    print("✅ TEST THÀNH CÔNG: Đã ghi 1 bình luận mới lên Firestore!")
    print("Dữ liệu phản hồi:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
else:
    print(f"❌ TEST THẤT BẠI: Lỗi {response.status_code}")
    print(response.text)
