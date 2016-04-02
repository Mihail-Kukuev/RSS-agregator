package by.bsu.fpmi;

import java.util.Date;

public class Item {
    private String url;
    private String title;
    private String imgUrl;
    private Date date;
    private String description;
    //boolean unread;

    public Item() {
    }

    public Item(String url, String title, Date date, String description, String imgUrl) {
        this.url = url;
        this.title = title;
        this.date = date;
        this.description = description;
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

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
