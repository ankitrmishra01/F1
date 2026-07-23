from fastapi import APIRouter
import requests
import xml.etree.ElementTree as ET

router = APIRouter(prefix="/api/news", tags=["News"])

RSS_FEED_URL = "https://www.autosport.com/rss/f1/news/"

@router.get("/")
def get_f1_news():
    """Fetch latest F1 news from Autosport RSS feed."""
    try:
        resp = requests.get(RSS_FEED_URL, timeout=10)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        articles = []
        for item in root.findall("./channel/item")[:12]:
            title = item.find("title")
            link = item.find("link")
            pub_date = item.find("pubDate")
            desc = item.find("description")
            # Try to extract image from media:content or enclosure
            img = None
            enclosure = item.find("enclosure")
            if enclosure is not None:
                img = enclosure.get("url")
            # Also try media:thumbnail or media:content
            for ns_tag in ["{http://search.yahoo.com/mrss/}thumbnail", "{http://search.yahoo.com/mrss/}content"]:
                media = item.find(ns_tag)
                if media is not None:
                    img = media.get("url")
                    break
            articles.append({
                "title": title.text if title is not None else "",
                "link": link.text if link is not None else "",
                "published": pub_date.text if pub_date is not None else "",
                "description": desc.text[:200] if desc is not None and desc.text else "",
                "image": img
            })
        return {"articles": articles}
    except Exception as e:
        print(f"News fetch error: {e}")
        return {"articles": []}
