import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Switch
} from 'react-native';
import { Camera, CameraView } from 'expo-camera'; // Ensure this import is successful
import * as Speech from 'expo-speech'; // CORRECTED: Was previously "import * => {"
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for icons
// Remove NetworkInfo import as it's causing issues

// Get screen dimensions for responsive layout
const { width: screenWidth } = Dimensions.get('window');

// Simple HTTP server for receiving commands
let server = null;
let serverPort = 8080;
let pollingInterval = null;

// Main App Component
export default function App() {
  const [hasPermission, setHasPermission] = useState(null); // Camera and Speech permission state (true/false/null)
  const [cameraReady, setCameraReady] = useState(false); // Camera readiness state
  const [currentMode, setCurrentMode] = useState('passive'); // Active mode (read, navigate, passive)
  const [message, setMessage] = useState('Initializing app...'); // Message display
  const [isProcessing, setIsProcessing] = useState(false); // Loading indicator state
  const [remoteControlEnabled, setRemoteControlEnabled] = useState(false); // Remote control toggle
  const [serverStatus, setServerStatus] = useState('Stopped'); // Server status
  const [deviceIP, setDeviceIP] = useState(''); // Device IP address
  const cameraRef = useRef(null); // Reference to the camera component

  // --- Firebase Configuration and Initialization (Dummy for local, actual for deployment) ---
  // These variables are typically provided by the Canvas environment.
  // For local testing, you might hardcode a dummy config or handle its absence.
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  /**
   * Updates the message text displayed in the app and optionally speaks it aloud.
   * @param {string} msg - The message to display.
   * @param {boolean} shouldSpeak - Whether the message should be spoken aloud.
   */
  const updateMessage = (msg, shouldSpeak = false) => {
    setMessage(msg);
    if (shouldSpeak) {
      speak(msg);
    }
  };

  /**
   * Starts a simple HTTP server to receive commands from other devices
   */
  const startServer = async () => {
    try {
      setServerStatus('Starting...');
      
      // For now, we'll use a placeholder IP and implement a simple polling mechanism
      // In a real implementation, you'd use a proper HTTP server library
      const placeholderIP = '192.168.1.100'; // This would be the actual IP in production
      setDeviceIP(placeholderIP);
      
      // Simulate server functionality
      setServerStatus('Running');
      updateMessage(`Remote control enabled. Other devices can send commands to: http://${placeholderIP}:${serverPort}`, true);
      
      // Start polling for commands (simplified approach)
      startCommandPolling();
      
    } catch (error) {
      console.error('Error starting server:', error);
      setServerStatus('Error');
      updateMessage('Failed to start remote control server', true);
    }
  };

  /**
   * Stops the HTTP server
   */
  const stopServer = () => {
    setServerStatus('Stopped');
    setRemoteControlEnabled(false);
    updateMessage('Remote control disabled', true);
    // Stop polling if it was running
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };

  /**
   * Starts polling for commands (simplified approach)
   */
  const startCommandPolling = () => {
    // In a real implementation, this would be a proper HTTP server
    // For now, we'll simulate command reception
    console.log('Command polling started - ready to receive commands');
  };

  /**
   * Toggles remote control functionality
   */
  const toggleRemoteControl = () => {
    if (remoteControlEnabled) {
      stopServer();
    } else {
      setRemoteControlEnabled(true);
      startServer();
    }
  };

  /**
   * Handles incoming remote commands
   * @param {string} command - The command received from another device
   */
  const handleRemoteCommand = (command) => {
    switch (command.toLowerCase()) {
      case 'speak':
        speak('Hello from remote device!');
        break;
      case 'status':
        speak(`Current mode is ${currentMode}`);
        break;
      case 'read':
        setCurrentMode('read');
        speak('Mode set to read');
        break;
      case 'navigate':
        setCurrentMode('navigate');
        speak('Mode set to navigate');
        break;
      case 'passive':
        setCurrentMode('passive');
        speak('Mode set to passive');
        break;
      default:
        speak(`Received command: ${command}`);
    }
  };

  // Request camera and speech permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      let cameraGranted = false;
      let speechGranted = false;
      let permissionMessage = 'Requesting camera and speech permissions...';
      updateMessage(permissionMessage, false); // Don't speak this initial loading message

      try {
        // Request Camera Permission
        // Check if Camera module and its methods are available before requesting permissions
        if (Camera && typeof Camera.requestCameraPermissionsAsync === 'function') {
          const cameraStatus = await Camera.requestCameraPermissionsAsync();
          cameraGranted = cameraStatus.status === 'granted';
          console.log('Camera Permission Status:', cameraStatus.status);
        } else {
          console.error('Expo Camera module is not available or not linked correctly. Check installation.');
          permissionMessage = 'Camera module not found or not functional. Please ensure all Expo packages are installed correctly.';
          setHasPermission(false); // Mark permissions as false if camera module is missing
          updateMessage(permissionMessage, true);
          return; // Exit early if camera module is the issue
        }

        speechGranted = true;

        if (cameraGranted && speechGranted) {
          setHasPermission(true);
          permissionMessage = 'Camera and Speech permissions granted. Select a mode and tap the button.';
          // Automatically set passive mode as active initially
          setCurrentMode('passive');
        } else {
          setHasPermission(false);
          permissionMessage = ''; // Clear previous message before building new one
          if (!cameraGranted) {
            permissionMessage += 'Camera permission not granted. Please enable it in settings. ';
          }
          if (!speechGranted) {
            permissionMessage += 'Speech permission not granted. Please enable it in settings (look for Microphone access for Expo Go or your app).';
          }
          if (!permissionMessage) { // Fallback if somehow both are undefined but not granted
              permissionMessage = 'Some permissions were not granted. Please check app settings.';
          }
        }
      } catch (error) {
        console.error('Error during permission request:', error);
        permissionMessage = `Error requesting permissions: ${error.message}. Please check app settings.`;
        setHasPermission(false);
      } finally {
        // Use a timeout to ensure the UI has time to update to the "requesting" state
        // before showing the final permission status.
        setTimeout(() => {
          updateMessage(permissionMessage, true); // Now speak the final status
        }, 500); // 500ms delay
      }
    };

    requestPermissions();
  }, []); // Run only once on component mount


  /**
   * Returns the appropriate prompt for the Gemini API based on the current mode.
   * @param {string} mode - The current operational mode ('read', 'navigate', 'passive').
   * @returns {string} The detailed prompt for the Gemini model.
   */
  const getPromptForMode = (mode) => {
    switch (mode) {
      case 'read':
        return "Extract all readable text from this image. No extra commentary or explanation. Prioritize the most important text.";
      case 'navigate':
        return "Describe the immediate environment for indoor navigation. Identify key objects, obstacles, pathways, and directional cues. Mention any furniture, doors, stairs, changes in floor level, or other significant features. Provide guidance on what's directly in front, to the left, and to the right. Highlight potential hazards or clear paths.";
      case 'passive':
      default:
        return "Describe the scene briefly. Focus on elements that would be helpful for a visually impaired person to navigate or understand their surroundings. For example, if there's text, read it out. If there are obstacles, describe them. Be concise but informative.";
    }
  };

  /**
   * Handles the image capture and API call logic.
   */
  const processImage = async () => {
    if (!cameraReady || !cameraRef.current) {
      updateMessage('Camera not ready. Please wait or refresh the app.', true);
      return;
    }

    setIsProcessing(true);
    updateMessage('Analyzing image, please wait...', false); // Don't speak this
    Speech.stop(); // Stop any ongoing speech

    try {
      // Take a picture with base64 encoding
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7, // Adjust quality for faster processing
        allowsEditing: false,
        exif: false,
      });

      const base64ImageData = photo.base64;
      const prompt = getPromptForMode(currentMode);

      // Construct the payload for the Gemini API call
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg", // Assume JPEG from takePictureAsync
                  data: base64ImageData
                }
              }
            ]
          }
        ],
      };

      // Define API key and URL for Gemini model
      const apiKey = "{insert here}"; // Canvas will inject this at runtime if empty
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      // Make the API call to Gemini
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Gemini API Response:', result);

      let description = 'Could not get a description.';
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        description = result.candidates[0].content.parts[0].text;
      } else {
        description = 'No clear description was generated. Please try again.';
        console.error('Unexpected API response structure or missing content:', result);
      }

      updateMessage(description, true); // Speak the description
    } catch (error) {
      console.error('Error during capture or API call:', error);
      const errorMessage = `Failed to get description: ${error.message}. Please try again.`;
      updateMessage(errorMessage, true);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Speaks the given text using Expo Speech.
   * @param {string} text - The text to be spoken.
   */
  const speak = (text) => {
    Speech.stop(); // Stop any current speech before starting new one
    Speech.speak(text, {
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
    });
  };

  // If camera permission is not yet determined or denied
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.messageText}>{message}</Text> {/* Show initializing/requesting message */}
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>{message}</Text>
        <Text style={styles.permissionHint}>
          Please check your app settings and ensure both Camera and Microphone (for speech) permissions are enabled.
        </Text>
      </View>
    );
  }

  // Render the main application UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seeing AI: Multi-Mode</Text>

      {/* Camera Preview - Top Half */}
      <View style={styles.cameraContainer}>
        {/* Conditionally render Camera only if the Camera module itself and its Constants are available */}
        {Camera ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back" // Use back camera
            onCameraReady={() => setCameraReady(true)}
          >
            {!cameraReady && (
              <View style={styles.cameraLoadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.cameraLoadingText}>Loading Camera...</Text>
              </View>
            )}
          </CameraView>
        ) : (
          <View style={styles.cameraNotAvailableOverlay}>
            <Ionicons name="camera-off-outline" size={60} color="#ef4444" />
            <Text style={styles.cameraNotAvailableText}>Camera Not Available</Text>
            <Text style={styles.cameraNotAvailableHint}>
              Please ensure Expo Camera is installed and linked correctly.
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Half - All Controls */}
      <View style={styles.bottomControlsContainer}>
        {/* Mode Selection Buttons */}
        <View style={styles.modeButtonContainer}>
          <ModeButton
            title="Read"
            iconName="document-text-outline"
            isActive={currentMode === 'read'}
            onPress={() => {
              setCurrentMode('read');
              updateMessage('Mode set to Read. Tap "Read Document" to scan text.', true);
            }}
          />
          <ModeButton
            title="Navigate"
            iconName="walk-outline"
            isActive={currentMode === 'navigate'}
            onPress={() => {
              setCurrentMode('navigate');
              updateMessage('Mode set to Navigate. Tap "Get Navigation Cues" for indoor guidance.', true);
            }}
          />
          <ModeButton
            title="Passive"
            iconName="eye-outline"
            isActive={currentMode === 'passive'}
            onPress={() => {
              setCurrentMode('passive');
              updateMessage('Mode set to Passive. Tap "Describe Environment" for general descriptions.', true);
            }}
          />
        </View>

        {/* Remote Control Section */}
        <View style={styles.remoteControlSection}>
          <View style={styles.remoteControlHeader}>
            <Ionicons name="phone-portrait-outline" size={24} color="#3b82f6" />
            <Text style={styles.remoteControlTitle}>Remote Control</Text>
          </View>
          
          <View style={styles.remoteControlToggleContainer}>
            <Text style={styles.remoteControlLabel}>Enable Remote Control:</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              thumbColor={remoteControlEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleRemoteControl}
              value={remoteControlEnabled}
            />
          </View>
          
          {remoteControlEnabled && (
            <View style={styles.remoteControlInfo}>
              <Text style={styles.deviceIPText}>
                Device IP: {deviceIP || 'Loading...'}
              </Text>
              <Text style={styles.serverStatusText}>
                Server Status: {serverStatus}
              </Text>
              <Text style={styles.remoteControlHint}>
                Other devices can send commands to this phone via HTTP requests
              </Text>
            </View>
          )}
        </View>

        {/* Capture Button */}
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={processImage}
          disabled={!cameraReady || isProcessing || !Camera || !Speech} // Disable if modules are not loaded
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="camera-outline" size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.captureButtonText}>
                {currentMode === 'read'
                  ? 'Read Document'
                  : currentMode === 'navigate'
                  ? 'Get Navigation Cues'
                  : 'Describe Environment'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Stop Button */}
        <TouchableOpacity
          style={styles.stopButton}
          onPress={() => {
            Speech.stop(); // Stop any ongoing speech
            setIsProcessing(false); // Stop any ongoing processing
            updateMessage('Stopped all operations', true);
          }}
        >
          <Ionicons name="stop-circle-outline" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>

        {/* Message Box */}
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

// Separate component for Mode Buttons to improve readability and reusability
const ModeButton = ({ title, iconName, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.modeButton, isActive && styles.modeButtonActive]}
    onPress={onPress}
  >
    <Ionicons name={iconName} size={20} color={isActive ? '#ffffff' : '#4b5563'} style={styles.buttonIcon} />
    <Text style={[styles.modeButtonText, isActive && styles.modeButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Stylesheet for the React Native components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // light gray background
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 20, // Add padding for status bar on Android
    paddingHorizontal: 16,
  },
  bottomControlsContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937', // dark gray
    marginBottom: 20,
  },
  modeButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8, // Reduced gap between buttons
    marginBottom: 15,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb', // gray-200
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButtonActive: {
    backgroundColor: '#3b82f6', // blue-500
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563', // gray-700
    marginLeft: 5,
  },
  modeButtonTextActive: {
    color: '#ffffff', // white
  },
  remoteControlSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    width: screenWidth * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  remoteControlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  remoteControlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  remoteControlToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  remoteControlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  remoteControlInfo: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
  },
  deviceIPText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 5,
  },
  serverStatusText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  remoteControlHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  cameraContainer: {
    width: screenWidth * 0.9, // 90% of screen width
    height: '45%', // Take up roughly the top half of the screen
    borderRadius: 15,
    overflow: 'hidden', // Ensures content stays within rounded borders
    marginBottom: 10,
    backgroundColor: '#ccc', // Placeholder color while camera loads
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  camera: {
    flex: 1,
    width: '100%', // Take full width of container
  },
  cameraLoadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Cover the entire camera area
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  cameraNotAvailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffebee', // light red background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraNotAvailableText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444', // red-500
    marginTop: 10,
    textAlign: 'center',
  },
  cameraNotAvailableHint: {
    fontSize: 14,
    color: '#dc2626', // red-600
    marginTop: 5,
    textAlign: 'center',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb', // blue-600
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    minWidth: screenWidth * 0.7, // Minimum width for the button
    marginBottom: 15,
    transitionDuration: 300, // For transform hover:scale-105 effect imitation
  },
  captureButtonDisabled: {
    backgroundColor: '#9ca3af', // gray-400
  },
  captureButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626', // red-600
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: screenWidth * 0.4, // Smaller than capture button
    marginBottom: 15,
    alignSelf: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  messageBox: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6', // blue-500
    padding: 12,
    borderRadius: 12,
    width: screenWidth * 0.9, // 90% of screen width
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151', // gray-700
    lineHeight: 24,
  },
  permissionHint: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#ef4444', // red-500
    paddingHorizontal: 20,
  }
});
