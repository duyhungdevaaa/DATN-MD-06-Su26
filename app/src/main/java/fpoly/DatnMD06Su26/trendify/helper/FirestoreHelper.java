package fpoly.DatnMD06Su26.trendify.helper;

import androidx.annotation.NonNull;
import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.model.UserProfile;
import fpoly.DatnMD06Su26.trendify.model.UserAddress;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.DocumentReference;
import java.util.List;
import java.util.ArrayList;

public class FirestoreHelper {

    private static final String COLLECTION_USERS = "users";
    private static final String SUBCOLLECTION_ADDRESSES = "addresses";

    public interface SimpleCallback {
        void onSuccess();
        void onFailure(String error);
    }

    public interface AddressesCallback {
        void onLoaded(List<UserAddress> addresses);
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

    private static CollectionReference getAddressesCollection() {
        return getUsersCollection().document(getCurrentUserId()).collection(SUBCOLLECTION_ADDRESSES);
    }

    public static void saveUserProfile(@NonNull UserProfile profile, @NonNull SimpleCallback callback) {
        getUsersCollection().document(getCurrentUserId())
                .set(profile)
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void loadAddresses(@NonNull AddressesCallback callback) {
        getAddressesCollection()
                .get()
                .addOnSuccessListener(snapshot -> {
                    List<UserAddress> addresses = new ArrayList<>();
                    for (DocumentSnapshot document : snapshot.getDocuments()) {
                        UserAddress address = document.toObject(UserAddress.class);
                        if (address != null) {
                            address.setId(document.getId());
                            addresses.add(address);
                        }
                    }
                    callback.onLoaded(addresses);
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void saveAddress(@NonNull UserAddress address, @NonNull SimpleCallback callback) {
        if (address.getId() == null || address.getId().isEmpty()) {
            DocumentReference newRef = getAddressesCollection().document();
            address.setId(newRef.getId());
            newRef.set(address)
                    .addOnSuccessListener(v -> callback.onSuccess())
                    .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
        } else {
            getAddressesCollection().document(address.getId())
                    .set(address)
                    .addOnSuccessListener(v -> callback.onSuccess())
                    .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
        }
    }

    public static void deleteAddress(@NonNull String addressId, @NonNull SimpleCallback callback) {
        getAddressesCollection().document(addressId)
                .delete()
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }
}
