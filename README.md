# Front Studio - User Management System

A modern React-based frontend application built with Ant Design Pro and UmiJS, featuring real user authentication and backend integration.

## 🌟 Features

- **Real User Authentication**: Integrated with backend API for user signup, login, and profile management
- **Modern UI/UX**: Built with Ant Design Pro components for enterprise-grade user interface
- **TypeScript Support**: Full TypeScript implementation for type safety and better development experience
- **Responsive Design**: Optimized for various screen sizes and devices
- **Internationalization**: Multi-language support with i18n integration
- **State Management**: Efficient state management using UmiJS models
- **API Integration**: RESTful API integration with proper authentication handling

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running on port 8000

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd frontStudio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:8000`

## 🏗️ Project Structure

```
frontStudio/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AiAssistant/     # AI chat components
│   │   ├── HeaderDropdown/  # Header navigation
│   │   └── RightContent/    # User avatar and dropdown
│   ├── pages/               # Application pages
│   │   ├── User/            # User authentication pages
│   │   │   ├── Login/       # Login and signup forms
│   │   │   └── Profile/     # User profile display
│   │   └── Welcome/         # Welcome page
│   ├── services/            # API services and utilities
│   │   └── ant-design-pro/  # Backend API integration
│   └── locales/             # Internationalization files
├── config/                  # Configuration files
│   ├── routes.ts           # Application routing
│   ├── proxy.ts            # Development proxy settings
│   └── oneapi.json         # API configuration
└── public/                  # Static assets
```

## 🔐 Authentication System

### User Registration
- Users can create accounts with email, name, and password
- Registration data is sent to `/api/v1/users/register`
- User ID is stored locally for future API calls

### User Login
- Secure login with email and password
- JWT access token is received and stored
- Automatic redirect after successful authentication

### User Profile
- Real-time user data fetched from backend API
- Profile information includes: name, email, role, creation date
- Manual user ID input option for users without stored ID

## 🌐 API Integration

### Backend Endpoints
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User authentication
- `GET /api/v1/users/{user_id}` - Get user profile (requires authentication)

### Authentication Flow
1. User signs up → receives user ID
2. User logs in → receives access token
3. Access token is used for authenticated API requests
4. User profile is fetched using stored user ID and access token

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run type-check

# Lint code
npm run lint
```

### Configuration Files

- **`config/routes.ts`**: Define application routing
- **`config/proxy.ts`**: Configure development proxy settings
- **`config/oneapi.json`**: API endpoint configuration
- **`src/requestErrorConfig.ts`**: Global request/response handling

## 🔧 Customization

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `config/routes.ts`
3. Update navigation if needed

### API Integration
1. Define interfaces in `src/services/ant-design-pro/api.ts`
2. Implement API functions using the `request` utility
3. Handle authentication with `getAuthHeaders()`

### Styling
- Global styles: `src/global.less`
- Component-specific styles: Use CSS modules or styled-components
- Theme customization: Modify Ant Design theme variables

## 🌍 Internationalization

The application supports multiple languages:
- English (en-US)
- Chinese (zh-CN, zh-TW)
- Russian (ru-RU)
- Turkish (tr-TR)
- Japanese (ja-JP)
- French (fr-FR)
- Portuguese (pt-BR)
- Arabic (ar-DZ)
- Spanish (es-ES)

## 🧪 Testing

- Unit tests with Jest
- Component testing with React Testing Library
- Test files located in `src/pages/User/Login/__snapshots__/`

## 📦 Dependencies

### Core Dependencies
- **React**: UI library
- **UmiJS**: React framework with routing and state management
- **Ant Design Pro**: Enterprise UI components
- **TypeScript**: Type-safe JavaScript

### Development Dependencies
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 🚨 Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Ensure backend server is running on port 8000
   - Check that access token is valid
   - Verify user ID exists in local storage

2. **"Unknown User" Displayed**
   - User ID not found in local storage
   - Navigate to profile page to manually enter user ID
   - Re-register if needed

3. **Port Mismatch**
   - Backend should run on port 8000
   - Frontend development server typically runs on port 8000
   - Check proxy configuration in `config/proxy.ts`

### Debug Mode

Enable console logging to debug API calls:
- Check browser console for authentication headers
- Verify API request URLs and parameters
- Monitor local storage for tokens and user data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the API documentation
- Open an issue in the repository

---

**Built with ❤️ using Ant Design Pro and UmiJS**
