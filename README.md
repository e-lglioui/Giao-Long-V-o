# Master's Portal - Backend

Master's Portal est une application conçue pour gérer les écoles de Kung Fu au Maroc. Cette plateforme permet aux Maîtres et aux administrateurs de gérer les élèves, les cours, les événements, ainsi que les certifications sportives.

## 🚀 Fonctionnalités principales

- Gestion des écoles, des instructeurs et des élèves
- Suivi des certifications sportives et passeports sportifs
- Planification des événements et gestion des inscriptions
- Paiements sécurisés via Stripe
- Notifications par email avec Nodemailer
- Authentification sécurisée avec JWT et vérification par email
- Tableau de bord pour Superadmin et Admin

## 🛠️ Technologies utilisées

- **Backend** : NestJS
- **Base de données** : MongoDB
- **Authentification** : JWT
- **Emailing** : Nodemailer
- **Paiements** : Stripe
- **Conteneurisation** : Docker

## 📦 Prérequis

- Docker installé
- Node.js et npm installés
- Compte Stripe pour les paiements

## ⚙️ Installation

1. **Cloner le dépôt** :
    ```bash
    git clone https://github.com/e-lglioui/Giao-Long-V-o.git
    cd backend
    ```
2. **Configurer les variables d'environnement** :
    Créez un fichier `.env` à la racine et ajoutez :
    ```env
    PORT=3000
    DATABASE_URL=mongodb://localhost:27017/masters-portal
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_password
    MAPS_API_KEY=your_google_maps_api_key
    ```
3. **Lancer l'application avec Docker** :
    ```bash
    docker-compose up --build
    ```

## 🧪 Tests

Pour exécuter les tests unitaires et d'intégration :
```bash
npm run test
```

## 📧 Configuration de Nodemailer

Assurez-vous d'avoir un compte email (Gmail, Outlook, etc.). Configurez les variables dans votre fichier `.env`. Nodemailer gérera les notifications par email (ex. : confirmation d'inscription, rappels d'événements).

## 💳 Configuration de Stripe

1. Connectez-vous à votre compte Stripe.
2. Créez des clés API et ajoutez-les à votre `.env`.
3. Utilisez les webhooks pour suivre les paiements et gérer les statuts.

## 🛡️ Sécurité

- Utilisation de JWT pour l'authentification
- Validation des données avec DTOs
- Gestion des rôles et permissions pour les utilisateurs

## 🚀 Déploiement

Pour déployer votre application sur un serveur Docker :
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 📝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à proposer une pull request.

## 📧 Contact

Si vous avez des questions, contactez-nous à : elgliouif@gmail.com




