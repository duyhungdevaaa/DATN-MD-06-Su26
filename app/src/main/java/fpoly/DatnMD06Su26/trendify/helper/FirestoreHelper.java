package fpoly.DatnMD06Su26.trendify.helper;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import androidx.annotation.NonNull;

import com.google.firebase.Timestamp;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FieldPath;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.SetOptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FirestoreHelper {

    private static final String COLLECTION_USERS = "users";
    private static final String COLLECTION_CATEGORIES = "categories";
    private static final String COLLECTION_PRODUCTS = "products";
    private static final String SUBCOLLECTION_ADDRESSES = "addresses";
    private static final String SUBCOLLECTION_FAVORITES = "favorites";

    public interface SimpleCallback {
        void onSuccess();
        void onFailure(String error);
    }

    public interface FavoriteIdsCallback {
        void onLoaded(List<String> favoriteIds);
        void onFailure(String error);
    }

    public interface ProfileCallback {
        void onLoaded(UserProfile profile);
        void onFailure(String error);
    }

    public interface AddressesCallback {
        void onLoaded(List<UserAddress> addresses);
        void onFailure(String error);
    }

    public interface VoucherCallback {
        void onLoaded(Voucher voucher);
        void onFailure(String error);
    }

    public interface CategoriesCallback {
        void onLoaded(List<CategoryItem> categories);
        void onFailure(String error);
    }

    public interface ProductsCallback {
        void onLoaded(List<ProductItem> products);
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

    private static CollectionReference getFavoritesCollection() {
        return getUsersCollection().document(getCurrentUserId()).collection(SUBCOLLECTION_FAVORITES);
    }

    public static void saveUserProfile(@NonNull UserProfile profile, @NonNull SimpleCallback callback) {
        getUsersCollection().document(getCurrentUserId())
                .set(profile)
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void loadFavoriteIds(@NonNull FavoriteIdsCallback callback) {
        getFavoritesCollection()
                .get()
                .addOnSuccessListener(snapshot -> {
                    List<String> favoriteIds = new ArrayList<>();
                    for (DocumentSnapshot document : snapshot.getDocuments()) {
                        favoriteIds.add(document.getId());
                    }
                    android.util.Log.d("FirestoreHelper", "loadFavoriteIds success: ids=" + favoriteIds);
                    callback.onLoaded(favoriteIds);
                })
                .addOnFailureListener(e -> {
                    android.util.Log.e("FirestoreHelper", "loadFavoriteIds failure: " + e.getMessage());
                    callback.onFailure(e.getMessage());
                });
    }

    public static void loadFavoriteProducts(@NonNull ProductsCallback callback) {
        loadFavoriteIds(new FavoriteIdsCallback() {
            @Override
            public void onLoaded(List<String> favoriteIds) {
                if (favoriteIds.isEmpty()) {
                    callback.onLoaded(new ArrayList<>());
                    return;
                }
                loadProductsByIds(favoriteIds, callback);
            }

            @Override
            public void onFailure(String error) {
                callback.onFailure(error);
            }
        });
    }

    private static void loadProductsByIds(@NonNull List<String> ids, @NonNull ProductsCallback callback) {
        android.util.Log.d("FirestoreHelper", "loadProductsByIds: querying products for ids=" + ids);
        if (ids.isEmpty()) {
            callback.onLoaded(new ArrayList<>());
            return;
        }
        if (ids.size() <= 10) {
            getDb().collection(COLLECTION_PRODUCTS)
                    .whereIn(FieldPath.documentId(), ids)
                    .get()
                    .addOnSuccessListener(snapshot -> {
                        List<ProductItem> parsed = parseProducts(snapshot);
                        android.util.Log.d("FirestoreHelper", "loadProductsByIds success: returning " + parsed.size() + " products");
                        callback.onLoaded(parsed);
                    })
                    .addOnFailureListener(e -> {
                        android.util.Log.e("FirestoreHelper", "loadProductsByIds failure: " + e.getMessage());
                        callback.onFailure(e.getMessage());
                    });
            return;
        }
        List<ProductItem> products = new ArrayList<>();
        loadProductsChunks(ids, 0, products, callback);
    }

    private static void loadProductsChunks(@NonNull List<String> ids, int start, @NonNull List<ProductItem> accumulator, @NonNull ProductsCallback callback) {
        int end = Math.min(start + 10, ids.size());
        List<String> chunk = ids.subList(start, end);
        getDb().collection(COLLECTION_PRODUCTS)
                .whereIn(FieldPath.documentId(), chunk)
                .get()
                .addOnSuccessListener(snapshot -> {
                    accumulator.addAll(parseProducts(snapshot));
                    if (end >= ids.size()) {
                        callback.onLoaded(accumulator);
                    } else {
                        loadProductsChunks(ids, end, accumulator, callback);
                    }
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    private static List<ProductItem> parseProducts(QuerySnapshot snapshot) {
        List<ProductItem> products = new ArrayList<>();
        for (DocumentSnapshot document : snapshot.getDocuments()) {
            String id = document.getId();
            String name = document.getString("name");
            String catId = document.getString("categoryId");
            String imageUrl = document.getString("imageUrl");
            Object priceObj = document.get("price");
            String price = priceObj != null ? String.valueOf(priceObj) : "";
            
            List<String> sizes = parseListField(document.get("sizes"));
            List<String> colors = parseListField(document.get("colors"));
            Long qtyLong = document.getLong("quantity");
            int quantity = qtyLong != null ? qtyLong.intValue() : 10;
            
            ProductItem product = new ProductItem(id, catId, name, price, imageUrl, sizes, colors, quantity);
            products.add(product);
        }
        return products;
    }

    private static List<String> parseListField(Object obj) {
        List<String> list = new ArrayList<>();
        if (obj instanceof List) {
            for (Object item : (List<?>) obj) {
                if (item != null) {
                    list.add(String.valueOf(item));
                }
            }
        } else if (obj instanceof String) {
            String str = (String) obj;
            for (String s : str.split(",")) {
                String trimmed = s.trim();
                if (!trimmed.isEmpty()) {
                    list.add(trimmed);
                }
            }
        }
        return list;
    }

    public static void addFavoriteProduct(@NonNull ProductItem item, @NonNull SimpleCallback callback) {
        Map<String, Object> favoriteData = new HashMap<>();
        favoriteData.put("productId", item.getId());
        favoriteData.put("createdAt", Timestamp.now());
        getFavoritesCollection()
                .document(item.getId())
                .set(favoriteData)
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void removeFavoriteProduct(@NonNull String productId, @NonNull SimpleCallback callback) {
        getFavoritesCollection()
                .document(productId)
                .delete()
                .addOnSuccessListener(v -> callback.onSuccess())
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static Map<String, Object> buildUserProfileMap(@NonNull String fullName, @NonNull String email, @NonNull String phone) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("fullName", fullName);
        profile.put("email", email);
        profile.put("phone", phone);
        profile.put("createdAt", Timestamp.now());
        return profile;
    }

    public static void loadUserProfile(@NonNull ProfileCallback callback) {
        getUsersCollection().document(getCurrentUserId())
                .get()
                .addOnSuccessListener(snapshot -> {
                    if (snapshot.exists()) {
                        UserProfile profile = snapshot.toObject(UserProfile.class);
                        if (profile != null) {
                            callback.onLoaded(profile);
                        } else {
                            callback.onFailure("Không tìm thấy dữ liệu người dùng");
                        }
                    } else {
                        callback.onFailure("Không tìm thấy hồ sơ người dùng");
                    }
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void updateUserProfile(@NonNull Map<String, Object> updates, @NonNull SimpleCallback callback) {
        getUsersCollection().document(getCurrentUserId())
                .set(updates, SetOptions.merge())
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

    public static void loadCategories(@NonNull CategoriesCallback callback) {
        getDb().collection(COLLECTION_CATEGORIES)
                .get()
                .addOnSuccessListener(snapshot -> {
                    List<CategoryItem> categories = new ArrayList<>();
                    for (DocumentSnapshot document : snapshot.getDocuments()) {
                        CategoryItem category = document.toObject(CategoryItem.class);
                        if (category != null) {
                            category.setId(document.getId());
                            categories.add(category);
                        }
                    }
                    callback.onLoaded(categories);
                })
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void loadProducts(@NonNull String categoryId, @NonNull ProductsCallback callback) {
        getDb().collection(COLLECTION_PRODUCTS)
                .whereEqualTo("categoryId", categoryId)
                .get()
                .addOnSuccessListener(snapshot -> callback.onLoaded(parseProducts(snapshot)))
                .addOnFailureListener(e -> callback.onFailure(e.getMessage()));
    }

    public static void loadAllProducts(@NonNull ProductsCallback callback) {
        getDb().collection(COLLECTION_PRODUCTS)
                .get()
                .addOnSuccessListener(snapshot -> callback.onLoaded(parseProducts(snapshot)))
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

