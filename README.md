# Board Plan — Android build

The React component from Claude, converted into a real app project. Storage now
uses Capacitor Preferences (native SharedPreferences on Android), so your log
survives app updates and cache clearing — `window.storage` only existed inside
Claude's artifact sandbox.

`npm install` and `npm run build` were already run here and both succeed.
`node_modules` is excluded to keep the zip small.

---

## Before the APK: try this first

You may not need an APK at all.

```bash
npm install
npm run dev -- --host
```

Open the printed `http://192.168.x.x:5173` on your phone, then **Chrome menu →
Add to Home screen**. You get an icon, a full-screen app, and it works offline.
Two minutes, nothing installed on the phone.

The catch: your laptop must be on the same wifi and running the dev server. For
an always-available version, drag the `dist/` folder onto Netlify or Vercel free
tier and add *that* URL to your home screen. Then it behaves like an installed
app and never needs your laptop again.

**An APK is worth it only if you want it in the Play Store, or want it working
with no hosting at all.**

---

## The APK path

### 1. Toolchain (once, ~10 GB)

- **JDK 21** — `brew install openjdk@21`, or the Temurin installer on Windows
- **Android Studio** — https://developer.android.com/studio
  On first launch, let it install the SDK and at least one platform (API 34+).
- Set these if the tooling can't find them:
  ```bash
  export JAVA_HOME=$(/usr/libexec/java_home -v 21)   # macOS
  export ANDROID_HOME=$HOME/Library/Android/sdk      # macOS
  ```

This is the slow part. Budget an evening for downloads.

### 2. Build and add Android

```bash
npm install
npm run build
npx cap add android
npx cap sync
```

`npx cap add android` creates a real Gradle project in `android/`. Run it once;
use `npx cap sync` from then on.

### 3. Debug APK

```bash
cd android
./gradlew assembleDebug
```

Output:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy it to your phone and open it — you'll need to allow **Install unknown apps**
for whatever you transferred it with. Debug APKs are signed with a throwaway key:
fine personally, rejected by the Play Store.

### 4. Or use the IDE

```bash
npx cap open android
```

Then Run with your phone plugged in and USB debugging on. Easier if the Gradle
command line fights you.

---

## After any change

```bash
npm run build && npx cap sync
```

Editing `src/StudyPlanner.jsx` and forgetting `cap sync` is the most common
reason a change doesn't appear on the phone.

---

## Signed release (Play Store only)

```bash
keytool -genkey -v -keystore boardplan.keystore -alias boardplan \
  -keyalg RSA -keysize 2048 -validity 10000
```

Keep that file and password safe — lose it and you can't update the listing.
Add a `signingConfigs` block to `android/app/build.gradle`, then
`./gradlew assembleRelease`. For a personal study tracker, almost certainly not
worth doing.

---

## Layout

```
src/StudyPlanner.jsx   the whole app — curriculum data, engine, UI
src/main.jsx           React entry point
src/index.css          Tailwind directives + safe-area padding for notches
index.html             shell, dark theme colour, viewport-fit=cover
capacitor.config.json  app id com.jess.boardplan, name "Board Plan"
tailwind.config.js     scans src/ for utility classes
```

Curriculum lives at the top of `StudyPlanner.jsx` in `SECTIONS`, `SKETCHY`, and
`AMBOSS`. Editing those is the intended way to change video lists or articles.

## Icon

```bash
npm i -D @capacitor/assets
# put a 1024x1024 icon.png in resources/, then:
npx capacitor-assets generate --android
```
