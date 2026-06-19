package fpoly.DatnMD06Su26.trendify.model;

public class CategoryItem {
    private String id;
    private String name;
    private String imageUrl;

    public CategoryItem() {
    }

    public CategoryItem(String name) {
        this.name = name;
        this.imageUrl = "";
    }

    public CategoryItem(String id, String name) {
        this.id = id;
        this.name = name;
        this.imageUrl = "";
    }

    public CategoryItem(String id, String name, String imageUrl) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl != null ? imageUrl : "";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl != null ? imageUrl : "";
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
