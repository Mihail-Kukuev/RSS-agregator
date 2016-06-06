package by.bsu.fpmi.Entities;

import java.util.List;

public class Feed {
    private String link;
    private String title;
    private String imgUrl;
    private List<Item> items;
    //private List<Date> unreadEntries;

    public Feed() {
    }

    public Feed(String link, String title, String imgUrl) {
        this.link = link;
        this.title = title;
        this.imgUrl = imgUrl;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
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
