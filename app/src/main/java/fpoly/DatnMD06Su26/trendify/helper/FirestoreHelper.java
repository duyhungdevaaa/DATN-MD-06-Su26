package fpoly.DatnMD06Su26.trendify.helper;

import androidx.annotation.NonNull;
import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.model.UserProfile;
import fpoly.DatnMD06Su26.trendify.model.Voucher;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;

public class FirestoreHelper {

    private static final String COLLECTION_USERS = "users";

    public interface SimpleCallback {
        void onSuccess();
        void onFailure(String error);
    }

    public interface VoucherCallback {
        void onLoaded(Voucher voucher);
        void onFailure(String error);
    }

    private static String getCurrentUserId() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IllegalStateException("Người dùng chưa đăng nhập");
        }
        return SessionManager.getInstance().getUserId();
    }

    private static FirebaseFirestore getDb() {
        return FirebaseFirestore.getInstance();
    }

    private static CollectionReference getUsersCollection() {
        return getDb().collection(COLLECTION_USERS);
    }

    public static void saveUserProfile(@NonNull UserProfile profile, @NonNull SimpleCallback callback) {
        getUsersCollection().document(getCurrentUserId())
                .set(profile)
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void validateVoucher(@NonNull String code, @NonNull VoucherCallback callback) {
        getDb().collection("vouchers")
                .whereEqualTo("code", code)
                .limit(1)
                .get()
                .addOnSuccessListener(snapshot -> {
                    if (snapshot.isEmpty()) {
                        callback.onFailure("Voucher không tồn tại");
                        return;
                    }
                    DocumentSnapshot document = snapshot.getDocuments().get(0);
                    Voucher voucher = Voucher.fromDocument(document);
                    if (voucher.isExpired()) {
                        callback.onFailure("Voucher đã hết hạn");
                        return;
                    }
                    callback.onLoaded(voucher);
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }
}
