# Deployment Guide - Manus Mobile Mechanic App

This guide provides step-by-step instructions for deploying the Manus Mobile Mechanic App to various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Firebase account
- Google Maps API key

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/GrizzlyRooster34/manus-mobile-mechanic-app.git
cd manus-mobile-mechanic-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

4. **Configure your `.env.local` file:**
```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

5. **Start the development server:**
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Required Services
- **Authentication**: Enable Email/Password and Google providers
- **Firestore Database**: Create in production mode
- **Storage**: Enable for file uploads
- **Hosting**: Enable for web deployment

### 3. Configure Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Service requests
    match /serviceRequests/{requestId} {
      allow read, write: if request.auth != null;
    }
    
    // Mechanics
    match /mechanics/{mechanicId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == mechanicId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🌐 Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create credentials (API Key)
5. Restrict the API key to your domains

## 📱 Deployment Options

### Option 1: Firebase Hosting (Recommended)

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase:**
```bash
firebase login
```

3. **Initialize Firebase in your project:**
```bash
firebase init
```
Select:
- Hosting
- Use existing project
- Build directory: `build`
- Single-page app: `Yes`
- Automatic builds: `No`

4. **Build and deploy:**
```bash
npm run build
firebase deploy
```

### Option 2: Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Add environment variables in Vercel dashboard**

### Option 3: Netlify

1. **Build the project:**
```bash
npm run build
```

2. **Deploy to Netlify:**
- Drag and drop the `build` folder to Netlify
- Or connect your GitHub repository

3. **Configure environment variables in Netlify dashboard**

### Option 4: AWS Amplify

1. **Install Amplify CLI:**
```bash
npm install -g @aws-amplify/cli
```

2. **Initialize Amplify:**
```bash
amplify init
```

3. **Add hosting:**
```bash
amplify add hosting
```

4. **Deploy:**
```bash
amplify publish
```

## 🔒 Environment Variables

### Required Variables
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_GOOGLE_MAPS_API_KEY`

### Optional Variables
- `REACT_APP_FIREBASE_MEASUREMENT_ID` (for Analytics)
- `REACT_APP_ENVIRONMENT` (development/staging/production)

## 🧪 Testing Before Deployment

1. **Run tests:**
```bash
npm test
```

2. **Build and test locally:**
```bash
npm run build
npx serve -s build
```

3. **Check for console errors and functionality**

## 📊 Monitoring and Analytics

### Firebase Analytics
- Automatically enabled with Firebase
- Track user engagement and app performance

### Error Monitoring
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for detailed insights

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          # Add other environment variables
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check Node.js version
   - Clear node_modules and reinstall
   - Verify environment variables

2. **Firebase Connection Issues:**
   - Verify Firebase configuration
   - Check API keys and project settings
   - Ensure Firebase services are enabled

3. **Google Maps Not Loading:**
   - Verify API key is correct
   - Check API restrictions
   - Ensure billing is enabled for Google Cloud

### Performance Optimization

1. **Code Splitting:**
```javascript
const LazyComponent = React.lazy(() => import('./Component'));
```

2. **Image Optimization:**
- Use WebP format when possible
- Implement lazy loading
- Compress images before upload

3. **Bundle Analysis:**
```bash
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## 📞 Support

For deployment issues:
1. Check the GitHub Issues
2. Review Firebase documentation
3. Contact the development team

---

**Happy Deploying! 🚀**