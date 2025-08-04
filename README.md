# Pathfinder AI App - Multi-Mode Visual Assistant

A React Native mobile application designed to assist visually impaired users by providing real-time visual descriptions using AI-powered image analysis. The app features multiple operational modes and remote control capabilities.

**⚠️ Demo Version Notice**: This is a demonstration/prototype version of the application. The final product will operate purely through voice commands, eliminating the need for touch interactions and providing a fully hands-free experience for visually impaired users.

## 🎯 Features

### Core Functionality
- **Multi-Mode Operation**: Three distinct modes for different use cases
  - **Read Mode**: Extracts and reads text from documents and images
  - **Navigate Mode**: Provides indoor navigation guidance and obstacle detection
  - **Passive Mode**: General environment description for situational awareness

### Technical Features
- **Real-time Camera Analysis**: Live camera feed with AI-powered image processing
- **Text-to-Speech**: Audio feedback for all descriptions and status updates
- **Responsive UI**: Modern, accessible interface optimized for touch interaction (Demo only - final version will be voice-controlled)

### Accessibility Features
- Voice feedback for all operations
- Large, high-contrast buttons (Demo only)
- Clear audio status updates
- One-tap operation modes (Demo only - final version will use voice commands)

### Future Features (Final Product)
- **Voice-Only Interface**: Complete hands-free operation through voice commands
- **Natural Language Processing**: Advanced voice recognition for intuitive commands
- **Continuous Listening**: Always-on voice detection for immediate response
- **Voice Navigation**: All modes and functions accessible through speech

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PathfinderApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 📱 Usage

### Initial Setup
1. Grant camera and microphone permissions when prompted
2. Wait for the app to initialize and camera to load
3. Select your preferred mode using the mode buttons

### Operating Modes

#### Read Mode
- **Purpose**: Extract and read text from documents, signs, and labels
- **Usage**: Point camera at text and tap "Read Document"
- **Output**: Spoken text extraction with priority on important content

#### Navigate Mode
- **Purpose**: Indoor navigation assistance and obstacle detection
- **Usage**: Point camera around your environment and tap "Get Navigation Cues"
- **Output**: Description of obstacles, pathways, doors, stairs, and directional guidance

#### Passive Mode
- **Purpose**: General environment awareness and description
- **Usage**: Point camera at any scene and tap "Describe Environment"
- **Output**: Brief, informative descriptions of surroundings

### Remote Control
- Toggle "Remote Control" to enable HTTP server
- Other devices can send commands via HTTP requests
- Supported commands: `speak`, `status`, `read`, `navigate`, `passive`

### Controls (Demo Version)
- **Capture Button**: Takes photo and processes with AI
- **Stop Button**: Stops ongoing speech and processing
- **Mode Buttons**: Switch between Read, Navigate, and Passive modes

**Note**: In the final product, all these functions will be accessible through voice commands, eliminating the need for touch controls entirely.

## 🛠️ Technical Details

### Dependencies
- **React Native**: 0.79.4
- **Expo**: ~53.0.12
- **expo-camera**: ~16.1.8
- **expo-speech**: ~13.1.7
- **@expo/vector-icons**: ^14.1.0

### AI Integration
- Uses Google's Gemini 2.0 Flash model for image analysis
- API key injection handled at runtime
- Optimized prompts for each operational mode

### Architecture
- Single-screen React Native application
- Component-based architecture with reusable UI elements
- Async/await pattern for API calls and permissions
- State management using React hooks

## 🔧 Configuration

### API Setup
The app requires a Google Gemini API key for image analysis:
1. Obtain API key from Google AI Studio
2. The key will be injected at runtime in production
3. For development, you may need to configure the API key manually

### Permissions
The app requires the following permissions:
- **Camera**: For capturing images for analysis
- **Microphone**: For text-to-speech functionality

## 📁 Project Structure

```
PathfinderApp/
├── App.js                 # Main application component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── assets/              # App icons and splash screens
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
└── README.md            # This file
```

## 🚨 Troubleshooting

### Common Issues

**Camera not loading**
- Ensure camera permissions are granted
- Check if Expo Camera is properly installed
- Restart the development server

**Speech not working**
- Verify microphone permissions
- Check device volume settings
- Ensure expo-speech is properly linked

**API errors**
- Verify API key configuration
- Check internet connectivity
- Review API quota limits

### Development Tips
- Use Expo Go app for quick testing on physical devices
- Enable debug mode for detailed error logging
- Test on both iOS and Android for compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Built with React Native and Expo
- Powered by Google Gemini AI
- Designed for accessibility and ease of use
- Inspired by the need for better visual assistance tools
- Demo version created to showcase core functionality before voice-only implementation

---

**Note**: This application is designed to assist visually impaired users but should not be used as a replacement for proper medical or mobility assistance. Always use appropriate safety measures when navigating unfamiliar environments.

**Demo Version Disclaimer**: This is a prototype demonstrating the core AI-powered visual assistance functionality. The final product will feature a complete voice-only interface, making it fully accessible for hands-free operation by visually impaired users. 
