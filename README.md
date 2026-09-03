# Work on Another Video

A small Chrome Manifest V3 extension for YouTube Studio.

## What it does

When a blocked YouTube Studio route is open, the Studio content area is covered with:

> Work on another video.

The top Studio header stays visible, matching the supplied reference image.

### Blocked by default

- **Analytics** — always blocked, including channel analytics, video analytics, and Analytics Explore / Advanced Mode URLs.

### Optional blocks

Click the extension's toolbar icon to turn these on or off:

- **Dashboard** — off by default. Only the signed-in channel dashboard route is blocked; sign-in/account-selection pages are not.
- **Community** — off by default. The route detector supports both the `comments` and `community` route names YouTube has used for this area.

### Explicitly not blocked

Routes such as Content / Videos, video editing, upload flows, subtitles, copyright, customization, and other Studio pages are left alone.

## Install locally in Chrome

1. Unzip the package somewhere you want to keep it.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the `youtube-studio-blocker` folder.
6. Open YouTube Studio and visit Analytics to test it.
7. Click the extension icon if you also want to block Dashboard or Community.

## Why the script is registered on all Studio URLs

YouTube Studio is a single-page app. Chrome may keep the same page loaded while Studio changes the URL internally. The content script therefore loads on `studio.youtube.com`, watches only the current route, and does **nothing** on non-blocked pages. This is what lets Content and upload/editing pages continue to work normally.
