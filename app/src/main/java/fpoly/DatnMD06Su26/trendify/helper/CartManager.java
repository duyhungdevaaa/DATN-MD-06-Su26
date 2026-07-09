package fpoly.DatnMD06Su26.trendify.helper;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Transaction;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestoreException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

public class CartManager {

    private static final String COLLECTION_USERS = "users";
    private static final String COLLECTION_CART  = "cart";

    private final FirebaseFirestore db;
    private final String userId;

    public interface CartCallback {
        void onSuccess();
        void onFailure(String error);
    }

    public interface CartLoadCallback {
        void onLoaded(List<CartItem> items);
        void onFailure(String error);
    }

    public CartManager() {
        db = FirebaseFirestore.getInstance();
        if (SessionManager.getInstance().isLoggedIn()) {
            userId = SessionManager.getInstance().getUserId();
        } else {
            userId = null;
        }
    }

    private boolean ensureAuthenticated(CartCallback callback) {
        if (userId == null) {
            if (callback != null) callback.onFailure("Vui lòng đăng nhập để sử dụng giỏ hàng");
            return false;
        }
        return true;
    }

    private boolean ensureAuthenticated(CartLoadCallback callback) {
        if (userId == null) {
            if (callback != null) callback.onFailure("Vui lòng đăng nhập để sử dụng giỏ hàng");
            return false;
        }
        return true;
    }

    // Đường dẫn: users/{uid}/cart/{productId}
    private DocumentReference cartItemRef(String productId) {
        return db.collection(COLLECTION_USERS)
                .document(userId)
                .collection(COLLECTION_CART)
                .document(productId);
    }

    // Thêm hoặc tăng số lượng sản phẩm trong giỏ
    public void addToCart(CartItem item, CartCallback callback) {
        if (!ensureAuthenticated(callback)) return;
        if (item == null || item.getProductId() == null || item.getProductId().isEmpty()) {
            if (callback != null) callback.onFailure("Sản phẩm không hợp lệ");
            return;
        }
        db.runTransaction((Transaction.Function<Void>) transaction -> {
            DocumentSnapshot productSnap = transaction.get(db.collection("products").document(item.getProductId()));
            if (!productSnap.exists()) throw new FirebaseFirestoreException("Sản phẩm không tồn tại", FirebaseFirestoreException.Code.ABORTED);
            
            long maxStock = productSnap.getLong("quantity") != null ? productSnap.getLong("quantity") : 0;
            List<Map<String, Object>> variants = (List<Map<String, Object>>) productSnap.get("variants");
            if (variants != null && !variants.isEmpty()) {
                for (Map<String, Object> var : variants) {
                    String vSize = (String) var.get("size");
                    String vColor = (String) var.get("color");
                    boolean matchSize = item.getSize() == null || item.getSize().isEmpty() || item.getSize().equalsIgnoreCase(vSize);
                    boolean matchColor = item.getColor() == null || item.getColor().isEmpty() || item.getColor().equalsIgnoreCase(vColor);
                    if (matchSize && matchColor) {
                        maxStock = var.get("quantity") != null ? ((Number)var.get("quantity")).longValue() : 0;
                        break;
                    }
                }
            }
            
            DocumentSnapshot snapshot = transaction.get(cartItemRef(item.getCartItemId()));
            long current = 0;
            if (snapshot.exists()) {
                Long currentLong = snapshot.getLong("quantity");
                current = currentLong != null ? currentLong : 0;
            }
            
            long requestQty = current + item.getQuantity();
            if (requestQty > maxStock) {
                throw new FirebaseFirestoreException("Số lượng tồn kho không đủ (còn " + maxStock + ")", FirebaseFirestoreException.Code.ABORTED);
            }
            
            if (snapshot.exists()) {
                transaction.update(cartItemRef(item.getCartItemId()), "quantity", requestQty);
            } else {
                if (item.getQuantity() <= 0) {
                    item.setQuantity(1);
                }
                transaction.set(cartItemRef(item.getCartItemId()), item);
            }
            return null;
        }).addOnSuccessListener(v -> callback.onSuccess())
          .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    // Xóa 1 sản phẩm khỏi giỏ
    public void removeFromCart(String productId, CartCallback callback) {
        cartItemRef(productId).delete()
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    // Cập nhật số lượng
    public void updateQuantity(String productId, int newQty, CartCallback callback) {
        if (!ensureAuthenticated(callback)) return;
        if (productId == null || productId.isEmpty()) {
            callback.onFailure("Sản phẩm không hợp lệ");
            return;
        }
        if (newQty <= 0) {
            removeFromCart(productId, callback);
            return;
        }
        db.runTransaction((Transaction.Function<Void>) transaction -> {
            DocumentSnapshot cartSnap = transaction.get(cartItemRef(productId));
            if (!cartSnap.exists()) throw new FirebaseFirestoreException("Sản phẩm không có trong giỏ", FirebaseFirestoreException.Code.ABORTED);
            CartItem cartItem = cartSnap.toObject(CartItem.class);
            if (cartItem == null) throw new FirebaseFirestoreException("Lỗi dữ liệu", FirebaseFirestoreException.Code.ABORTED);
            
            DocumentSnapshot productSnap = transaction.get(db.collection("products").document(cartItem.getProductId()));
            if (!productSnap.exists()) throw new FirebaseFirestoreException("Sản phẩm không tồn tại", FirebaseFirestoreException.Code.ABORTED);
            
            long maxStock = productSnap.getLong("quantity") != null ? productSnap.getLong("quantity") : 0;
            List<Map<String, Object>> variants = (List<Map<String, Object>>) productSnap.get("variants");
            if (variants != null && !variants.isEmpty()) {
                for (Map<String, Object> var : variants) {
                    String vSize = (String) var.get("size");
                    String vColor = (String) var.get("color");
                    boolean matchSize = cartItem.getSize() == null || cartItem.getSize().isEmpty() || cartItem.getSize().equalsIgnoreCase(vSize);
                    boolean matchColor = cartItem.getColor() == null || cartItem.getColor().isEmpty() || cartItem.getColor().equalsIgnoreCase(vColor);
                    if (matchSize && matchColor) {
                        maxStock = var.get("quantity") != null ? ((Number)var.get("quantity")).longValue() : 0;
                        break;
                    }
                }
            }
            if (newQty > maxStock) {
                throw new FirebaseFirestoreException("Số lượng kho chỉ còn " + maxStock, FirebaseFirestoreException.Code.ABORTED);
            }
            
            transaction.update(cartItemRef(productId), "quantity", newQty);
            return null;
        }).addOnSuccessListener(v -> callback.onSuccess())
          .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    // Load toàn bộ giỏ hàng
    public void loadCart(CartLoadCallback callback) {
        if (!ensureAuthenticated(callback)) return;
        db.collection(COLLECTION_USERS)
                .document(userId)
                .collection(COLLECTION_CART)
                .get()
                .addOnSuccessListener(snapshot -> {
                    List<CartItem> items = new ArrayList<>();
                    for (var doc : snapshot.getDocuments()) {
                        CartItem item = doc.toObject(CartItem.class);
                        if (item != null) items.add(item);
                    }
                    callback.onLoaded(items);
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    // Xóa toàn bộ giỏ sau khi đặt hàng thành công
    public void clearCart(CartCallback callback) {
        if (!ensureAuthenticated(callback)) return;
        db.collection(COLLECTION_USERS).document(userId)
                .collection(COLLECTION_CART).get()
                .addOnSuccessListener(snapshot -> {
                    var batch = db.batch();
                    for (var doc : snapshot.getDocuments()) {
                        batch.delete(doc.getReference());
                    }
                    batch.commit()
                            .addOnSuccessListener(v -> callback.onSuccess())
                            .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }
}
