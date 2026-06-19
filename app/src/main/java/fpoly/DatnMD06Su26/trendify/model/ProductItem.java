package fpoly.DatnMD06Su26.trendify.model;

import java.util.ArrayList;
import java.util.List;

public class ProductItem {
    private String id;
    private String categoryId;
    private String name;
    private Object price;
    private String imageUrl;
    private List<String> sizes = new ArrayList<>();
    private List<String> colors = new ArrayList<>();
    private int quantity = 10; // Default to 10 so older products are not immediately marked as out-of-stock
    private List<Variant> variants = new ArrayList<>();

    public static class Variant {
        private String size = "";
        private String color = "";
        private int quantity = 0;

        public Variant() {}

        public Variant(String size, String color, int quantity) {
            this.size = size;
            this.color = color;
            this.quantity = quantity;
        }

        public String getSize() { return size != null ? size : ""; }
        public void setSize(String size) { this.size = size; }

        public String getColor() { return color != null ? color : ""; }
        public void setColor(String color) { this.color = color; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public ProductItem() {
    }

    public ProductItem(String name, String price) {
        this.id = generateIdFromName(name);
        this.name = name;
        this.price = price;
        this.imageUrl = "";
    }

    public ProductItem(String id, String categoryId, String name, String price, String imageUrl) {
        this.id = id != null && !id.isEmpty() ? id : generateIdFromName(name);
        this.categoryId = categoryId;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl != null ? imageUrl : "";
    }

    public ProductItem(String id, String categoryId, String name, String price, String imageUrl, List<String> sizes, List<String> colors, int quantity) {
        this.id = id != null && !id.isEmpty() ? id : generateIdFromName(name);
        this.categoryId = categoryId;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl != null ? imageUrl : "";
        this.sizes = sizes != null ? sizes : new ArrayList<>();
        this.colors = colors != null ? colors : new ArrayList<>();
        this.quantity = quantity;
    }

    public ProductItem(String id, String categoryId, String name, String price, String imageUrl, List<String> sizes, List<String> colors, int quantity, List<Variant> variants) {
        this.id = id != null && !id.isEmpty() ? id : generateIdFromName(name);
        this.categoryId = categoryId;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl != null ? imageUrl : "";
        this.sizes = sizes != null ? sizes : new ArrayList<>();
        this.colors = colors != null ? colors : new ArrayList<>();
        this.quantity = quantity;
        this.variants = variants != null ? variants : new ArrayList<>();
    }

    public String getId() {
        return id != null && !id.isEmpty() ? id : generateIdFromName(name);
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrice() {
        return price != null ? String.valueOf(price) : "";
    }

    public void setPrice(Object price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl != null ? imageUrl : "";
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getSizes() {
        return sizes != null ? sizes : new ArrayList<>();
    }

    public void setSizes(Object sizes) {
        this.sizes = parseListField(sizes);
    }

    public List<String> getColors() {
        return colors != null ? colors : new ArrayList<>();
    }

    public void setColors(Object colors) {
        this.colors = parseListField(colors);
    }

    private List<String> parseListField(Object obj) {
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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public List<Variant> getVariants() {
        return variants != null ? variants : new ArrayList<>();
    }

    public void setVariants(List<Variant> variants) {
        this.variants = variants;
    }

    private String generateIdFromName(String name) {
        if (name == null || name.isEmpty()) {
            return "unknown_product";
        }
        return name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "_");
    }
}
