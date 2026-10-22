<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/17b20d5c-6e21-438d-9d04-2b35f182ae43

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Keep real credentials only in local `.env.local` files or a hosting provider's
secret manager. Never commit them, paste them into source code, or expose them
through browser-facing `VITE_*` variables. The committed `.env.example` contains
placeholders only.

## Installation mobile et téléchargements

Jere Kretyen est une application web progressive (PWA). Une fois l’application publiée sur une adresse HTTPS :

- **Android** : ouvrez le site dans Chrome et choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».
- **iPhone et iPad** : ouvrez le site dans Safari, touchez « Partager », puis « Sur l’écran d’accueil ».

Les fichiers `.apk` et `.exe` ne sont pas encore publiés. Un APK est destiné à Android et un installateur `.exe` à Windows; aucun des deux ne s’installe sur iOS. Les iPhone et iPad peuvent utiliser la PWA ou une future version distribuée via l’App Store.
