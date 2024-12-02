# Secure Docs Tagger Extension

This Chrome extension allows you to identify and visualize the confidentiality level of a Google Docs document, along with a detailed explanation of why it is classified that way. To achieve this, we use the Google Docs API to extract the document's content and integrate AI APIs within Chrome for classification purposes.

First, you need to configure OAuth in Google Cloud to enable secure access to Google Docs content. This will allow the extension to authenticate and authorize requests securely.

## Configuring OAuth in Google Cloud

### 1. Create a Project in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project selector at the top
3. Click "New Project"
   - Name: "Secure Docs Tagger" (or any name you prefer)
   - Click "Create"

### 2. Enable the Google Docs API

1. In the side menu, go to "APIs & Services" > "Library"
2. Search for "Google Docs API"
3. Click "Google Docs API"
4. Click "Enable"

### 3. Configure the Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type
3. Click "Create"
4. Fill out the required information:
   - App Name: "Secure Docs Tagger"
   - Support Email: [your email]
   - Developer Contact Email: [your email]
5. Click "Save and Continue"
6. In the "Scopes" section:
   - Click "Add or Remove Scopes"
   - Select `https://www.googleapis.com/auth/documents.readonly`
7. Click "Save and Continue"
8. In "Test Users":
   - Click "Add Users"
   - Add your email address
   - Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth Client ID"
3. Select "Chrome App" as the application type
4. Fill out the information:
   - Name: "Secure Docs Tagger"
   - Chrome App ID: [Your Extension ID]

### 5. Get the Extension ID

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer Mode" (top-right corner)
3. Click "Load Unpacked"
4. Select the `chrome-extension` folder
5. Copy the ID shown under the extension name

### 6. Set Up OAuth Credentials

1. Return to the Google Cloud Console
2. On the credentials creation page:
   - Paste the extension ID you copied
3. Click "Create"
4. Copy the generated Client ID

### 7. Configure the Extension

1. Open the `manifest.json` file
2. Replace the `client_id` value with the Client ID you copied:
   ```json
   "oauth2": {
       "client_id": "YOUR-CLIENT-ID.apps.googleusercontent.com",
       "scopes": [
           "https://www.googleapis.com/auth/documents.readonly"
       ]
   }
   ```

## Configure Google Chrome to Enable Integrated AI APIs

To activate integrated AI APIs, the following flags must be enabled:

1. chrome://flags/#prompt-api-for-gemini-nano -> Enabled
2. chrome://flags/#writer-api-for-gemini-nano -> Enabled
3. chrome://flags/#summarization-api-for-gemini-nano -> Enabled
4. chrome://flags/#rewriter-api-for-gemini-nano -> Enabled
5. chrome://flags/#language-detection-api -> Enabled
6. chrome://flags/#translation-api -> Enabled
7. chrome://flags/#optimization-guide-on-device-model -> Enabled BypassPerfRequirement

## Using the Extension

1. Open a Google Docs document
2. Click the extension icon to open the side panel
3. Authorize the extension when prompted for the first time
4. The document content will be displayed in the panel
5. Use the "Update Classification" button to refresh the classification.

## Troubleshooting

### Error 401 (Unauthorized)
- Verify that the Client ID is correctly configured
- Ensure you have authorized the application
- Try reloading the extension

### Content Not Displayed
- Ensure you are in a Google Docs document
- Check that the Google Docs API is enabled
- Review the developer console for errors

### Other Issues
- Ensure your email is in the test users list
- Verify all required permissions are set up
- Try uninstalling and reinstalling the extension