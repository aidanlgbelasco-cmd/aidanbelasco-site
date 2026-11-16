#!/usr/bin/env python3
"""Refresh the Watch page with the channel's most recent long-form videos.

Reads YouTube's public feed for the channel, skips Shorts, keeps the newest
COUNT, writes js/videos.js and saves each thumbnail to img/yt-<id>.jpg.
Standard library only. Run from anywhere:  python3 tools/update_videos.py
"""
import json, os, re, shutil, subprocess, sys, urllib.request, urllib.error
import xml.etree.ElementTree as ET

HANDLE = "@AidanBelasco"
COUNT = 10
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9"}
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}


def get(url, timeout=25):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def is_short(vid):
    """youtube.com/shorts/<id> answers 200 for a Short and redirects otherwise."""
    opener = urllib.request.build_opener(NoRedirect)
    try:
        opener.open(urllib.request.Request("https://www.youtube.com/shorts/" + vid, headers=UA, method="HEAD"), timeout=20)
        return True
    except urllib.error.HTTPError as e:
        return not (300 <= e.code < 400)


def channel_id():
    html = get("https://www.youtube.com/" + HANDLE).decode("utf-8", "replace")
    m = re.search(r'(?:"channelId"|"externalId")\s*:\s*"(UC[\w-]{22})"', html) or re.search(r"channel/(UC[\w-]{22})", html)
    if not m:
        sys.exit("Could not find the channel id for " + HANDLE)
    return m.group(1)


def main():
    cid = channel_id()
    # The "UULF" playlist is the channel's long-form uploads only (no Shorts, no live).
    feeds = ["https://www.youtube.com/feeds/videos.xml?playlist_id=UULF" + cid[2:],
             "https://www.youtube.com/feeds/videos.xml?channel_id=" + cid]
    entries, filtered = [], False
    for i, url in enumerate(feeds):
        try:
            root = ET.fromstring(get(url))
        except Exception as e:
            print("feed failed:", url, e)
            continue
        entries = [(e.find("yt:videoId", NS).text, e.find("a:title", NS).text, e.find("a:published", NS).text)
                   for e in root.findall("a:entry", NS)]
        filtered = i == 0
        if entries:
            break
    if not entries:
        sys.exit("No videos found; leaving the Watch page as it is.")
    entries.sort(key=lambda x: x[2], reverse=True)
    vids = []
    for vid, title, pub in entries:
        if not filtered and is_short(vid):
            continue
        vids.append({"id": vid, "title": title, "published": pub[:10]})
        if len(vids) == COUNT:
            break
    if not vids:
        sys.exit("Only Shorts found; leaving the Watch page as it is.")

    os.makedirs(os.path.join(SITE, "img"), exist_ok=True)
    for v in vids:
        dst = os.path.join(SITE, "img", "yt-" + v["id"] + ".jpg")
        if os.path.exists(dst):
            continue
        for name in ("maxresdefault", "hqdefault"):
            try:
                data = get("https://i.ytimg.com/vi/%s/%s.jpg" % (v["id"], name))
            except Exception:
                continue
            if len(data) > 5000:
                open(dst, "wb").write(data)
                if shutil.which("ffmpeg"):
                    tmp = dst + ".tmp.jpg"
                    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", dst, "-vf", "scale=800:-2", "-q:v", "5", tmp])
                    if r.returncode == 0:
                        os.replace(tmp, dst)
                break

    out = "// Written by tools/update_videos.py. Do not edit by hand.\nwindow.AB = window.AB || {};\nwindow.AB.videos = " + json.dumps(vids, indent=2, ensure_ascii=False) + ";\n"
    open(os.path.join(SITE, "js", "videos.js"), "w", encoding="utf-8").write(out)
    print("source:", "long-form playlist" if filtered else "channel feed, Shorts filtered")
    for v in vids:
        print(v["published"], v["id"], v["title"])


if __name__ == "__main__":
    main()
