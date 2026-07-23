package fpoly.DatnMD06Su26.trendify.model;

import com.google.firebase.firestore.Exclude;
import android.os.Parcel;
import android.os.Parcelable;

public class CartItem implements Parcelable {
    private String productId;
    private String name;
    private String price;
    private int quantity;
    private String imageUrl;
    private String size = "";
    private String color = "";
    private String cartItemId = "";
    
    @Exclude
    private boolean selected = true;
    private boolean selected = false;

    public CartItem() {}

    protected CartItem(Parcel in) {
        productId = in.readString();
        name = in.readString();
        price = in.readString();
        quantity = in.readInt();
        imageUrl = in.readString();
        size = in.readString();
        color = in.readString();
        cartItemId = in.readString();
        selected = in.readByte() != 0;
    }

    public static final Creator<CartItem> CREATOR = new Creator<CartItem>() {
        @Override
        public CartItem createFromParcel(Parcel in) {
            return new CartItem(in);
        }

        @Override
        public CartItem[] newArray(int size) {
            return new CartItem[size];
        }
    };

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

    @Exclude
    public boolean isSelected() { return selected; }
    @Exclude
    public void setSelected(boolean selected) { this.selected = selected; }

    public void setPriceAsLong(long priceAsLong) { }
    public boolean isSelected() { return selected; }
    public void setSelected(boolean selected) { this.selected = selected; }

    public void setPriceAsLong(long priceAsLong) { /* Ignore - required to prevent Firestore mapping warnings */ }

    @Exclude
    public long getPriceAsLong() {
        try {
            return Long.parseLong(price.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(productId);
        dest.writeString(name);
        dest.writeString(price);
        dest.writeInt(quantity);
        dest.writeString(imageUrl);
        dest.writeString(size);
        dest.writeString(color);
        dest.writeString(cartItemId);
        dest.writeByte((byte) (selected ? 1 : 0));
    }
}