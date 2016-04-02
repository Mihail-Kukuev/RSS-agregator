package by.bsu.fpmi;

import java.util.List;

public class Feed {
    private String url;
    private String title;
    private String imgUrl;
    private List<Item> items;
    //private List<Date> unreadEntries;

    public Feed() {
    }

    public Feed(String url, String title, String imgUrl) {
        this.url = url;
        this.title = title;
        this.imgUrl = imgUrl;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }
}
