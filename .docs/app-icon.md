## Generate app icon

You can generate Splash Screens and Icons for your iOS, Android or Progressive Web Application using the @capacitor/assets tool.

Tool:

```
npm install @capacitor/assets --save-dev
```

Provide icon and splash screen source images using this folder/filename structure:

```
assets/
├── icon-only.png
├── icon-foreground.png
├── icon-background.png
├── splash.png
└── splash-dark.png
```

- Icon files should be at least 1024px x 1024px.
- Splash screen files should be at least 2732px x 2732px.
- The format can be jpg or png.

Then generate (which applies to your native projects or generates a PWA manifest file):

```bash
npx capacitor-assets generate \
  --assetPath .notes/assets \
  --iconBackgroundColor '#111926' \
  --iosProject mobile/ios/App \
  --androidProject mobile/android
```
