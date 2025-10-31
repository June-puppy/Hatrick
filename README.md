# Hatrick Chrome Extension

**Your thinking cap for learning: summarize, explain, save.**

A Chrome Extension (Manifest V3) that helps you learn by providing AI-powered summaries, term explanations, and vocabulary management using Chrome's built-in Gemini Nano models.

## 🚀 Features

### Core Learning Tools
- **First Skim**: Get key ideas, important terms, and the big picture of any article
- **Mind Map**: View paragraph-by-paragraph summaries to understand content structure
- **Vocab Pocket**: Save and manage your learning vocabulary with explanations
- **Ask Hatrick**: Interactive AI assistant for questions about webpage content


### AI-Powered Capabilities
- **Smart Term Explanation**: Context-aware explanations adapted to your experience level
- **Page Summarization**: Intelligent summaries using Chrome's built-in Summarizer API
- **Field Detection**: Automatically detects academic/professional fields from content
- **Experience-Based Learning**: Beginner, Intermediate, and Professional explanation levels

### User Experience
- **Side Panel Interface**: Clean, modern UI accessible from any webpage
- **Context Menu Integration**: Right-click on selected text for instant explanations
- **No API Keys Required**: Uses Chrome's built-in Gemini Nano models
- **Local Processing**: All AI processing happens on your device
- **Vocabulary Management**: Organize terms by field with personal notes

## 📋 System Requirements

### Browser Requirements
- **Chrome 138+** with AI APIs enabled
- Developer mode enabled for installation

### Hardware Requirements
- **Operating System**: Windows 10/11, macOS 13+, Linux, or ChromeOS (Chromebook Plus)
- **Storage**: At least **22 GB free space** (for Gemini Nano model download)
- **Memory**: **16 GB RAM** minimum for CPU processing
- **GPU**: **4+ GB VRAM** for optimal performance
- **Network**: Unmetered connection for initial model download

### Setup Instructions
1. Visit `chrome://flags` and enable "Prompt API for Gemini Nano" and "Summarization API for Gemini Nano"
2. Restart Chrome
3. The extension will automatically download required models on first use

## 🔧 Installation

1. **Download the extension**
   - Clone this repository or download as ZIP
   - Extract to a folder on your computer

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" and select the extension folder
   - The Hatrick extension should appear in your extensions list

3. **Verify installation**
   - Click the Hatrick icon in your browser toolbar
   - The side panel should open with the welcome screen

## 📖 Usage Guide xxx

### Getting Started
1. Navigate to any webpage with text content
2. Click the Hatrick extension icon to open the side panel
3. Complete the welcome setup by selecting your field and experience level
4. The extension will download AI models if needed (first time only - may take several minutes)

### Using First Skim
- Click "First Skim" to get a page summary and highlighted key terms
- View extracted keywords with explanations
- Save important terms to your vocabulary

### Using Mind Map
- Click "Mind Map" to see paragraph-by-paragraph summaries
- Each paragraph is categorized by importance level (High, Medium, Low)
- Helps you understand content structure and flow

### Using Vocab Pocket
- View all saved terms organized by field
- Click any term to see its explanation
- Remove terms you no longer need

### Explaining Terms
1. **Method 1**: Select text → Right-click → "Explain with Hatrick"
2. **Method 2**: Use the inline explanation dialog when available
3. Explanations adapt to your experience level (Beginner/Intermediate/Professional)
4. Click the heart icon to save terms to your vocabulary

### Ask Hatrick
- Use the chat interface to ask questions about webpage content
- Get contextual answers based on the current page
- Ideal for clarifying concepts or exploring topics deeper

## 📁 File Structure

```
hatrick-extension/
├── manifest.json                    # Extension configuration
├── background.js                    # Service worker and AI API integration
├── content.js                      # Page text collection and highlighting
├── panel.html                      # Side panel HTML structure  
├── panel.js                        # Side panel logic and UI management
├── styles.css                      # Extension styling
├── professional_categories_subfields.csv  # Field detection data
├── color hats/                     # Hat collection images
│   ├── color hats1.png
│   ├── color hats2.png
│   └── ...
└── README.md                       # This file
```

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Service Worker**: Background processing with `background.js`
- **Content Script**: Page interaction via `content.js`
- **Side Panel**: UI management through `panel.js`

### Chrome AI APIs Integration
- **Built-in AI**: Uses Chrome's Gemini Nano models locally
- **Prompt API**: Powers term explanations and Ask Hatrick features
- **Summarizer API**: Handles page and paragraph summarization
- **Model Management**: Automatic download and status monitoring
- **Fallback Mode**: Mock data when APIs are unavailable

### Data Flow
1. **Content Script** collects page text via `collectPageText()`
2. **Background Script** processes AI requests through Chrome APIs
3. **Panel Script** manages UI and displays results
4. **Storage API** persists vocabulary and user settings

### Key Functions
- `getSummaryWithAPI()` - Page summarization
- `getCoreKeywordsWithAPI()` - Keyword extraction  
- `highlightKeywords()` - Visual highlighting
- `handleCoreFinderClick()` - First Skim functionality
- `handleReadingMapClick()` - Mind Map generation

## 🛠️ Development

### Prerequisites
- Chrome 138+ with Developer mode enabled
- Chrome AI APIs origin trial enabled
- Basic understanding of Chrome Extension APIs and JavaScript

### Testing
1. Load the extension in Developer mode
2. Test core features on various websites
3. Check browser console for errors in background and content scripts
4. Verify message flows between scripts work correctly
5. Test with different field types and experience levels

### Debugging
- Background script: Check `chrome://extensions` → Service Workers
- Content script: Use webpage developer tools console
- Panel script: Right-click side panel → Inspect

### Known Limitations
- AI model download requires stable internet connection
- Large pages may take longer to process
- Some dynamic websites may not be fully supported

## 🔄 Version History

**v0.2.0** - Chrome AI APIs Integration
- Added Chrome Prompt API and Summarizer API integration
- Implemented field detection and experience-based explanations
- Added Mind Map and Ask Hatrick features
- Enhanced vocabulary management system

## 📝 Future Enhancements

- **Export Functionality**: Export vocabulary to various formats
- **Custom Themes**: Personalized UI styling options
- **Enhanced Session Management**: Better state persistence
- **Streaming Responses**: Real-time AI response updates
- **Advanced Summarization**: Multiple summary types (TLDR, detailed, bullet points)
- **Cross-Device Sync**: Synchronize vocabulary across devices

## 📄 License

This project is for educational and demonstration purposes. Built to showcase Chrome AI APIs integration and modern extension development practices.

## 🆘 Support

If you encounter issues:
1. Ensure Chrome AI APIs are enabled in `chrome://flags`
2. Check that your system meets hardware requirements
3. Verify the extension has necessary permissions
4. Check browser console for error messages

For development questions, refer to the Chrome Extension documentation and Chrome AI APIs guidance.
