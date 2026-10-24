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

Keep private credentials only in local `.env.local` files or a hosting provider's
secret manager. Never commit private credentials, paste them into source code, or
expose them through browser-facing `VITE_*` variables. The Supabase publishable
(formerly `anon`) key is specifically intended for browser use and is safe only
with the included Row Level Security policies. Never use a Supabase `service_role`
key in the frontend. The committed `.env.example` contains placeholders only.

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

La Bible créole est mise en cache après son premier chargement réussi afin qu’elle soit disponible hors ligne. Un APK Android peut être généré par le workflow **Build Android APK**. Un installateur `.exe` nécessite un emballage Windows séparé; aucun APK ne s’installe sur iOS.

### Lecture, recherche et personnalisation

- Le lecteur biblique s’ouvre sur Matthieu 1. La recherche depuis l’écran Bible porte sur l’ensemble des livres; les résultats créoles couvrent les textes créoles chargés dans l’application et la recherche française utilise le service de Bible en ligne.
- Dans la lecture d’un chant, utilisez les flèches **Précédent/Suivant** pour parcourir le répertoire ou **Chercher** pour trouver directement un chant par numéro, titre, paroles ou recueil, sans revenir à la navigation principale. Les commandes sont aussi disponibles en mode plein écran.
- Dans le sélecteur de livre, ouvrez **Auteur et contexte historique** pour consulter les attributions, périodes, lieux et circonstances. Les dates sont indicatives et les attributions anciennes sont parfois discutées.
- Dans **Mon Espace → Paramètres**, choisissez une palette prédéfinie ou ajustez vous-même la couleur principale et la couleur d’accent. Ces préférences sont enregistrées sur cet appareil.
- L’application utilise **Montserrat**; les grands titres sont en graisse 900 et en majuscules. Les annonces défilantes utilisent **Black Ops One** avec Montserrat en remplacement. Seules ces deux familles de polices sont chargées afin d’éviter les anciennes polices inutilisées. L’animation des annonces est désactivée si l’appareil demande une réduction des mouvements.
- Dans **Enregistrements**, le mini-studio crée une nouvelle copie de la voix sans modifier l’original : compression vocale, timbre naturel/chaud/clair ou effet téléphone, réverbération et écho réglables, avec batterie, guitare ou clavier synthétisés en option. Le tempo et le volume de l’accompagnement sont réglables. Le traitement se fait sur le téléphone, sans envoyer la voix sur Internet, et ne nécessite pas de connexion. Il est limité aux enregistrements de cinq minutes ou moins.
- Dans **Enregistrements**, les utilisateurs consultent et écoutent les musiques MP3 publiées depuis l’onglet **Musique** de l’administration. Une piste peut jouer pendant que la personne chante et enregistre; l’enregistrement sauvegardé contient le microphone seulement, pas l’accompagnement. Une connexion Internet est nécessaire.
- Les applications Android APK vérifient à leur ouverture si une version plus récente est publiée et proposent le lien vers sa compilation. L’installation de l’APK reste manuelle; son numéro de version augmente à chaque compilation. Au premier appui sur le micro, Android doit afficher sa demande d’autorisation dans l’application; si l’autorisation a déjà été refusée, il faudra la réactiver dans les paramètres Android.

### Générer et télécharger l’APK Android

Le projet Android utilise Capacitor et embarque une compilation de l’application dans l’APK. Les contenus partagés et l’authentification continuent d’utiliser Supabase.

1. Ouvrez la [dernière compilation APK réussie](https://github.com/clavenskyj4-wq/jere-kretyen/actions/runs/39980880279) et connectez-vous à GitHub si nécessaire.
2. Dans la section **Artifacts**, cliquez sur `jere-kretyen-android-apk`. Le téléchargement est un fichier ZIP.
3. Décompressez le ZIP et récupérez `app-debug.apk`. Vous pouvez transférer ce fichier sur le téléphone (USB, courriel ou stockage en nuage).
4. Sur Android, ouvrez le fichier depuis **Fichiers** ou **Téléchargements**. Si Android bloque l’installation, ouvrez le réglage proposé et autorisez temporairement **l’installation d’applications inconnues** pour l’application utilisée (par exemple Chrome ou Fichiers), puis revenez au fichier et installez-le.
5. Une fois l’installation terminée, vous pouvez désactiver cette autorisation. Lancez ensuite **Jere Kretyen** depuis l’écran d’accueil ou la liste des applications.

Pour obtenir une version plus récente, attendez une compilation réussie après l’envoi des changements sur `main`, ou ouvrez **Actions → Build Android APK → Run workflow**. Téléchargez l’artefact de cette nouvelle exécution. GitHub conserve chaque artefact pendant 30 jours; après expiration, relancez le workflow pour en générer un autre.

Cet APK de test est signé avec la clé Android debug de GitHub Actions; une nouvelle compilation peut donc nécessiter de désinstaller l’ancienne version avant installation. Ne distribuez pas cet APK comme version officielle Google Play. Une publication durable nécessitera une clé de signature privée conservée dans les secrets GitHub et un processus de release dédié. L’application Android et la PWA partagent le même code, mais les changements du code doivent être compilés à nouveau pour produire un nouvel APK. Pour l’instant, le logo du lanceur Android est l’icône fournie avec le projet; un logo remplacé dans l’administration modifie l’interface web, pas l’icône système de l’APK déjà construit.

Cet APK ne s’installe pas sur iPhone ou iPad. Sur ces appareils, utilisez la version web dans Safari et choisissez **Partager → Sur l’écran d’accueil**. Aucun installateur Windows `.exe` n’est généré par ce workflow.

### Configuration de l’administration partagée (Supabase)

L’espace d’administration nécessite un projet Supabase : l’ancien code PIN local n’est pas une protection et a été retiré.

1. Créez un projet Supabase et activez l’authentification par courriel et mot de passe.
2. Dans **SQL Editor**, exécutez [`supabase/schema.sql`](./supabase/schema.sql).
   Si le projet Supabase est déjà configuré, exécutez plutôt la migration [`supabase/instrumentals.sql`](./supabase/instrumentals.sql) pour ajouter le catalogue MP3 et son stockage.
3. Créez votre compte dans **Authentication → Users**, puis ajoutez son identifiant UUID à la liste des administrateurs depuis le SQL Editor :

   ```sql
   insert into public.app_admins (user_id)
   values ('UUID_DU_COMPTE_AUTHENTICATION_USERS');
   ```

4. Dans **Project Settings → API**, récupérez le Project URL et la clé `anon`/publishable. Ne partagez jamais la clé `service_role`.
5. Pour le développement local, copiez `.env.example` vers `.env.local`, puis renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
6. Dans GitHub, ajoutez ces deux valeurs comme **Repository variables** (`Settings → Secrets and variables → Actions → Variables`) : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Le workflow de déploiement les injecte à la compilation.

Les politiques RLS de `schema.sql` limitent les écritures aux comptes inscrits dans `app_admins`. Dans l’onglet **Musique** de l’administration, téléversez un MP3 (25 Mo maximum), indiquez son titre et confirmez avoir les droits nécessaires à sa publication. Le catalogue et les fichiers audio sont publics en lecture; seuls les administrateurs autorisés peuvent ajouter ou supprimer des pistes. Les rapports ne contiennent que des événements d’administration et des détails agrégés; aucune donnée personnelle d’utilisateur ni aucun enregistrement vocal n’est envoyé. Les enregistrements restent stockés sur l’appareil.

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
