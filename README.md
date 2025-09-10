# RX Success Academy - Frontend

A Progressive Web App (PWA) for RX Success Academy's digital magazine platform with subscription management.

## Features

- 📱 Progressive Web App with offline capabilities
- 🔐 User authentication and subscription management
- 📖 Digital magazine access (Complan & Products)
- 💳 Stripe integration for payments
- 📊 User dashboard with subscription tracking
- 🎨 Modern, responsive UI

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel
- **Backend API**: Express.js (separate repository)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd rx-success-academy-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

The application uses the following environment variables (configured in Vercel):

- `VITE_API_URL`: Backend API URL
- `VITE_NODE_ENV`: Environment (production/development)

## Deployment

This application is deployed on Vercel and connected to the domain: https://rxsuccessacademy.com

### Manual Deployment

1. Push changes to the main branch
2. Vercel will automatically deploy the changes
3. The deployment will be available at your custom domain

## Project Structure

```
├── Complan/              # Complan magazine content
├── Products/             # Products magazine content
├── js/                   # JavaScript modules
│   ├── api-client.js     # API communication
│   ├── dev-auth.js       # Development authentication
│   └── supabase-client.js # Supabase integration
├── index.html            # Main landing page
├── auth.html             # Authentication page
├── dashboard.html        # User dashboard
├── subscription.html     # Subscription management
├── admin.html            # Admin interface
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── pwa-install.js        # PWA installation logic
└── vercel.json           # Vercel configuration
```

## PWA Features

- **Offline Access**: Cached content available offline
- **Install Prompt**: Users can install the app on their devices
- **Push Notifications**: (Future feature)
- **Background Sync**: (Future feature)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, contact: support@rxsuccessacademy.com
