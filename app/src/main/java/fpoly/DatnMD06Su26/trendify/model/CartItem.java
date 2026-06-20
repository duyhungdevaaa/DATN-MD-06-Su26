package fpoly.DatnMD06Su26.trendify.model;

import com.google.firebase.firestore.Exclude;

public class CartItem {
    private String productId;
    private String name;
    private String price;
    private int quantity;
    private String imageUrl;
    private String size = "";
    private String color = "";
    private String cartItemId = "";

    public CartItem() {} // bắt buộc cho Firestore
    public CartItem() {} // Bắt buộc cho Firestore

    public CartItem(String productId, String name, String price, int quantity, String imageUrl) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.cartItemId = productId;
    }

    public CartItem(String productId, String name, String price, int quantity, String imageUrl, String size, String color, String cartItemId) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.size = size != null ? size : "";
        this.color = color != null ? color : "";
        this.cartItemId = cartItemId != null ? cartItemId : productId;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getSize() { return size != null ? size : ""; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color != null ? color : ""; }
    public void setColor(String color) { this.color = color; }

    public String getCartItemId() { 
        return (cartItemId != null && !cartItemId.isEmpty()) ? cartItemId : productId; 
    }
    public void setCartItemId(String cartItemId) { this.cartItemId = cartItemId; }

    public void setPriceAsLong(long priceAsLong) { /* Ignore - required to prevent Firestore mapping warnings */ }

    // Tính giá số để cộng tổng (bỏ "đ" và dấu chấm)
    public void setPriceAsLong(long priceAsLong) { /* Bắt buộc để tránh cảnh báo mapping của Firestore */ }

    // Tính toán giá tiền số thực tế để cộng tổng hóa đơn (bỏ ký tự 'đ' và các dấu chấm phân cách)
    @Exclude
    public long getPriceAsLong() {
        try {
            return Long.parseLong(price.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 0;
        }
    }
}
