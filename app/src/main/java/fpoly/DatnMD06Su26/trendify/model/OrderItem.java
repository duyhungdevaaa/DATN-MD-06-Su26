package fpoly.DatnMD06Su26.trendify.model;

public class OrderItem {
    private String orderId;
    private String status;
    private String date;
    private String productName;
    private int quantity;
    private String price;
    private int productImageRes;

    public OrderItem(String orderId, String status, String date, String productName, int quantity, String price, int productImageRes) {
        this.orderId = orderId;
        this.status = status;
        this.date = date;
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.productImageRes = productImageRes;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public int getProductImageRes() {
        return productImageRes;
    }

    public void setProductImageRes(int productImageRes) {
        this.productImageRes = productImageRes;
    }
}
