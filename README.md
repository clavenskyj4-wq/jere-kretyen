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

## Publication et installation mobile

Le workflow GitHub Actions de ce dépôt construit et publie automatiquement la PWA sur GitHub Pages après chaque envoi sur `main`.

Pour activer la première publication :

1. Ouvrez **Settings → Pages** dans le dépôt GitHub.
2. Sous **Build and deployment**, choisissez **GitHub Actions** comme source.
3. Ouvrez l’onglet **Actions**, puis attendez la réussite de **Deploy PWA to GitHub Pages**.
4. Visitez [Jere Kretyen sur GitHub Pages](https://clavenskyj4-wq.github.io/jere-kretyen/).

Une fois publiée en HTTPS :

- **Android** : ouvrez le site dans Chrome et choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».
- **iPhone et iPad** : ouvrez le site dans Safari, touchez « Partager », puis « Sur l’écran d’accueil ».

La Bible créole est mise en cache après son premier chargement réussi afin qu’elle soit disponible hors ligne. Les fichiers `.apk` et `.exe` ne sont pas produits par ce workflow : ils nécessitent des emballages natifs séparés. Un APK est destiné à Android et un installateur `.exe` à Windows; aucun des deux ne s’installe sur iOS.

### Format JSON pour les chants

Les imports JSON acceptent des champs de droits distincts pour les paroles, la musique, la traduction, la source et la preuve de licence. Les anciennes entrées sans ces éléments sont affichées « À vérifier » : leur statut ne peut pas être confirmé à partir du seul nom de l’auteur ou de l’ancien statut.

```json
[
  {
    "id": "hymn-001",
    "number": 1,
    "title": "Titre français",
    "titleKr": "Tit kreyòl",
    "section": "Hymnes du domaine public",
    "sectionCode": "CE_FR",
    "author": "Auteur des paroles",
    "category": "adoration",
    "copyrightStatus": "À vérifier",
    "rights": {
      "status": "unverified",
      "lyricsAuthor": "Auteur des paroles",
      "composer": "Compositeur",
      "translator": "Traducteur",
      "arranger": "Arrangeur",
      "sourceTitle": "Titre du recueil ou de l’archive consultée",
      "sourceUrl": "https://example.org/source",
      "evidence": "Référence vérifiable : édition, année et page."
    },
    "verses": [
      {
        "number": 1,
        "text": ["Première ligne", "Deuxième ligne"]
      }
    ],
    "chorus": ["Ligne du refrain"]
  }
]
```

Ne choisissez `public_domain` ou `licensed` que si `sourceTitle` ou `sourceUrl` et `evidence` documentent le statut. Sinon, gardez `unverified`. Le statut de droits des traductions et arrangements doit être vérifié séparément de celui du texte original.
