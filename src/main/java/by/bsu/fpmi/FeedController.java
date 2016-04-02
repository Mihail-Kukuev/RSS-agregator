package by.bsu.fpmi;

import com.sun.syndication.feed.synd.SyndEnclosureImpl;
import com.sun.syndication.feed.synd.SyndEntry;
import com.sun.syndication.feed.synd.SyndFeed;
import com.sun.syndication.io.FeedException;
import com.sun.syndication.io.SyndFeedInput;
import com.sun.syndication.io.XmlReader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
//@RequestMapping(value = "/index", produces = "text/html")
public class FeedController {

    @RequestMapping(value = "rss/get_feed", method = RequestMethod.GET)
    public Feed getFeed(@RequestParam String feedUrl) {
        SyndFeed syndFeed = getSyndFeed(feedUrl);
        Feed feed = getFeedInfo(syndFeed);

        List<Item> items = new ArrayList<>();
        for (Object object: syndFeed.getEntries()) {
            SyndEntry entry = (SyndEntry) object;
            items.add(createItem(entry, feed));
        }
        feed.setItems(items);
        return feed;
    }

    @RequestMapping(value = "rss/validate_feed", method= RequestMethod.GET)
    public String validateFeedUrl(@RequestParam String validateUrl) {
        SyndFeed syndFeed = null;
        String feedTitle = "";
        try {
            syndFeed = new SyndFeedInput().build(new XmlReader(new URL(validateUrl)));
        } catch (FeedException e) {
            feedTitle = "invalid";
        } catch (IOException e) {
            feedTitle = "invalid";
        }
        if (!feedTitle.equals("invalid"))
            feedTitle = syndFeed.getTitle();

        return feedTitle;
    }

    private Feed getFeedInfo(SyndFeed syndFeed) {
        String imgUrl;
        if (syndFeed.getImage()==null)
            imgUrl = "empty";
        else
            imgUrl = syndFeed.getImage().getUrl();

        return new Feed(syndFeed.getLink(), syndFeed.getTitle(), imgUrl);
    }

    private SyndFeed getSyndFeed(String feedUrl) {
        try {
            return new SyndFeedInput().build(new XmlReader(new URL(feedUrl)));
        } catch (FeedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private Item createItem(SyndEntry entry, Feed feed) {
        String imgUrl = feed.getImgUrl();

        String description = entry.getDescription().getValue();
        Pattern pattern = Pattern.compile("<img[^>]*src=[^>]+>");
        Matcher matcher = pattern.matcher(description);
        String imgHtml;
        if (matcher.find()) {
            imgHtml = matcher.group();
            description = description.replace(imgHtml, "");

            pattern = Pattern.compile("src=\"[^>\"]+\"");
            matcher = pattern.matcher(imgHtml);
            if (matcher.find()) {
                String url = matcher.group().replace("src=\"", "");
                imgUrl = url.substring(0, url.length()-1);
                /*if (!imgUrl.contains("http"))
                    imgUrl = feed.getUrl() + imgUrl;*/
            }
        }

        if (entry.getEnclosures().size()!=0) {
            imgUrl = ((SyndEnclosureImpl)entry.getEnclosures().get(0)).getUrl();
        }

        description = description.replaceAll("(<br[/]*>[\\s]*(<hr[/]*>)*[\\s]*)+", "<br/>");
        description = description.replaceAll("^([\\s]*<br/>)*", "");

        return new Item(entry.getUri(), entry.getTitle(), entry.getPublishedDate(), description, imgUrl);
    }
}