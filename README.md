# Hatrick Chrome Extension

**Thinking cap for learning: summarize, explain, save.**

A Chrome Extension (Manifest V3) that helps you learn by providing AI-powered summaries, term explanations, and vocabulary management.

## Features

- **Context Menu Integration**: Right-click on selected text to get explanations
- **Page Summarization**: Automatic summary generation for web pages
- **AI-Powered Term Explanation**: Real-time explanations using Chrome's built-in Prompt API
- **AI-Powered Page Summarization**: Intelligent summaries using Chrome's built-in Summarizer API
- **Vocabulary Management**: Save and manage your learning vocabulary
- **Side Panel Interface**: Clean, modern UI accessible from any webpage
- **No API Keys Required**: Uses Chrome's built-in Gemini Nano models

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the extension folder
5. The Hatrick extension should now appear in your extensions list

## Usage

### Getting Started
1. Navigate to any webpage
2. Click the Hatrick extension icon in your browser toolbar to open the side panel
3. The extension will automatically start downloading the AI models if needed (first time only)
4. Once ready, use the "Summarize This Page" button or right-click to explain terms

### System Requirements
Chrome AI APIs require:
- **Chrome 138+** with AI APIs origin trial enabled
- **Operating System**: Windows 10/11, macOS 13+, Linux, or ChromeOS (Chromebook Plus)
- **Storage**: At least 22 GB free space (for Gemini Nano model download)
- **GPU**: More than 4 GB VRAM
- **Network**: Unmetered connection for initial model download

### Explaining Terms
1. Select any text on a webpage
2. Right-click and choose "Explain with Hatrick"
3. The side panel will open with AI-powered beginner and advanced explanations
4. Click "Save to Vocabulary" to add the term to your personal vocabulary list

### Managing Vocabulary
- View all saved terms in the "My Vocabulary" section
- Click "Remove" next to any term to delete it from your vocabulary
- Terms are automatically deduplicated when saved

## File Structure

```
hatrick-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for context menus and messaging
├── content.js            # Content script for page text collection
├── panel.html            # Side panel HTML structure
├── panel.js              # Side panel JavaScript logic
├── styles.css            # Extension styling
└── README.md             # This file
```

## Technical Details

### Manifest V3 Features
- Service worker-based background script
- Side panel API integration
- Context menu API for text selection
- Storage API for data persistence

### Data Flow
1. **Content Script** collects page text and stores it locally
2. **Background Script** handles context menu clicks and message routing
3. **Panel Script** manages UI interactions and displays results
4. **Storage API** persists vocabulary and user selections

### Chrome AI APIs Integration
- **Built-in AI**: Uses Chrome's built-in Gemini Nano models via Prompt API and Summarizer API
- **No API Keys**: No external API keys or authentication required
- **Local Processing**: AI processing happens locally on your device
- **Fallback Mode**: Falls back to mock data if APIs are unavailable
- **Model Management**: Automatic model download and status monitoring
- **Specialized APIs**: Uses dedicated Summarizer API for page summaries and Prompt API for term explanations

## Development

### Prerequisites
- Chrome 138+ with Developer mode enabled
- Chrome AI APIs origin trial enabled (visit [chrome://flags](chrome://flags) and enable AI APIs)
- Basic understanding of Chrome Extension APIs

### Testing
1. Load the extension in Developer mode
2. Test on various websites
3. Check browser console for any errors
4. Verify all message flows work correctly

### Future Enhancements
- Export vocabulary functionality
- Custom explanation styles
- Enhanced session management
- Streaming responses for better UX
- Different summary types (TLDR, teaser, headline)
- Custom summary lengths and formats

## Version

**v0.2.0** - Chrome AI APIs integration with Prompt API and Summarizer API

## License

This project is for educational and demonstration purposes.
