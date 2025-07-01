# Manus Mobile Mechanic App

A comprehensive React-based mobile mechanic service application that connects customers with professional mechanics for on-demand automotive services.

## 🚗 Features

### Phase 1: Core Foundation
- User authentication and profile management
- Service booking system
- Real-time mechanic tracking
- Basic payment integration

### Phase 2: Enhanced Services
- Advanced service categories
- Mechanic ratings and reviews
- Service history tracking
- Push notifications

### Phase 3: Advanced Features
- AI-powered diagnostics
- Multi-language support
- Advanced analytics
- Premium service tiers

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS
- **Backend**: Firebase
- **Maps**: Google Maps API
- **AI Integration**: Custom AI services
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage

## 📱 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GrizzlyRooster34/manus-mobile-mechanic-app.git
cd manus-mobile-mechanic-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Firebase config and Google Maps API key in `.env.local`

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication, Firestore, and Storage
3. Add your Firebase configuration to `.env.local`

### Google Maps Setup
1. Get a Google Maps API key
2. Enable Maps JavaScript API and Places API
3. Add the API key to `.env.local`

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── services/           # API and service integrations
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── contexts/           # React contexts
├── assets/             # Static assets
└── styles/             # Global styles
```

## 🚀 Deployment

The app is production-ready and can be deployed to:
- Vercel
- Netlify
- Firebase Hosting
- AWS Amplify

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Manus** - Bringing professional mechanic services to your doorstep.