# AidanBelasco.com

The website for Aidan Belasco: Watch, Shop and Hire.

Plain HTML, CSS and JavaScript. No build step.

- Settings (shop address, quote email, phone, products, short films): `js/config.js`
- Watch page videos: `js/videos.js`, rewritten daily by `tools/update_videos.py`

## Where the master copy lives

This GitHub repository (`aidanlgbelasco-cmd/aidanbelasco-site`) is the master copy.
The folder `ABHQ/00 HQ/Website/site` on the Mac is a backup and can fall behind:
the daily job commits here, and `.github/workflows/update-videos.yml` exists only here.
Start every edit from a fresh copy of this repository, never by uploading the ABHQ folder over it.

`CNAME` must stay in the repository root with `aidanbelasco.com` in it, or the domain disconnects.
The Shopify store lives at shop.aidanbelasco.com (DNS is managed in Shopify).
