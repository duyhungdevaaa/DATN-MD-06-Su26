package fpoly.DatnMD06Su26.trendify.helper;

import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.model.CartItem;

import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
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
    // Đường dẫn Firestore: users/{uid}/cart/{productId}
    private DocumentReference cartItemRef(String productId) {
        return db.collection(COLLECTION_USERS)
                .document(userId)
                .collection(COLLECTION_CART)
                .document(productId);
    }

    // Thêm hoặc tăng số lượng sản phẩm trong giỏ
    // Thêm sản phẩm mới hoặc tăng số lượng nếu đã tồn tại trong giỏ hàng
    public void addToCart(CartItem item, CartCallback callback) {
        if (!ensureAuthenticated(callback)) return;
        if (item == null || item.getProductId() == null || item.getProductId().isEmpty()) {
            if (callback != null) callback.onFailure("Sản phẩm không hợp lệ");
            return;
        }
        cartItemRef(item.getCartItemId()).get()
                .addOnSuccessListener(snapshot -> {
                    if (snapshot.exists()) {
                        Long currentLong = snapshot.getLong("quantity");
                        int current = currentLong != null ? currentLong.intValue() : 0;
                        cartItemRef(item.getCartItemId())
                                .update("quantity", current + 1)
                                .addOnSuccessListener(v -> callback.onSuccess())
                                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
                    } else {
                        if (item.getQuantity() <= 0) {
                            item.setQuantity(1);
                        }
                        cartItemRef(item.getCartItemId())
                                .set(item)
                                .addOnSuccessListener(v -> callback.onSuccess())
                                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
                    }
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    // Xóa 1 sản phẩm khỏi giỏ
    // Xóa sản phẩm khỏi giỏ hàng
    public void removeFromCart(String productId, CartCallback callback) {
        cartItemRef(productId).delete()
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    // Cập nhật số lượng
    // Cập nhật số lượng của một sản phẩm trong giỏ hàng
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
        cartItemRef(productId).update("quantity", newQty)
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    // Load toàn bộ giỏ hàng
    // Tải danh sách sản phẩm trong giỏ hàng của người dùng hiện tại
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
    // Xóa sạch toàn bộ giỏ hàng của người dùng (gọi khi đặt hàng thành công)
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
