# Manus Mobile Mechanic App

A comprehensive React-based mobile mechanic service application that connects customers with professional mechanics for on-demand automotive services.

## Features

### Core Components
- **App.js** - Main application router with authentication
- **ServiceRequestForm** - Customer service request creation
- **QuoteForm** - Mechanic quote generation
- **JobStatusManager** - Enhanced job status tracking with custom statuses
- **PaymentStatusTracker** - Payment status management and reminders
- **PhotoUpload** - Job documentation with categorized photos
- **RatingReviewForm** - Customer feedback and rating system

### Advanced Features
- **DiagnosticForm & DiagnosticResults** - AI-powered vehicle diagnostics
- **EnhancedVINScanner** - VIN scanning with vehicle information lookup
- **LicensePlateCapture** - OCR license plate scanning
- **LiveChatWidget** - Customer support chat with AI assistant
- **LiveJobMap** - Google Maps integration for job locations
- **MechanicNotes** - Private mechanic notes system
- **CancelJobModal** - Job cancellation with reason tracking

### Admin & Management
- **AdminDashboard** - Business management interface
- **PartsInventoryManager** - Parts inventory and ordering system
- **MaintenanceReminderManager** - Vehicle maintenance scheduling
- **VehicleGarageManager** - Customer vehicle management

## Technology Stack

- **Frontend**: React, React Native (for mobile)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Maps**: Google Maps API
- **AI/ML**: OpenAI GPT for diagnostics, Google Cloud Vision for OCR
- **Payment**: Stripe integration
- **Real-time**: Firebase real-time database

## Key Features

### For Customers
- Request mobile mechanic services
- Upload photos and describe issues
- Track job status in real-time
- Receive quotes and approve work
- Make payments securely
- Rate and review mechanics
- Manage vehicle information
- Maintenance reminders

### For Mechanics
- View and accept job requests
- Create detailed quotes
- Update job status
- Upload progress photos
- Add private notes
- Manage parts inventory
- Track earnings and analytics
- Navigate to job locations

### For Admins
- Manage users and mechanics
- Set pricing and service areas
- View business analytics
- Export data and reports
- Configure system settings

## Installation

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
cp .env.example .env
# Edit .env with your Firebase, Google Maps, and other API keys
```

4. Start the development server:
```bash
npm start
```

## Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Add your Firebase config to the environment variables

### Google Maps Setup
1. Enable Google Maps JavaScript API
2. Enable Google Cloud Vision API (for OCR)
3. Add your API key to environment variables

### OpenAI Setup
1. Get an OpenAI API key
2. Add to environment variables for diagnostic features

## Project Structure

```
src/
├── components/          # React components
├── services/           # Business logic and API calls
├── firebase/           # Firebase configuration
├── pages/             # Page components
├── utils/             # Utility functions
└── styles/            # CSS and styling
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
