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

    public static void checkAndSeedDatabase() {
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        seedDatabase(db);
    }

    private static void seedDatabase(FirebaseFirestore db) {
        // 1. Seed Categories
        Map<String, Object> catVay = new HashMap<>();
        catVay.put("name", "Váy");
        catVay.put("imageUrl", "https://lh3.googleusercontent.com/aida-public/AB6AXuCPD8ECPvM7uBmWFS9huFc5YBTfOew9OaY8wG8hQKBuByZGDsQ55V1-TFZIinLnO-VxzIb-7HINZMgd5wjXcrmA15d9Q5LMpOKiYFyKt0BLEaGAFG9UcAgnRRW8LQyWAMOlOIS4JGhQMQMGRcHKrW7S7m0qQFJlax4FMq1Gzc-d6KeC5pDpitvRbOEf6VQgjXOMzPEStcpIaEzjtlZEh70HQdTQdf3pG9v8XCTu3qaRN5D8Wbvnw-siB4OQFNZml7umCpPVvmBSZtI");

        Map<String, Object> catAo = new HashMap<>();
        catAo.put("name", "Áo");
        catAo.put("imageUrl", "https://lh3.googleusercontent.com/aida-public/AB6AXuA2hmAL2kOVV2k7aeS1NWSp-k7hPIDNzWHShjPDrZcFLG6xthFolTG282DhcE_lbFAeIi-lwCnOs2Sd97nhc77S-c9UqQn36v9d0dTDrIxawLL3BJVNZMIGSCJs64oP-W8AUinv9S43gq7ubtKiuBow-toIy0vFxoMk3lizlu2wtPyUaexM15BbuRXvQNECqw2V3goSHewdJQMSFUEYBJBCcDrYN-8yLnu0fVelunPNMP_iQsFR8KWeImzO8v6KzwvzxGRI0_lH1yw");

        Map<String, Object> catPhukien = new HashMap<>();
        catPhukien.put("name", "Phụ kiện");
        catPhukien.put("imageUrl", "https://lh3.googleusercontent.com/aida-public/AB6AXuCAxhHQooyU8SiIwiH0Pbzuw1-uZdod_ngqcegoqttRqmzHPL_nqur3okOg4NBrK-yzBHV5e93Q3F9aKdDsai8MXvmlmuHPwCZazU_f6Bv2IHQ-KjmCI8oO-ac873DWgJdX2XZKKTRIR_hsK9p63PbP0tCXX2tS_-L3FbFQnlmCx8rxU9RVo8BRfF_DBp7RBJjbOy_h4N7H-N5AoQgvbi3LD2GWZnZGRsJD2UGfUDUpAksAejImy6j_B1zkcJmBAO6MDG7BDEb1kTw");

        db.collection(COLLECTION_CATEGORIES).document("cat_vay").set(catVay);
        db.collection(COLLECTION_CATEGORIES).document("cat_ao").set(catAo);
        db.collection(COLLECTION_CATEGORIES).document("cat_phukien").set(catPhukien);

        // 2. Seed Products
        // Váy Linen Lụa (prod_midi_couture) - Image from p1
        seedProduct(db, "prod_midi_couture", "cat_vay", "Váy Linen Lụa", "1250000",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA0XhO6swqfonIeHfT1-gkfLq_6uRyRdTDltZAbxvpxtdYzbo1UlbiRoMDNKVJrfehMAbHJmwEfP8TQCj-hc0z_4BkkqUaFWpkj9PZ6wXbrzSDi0jRAZGHjnNGgx6aPk0AiCpkpBdZVAlt1piPFfiXihW8RQUd77WAkqrzkY-DAllBih-pxOXlpiZ72bzLkRslNhEWeqTMJgm-pNLJCmBYS4O0aqQRGICbjAuP49ZB2qXprdBJV_dfNLLnj0Q7i3Bla2lxPXPSzsAY");

        // Đầm Lụa Midi Haute Couture (prod_vay_xep_ly) - Image from Hero
        seedProduct(db, "prod_vay_xep_ly", "cat_vay", "Đầm Lụa Midi Haute Couture", "2450000",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCdMsc48mhR6FbFhVwf2WdVDCG3ETwd3L4ScSptSVOWhfBa5kC-jyrBzd-l5OIffblyBmtB_1CFC2TLR8WIgRjuYIHr7-wQF3R1gogD8R5vyn6fYEqV66sSFIFEf8uhqZtBwrwO2xICtxWX-8llozsrh0OhsDcO8uVP0CQBRbGuMD59wNtlUXON-ru1REYEgEr0mN_5SmekY0n1Tw9vo5BDOunX_gq8CH1dQnD-NYlwccoW655tFgTCr8wYr6mqYaXsM06DDc8zNso");

        // Áo Sơ Mi Minimal (prod_blazer_linen) - Image from p2
        seedProduct(db, "prod_blazer_linen", "cat_ao", "Áo Sơ Mi Minimal", "890000",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCX-c7Voho0kXx71qum7yoccZQk377MJkJurXMBNiXRX7x0qi4_Xnuqman7_9UoNnzx_9otz747JBirISzUeLmLaFTms3dPtNI8Hss6YpRTf2C8E6yD4hSutxsAC9wf6B7OBlTYk4MxVh2iHWlZGsz8TqakOlh_1wn9lSNAVpD5ofUgdxTeMU_1kelTcydpoSTUpnE9Q0xxC6TRAHsekb5o0IJkNHDqa-PZ7eQSxW1COK20bNDRjfXFS5bbQFNYAM4CDYtEOZGa4sA");

        // Quần Tây Ống Suông (prod_somi_lua) - Image from p3
        seedProduct(db, "prod_somi_lua", "cat_ao", "Quần Tây Ống Suông", "1450000",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCqfWnX95dm_q5--28U_aAdE-xtYKaAuuG6ncs3o5QIttPcDyxFOXdRMTyIUUlWizvOcB2ww6XIlAapFgQts11LAXEilznwVKcLh7qdRoweQkLgYfQO3jqQXZjFibd2Bkfbls3RLIJDtwwFXFIrj0rSZXsAxgk1gyZ4HYO0LDV3ouU0rUHMGgU1pLE5_brjTx4QUQyMxC-ZZLHvA7b2jqrFgfu61cLSNSqAUK6g80SObZO2GW6IZh08ytoeSeH5JWfS-yXL4_QMe-Q");

        // Túi Da Cầm Tay (prod_tui_da) - Image from p4
        seedProduct(db, "prod_tui_da", "cat_phukien", "Túi Da Cầm Tay", "2100000",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDO2v3HaWq8W_fszJmrkMWwPIXhIIOdFRjIq9LZI7R6x8TD6erxPgcBqqsaBCm8GANse1Ro87WGzHIn48ZQtq5amIzwK0Cm1MZgoly4u2L-0-dVD2WF_KEeVyWxVvLaoBn9ZCANzhsTGDRRK3I_QRgVd9SbayrkRg0unSkMwfif0nMWlbSJjm76d6gdbQGYQwgchyw9icx_iTKs89fHdEZTU5uNtz5EoBsHLuCzfyANpNjJZnJudS27yf3PAgfqKksw4w9rOgItU_c");

        // Kính Mát Oversized Cổ Điển (prod_kinh_oversized) - Image from Phụ kiện Category
        seedProduct(db, "prod_kinh_oversized", "cat_phukien", "Kính Mát Oversized Cổ Điển", "950000",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCAxhHQooyU8SiIwiH0Pbzuw1-uZdod_ngqcegoqttRqmzHPL_nqur3okOg4NBrK-yzBHV5e93Q3F9aKdDsai8MXvmlmuHPwCZazU_f6Bv2IHQ-KjmCI8oO-ac873DWgJdX2XZKKTRIR_hsK9p63PbP0tCXX2tS_-L3FbFQnlmCx8rxU9RVo8BRfF_DBp7RBJjbOy_h4N7H-N5AoQgvbi3LD2GWZnZGRsJD2UGfUDUpAksAejImy6j_B1zkcJmBAO6MDG7BDEb1kTw");
    }

    private static void seedProduct(FirebaseFirestore db, String id, String catId, String name, String price, String imageUrl) {
        Map<String, Object> prod = new HashMap<>();
        prod.put("categoryId", catId);
        prod.put("name", name);
        prod.put("price", price);
        prod.put("imageUrl", imageUrl);
        prod.put("quantity", 20);
        List<String> sizes = new ArrayList<>();
        sizes.add("S");
        sizes.add("M");
        sizes.add("L");
        prod.put("sizes", sizes);
        List<String> colors = new ArrayList<>();
        colors.add("Black");
        colors.add("White");
        colors.add("Beige");
        prod.put("colors", colors);
        db.collection(COLLECTION_PRODUCTS).document(id).set(prod);
    }
}

