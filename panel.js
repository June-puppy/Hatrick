// Hatrick Chrome Extension - Panel Script
// Handles UI interactions and communication with background script
//
// Main Features:
// 1. User onboarding and settings management
// 2. SmartRead Buddy functionality (Core Finder, Reading Map, Vocab Pocket)
// 3. Term explanation display and management
// 4. Vocabulary management
// 5. Communication with content script and background script

console.log('📋 Panel script loaded and starting...');

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

let userField = '';
let userExperience = '';
let selectedFieldLabel = null;
let lastExtractedKeywords = null;
let highlightsVisible = false;
let selectedFieldForVocabulary = ''; // Track which field's vocabulary to display
let isSelecting = false;

// Dynamic field-hat mapping system
const FIELD_HAT_MAPPING = {
  'Artificial Intelligence': 'color hats1.png',
  'Landscape Architecture': 'color hats2.png',
  'Python': 'color hats3.png',
  'default': 'logo.png'
};

// Available hat images for new fields
const AVAILABLE_HATS = [
  'color hats4.png',
  'color hats5.png',
  'color hats6.png'
];

// Track which hats are currently assigned
let assignedHats = new Set(['color hats1.png', 'color hats2.png', 'color hats3.png']);

// Assign a new hat to a new field
function assignHatToNewField(field) {
  // Check if field already has a hat
  if (FIELD_HAT_MAPPING[field]) {
    console.log(`🎩 Field "${field}" already has a hat:`, FIELD_HAT_MAPPING[field]);
    return FIELD_HAT_MAPPING[field];
  }
  
  // Find next available hat
  const availableHat = AVAILABLE_HATS.find(hat => !assignedHats.has(hat));
  
  if (availableHat) {
    // Assign the hat to the field
    FIELD_HAT_MAPPING[field] = availableHat;
    assignedHats.add(availableHat);
    console.log(`🎩 Assigned hat "${availableHat}" to field "${field}"`);
    return availableHat;
  } else {
    // No more hats available, use default
    console.log(`⚠️ No more hats available for field "${field}", using default`);
    return FIELD_HAT_MAPPING['default'];
  }
}

// Update logo based on current field
function updateLogoForField(field) {
  const hatImage = FIELD_HAT_MAPPING[field] || FIELD_HAT_MAPPING['default'];
  
  // Only update main app header logo (keep welcome page logo as default)
  const headerLogo = document.querySelector('.main-header .header-icon');
  console.log('🔍 Header logo element found:', headerLogo);
  console.log('🔍 Field:', field);
  console.log('🔍 Hat image:', hatImage);
  console.log('🔍 Full path will be:', `color hats/${hatImage}`);
  console.log('🔍 Current mapping:', FIELD_HAT_MAPPING);
  
  if (headerLogo) {
    headerLogo.src = `color hats/${hatImage}`;
    console.log(`🎩 Updated header logo to: color hats/${hatImage}`);
    console.log('🔍 Logo src after update:', headerLogo.src);
    
    // Test if the image loads
    headerLogo.onload = function() {
      console.log('✅ Logo image loaded successfully');
    };
    headerLogo.onerror = function() {
      console.log('❌ Logo image failed to load:', headerLogo.src);
      // Fallback to default logo
      headerLogo.src = 'logo.png';
      console.log('🔄 Fallback to default logo');
    };
  } else {
    console.log('❌ Header logo element not found!');
  }
}

// Simple test function for field-hat mapping
function testFieldHatMapping() {
  console.log('🧪 Testing field-hat mapping...');
  
  // Test 1: AI field should map to hats1
  const aiHat = FIELD_HAT_MAPPING['Artificial Intelligence'];
  console.log('Test 1 - AI field hat:', aiHat === 'color hats1.png' ? '✅ PASS' : '❌ FAIL');
  
  // Test 2: Landscape Architecture should map to hats2
  const landscapeHat = FIELD_HAT_MAPPING['Landscape Architecture'];
  console.log('Test 2 - Landscape Architecture hat:', landscapeHat === 'color hats2.png' ? '✅ PASS' : '❌ FAIL');
  
  // Test 3: Python should map to hats3
  const pythonHat = FIELD_HAT_MAPPING['Python'];
  console.log('Test 3 - Python hat:', pythonHat === 'color hats3.png' ? '✅ PASS' : '❌ FAIL');
  
  // Test 4: Unknown field should map to default
  const unknownHat = FIELD_HAT_MAPPING['Unknown Field'] || FIELD_HAT_MAPPING['default'];
  console.log('Test 4 - Unknown field hat:', unknownHat === 'logo.png' ? '✅ PASS' : '❌ FAIL');
  
  // Test 5: Test logo update function for each field
  updateLogoForField('Artificial Intelligence');
  updateLogoForField('Landscape Architecture');
  updateLogoForField('Python');
  console.log('Test 5 - Logo update functions:', '✅ CALLED');
  
  return true;
}

// Test function to manually check image loading
function testImageLoading() {
  console.log('🧪 Testing image loading...');
  
  const testImg = new Image();
  testImg.onload = function() {
    console.log('✅ Image loaded successfully:', testImg.src);
  };
  testImg.onerror = function() {
    console.log('❌ Image failed to load:', testImg.src);
  };
  testImg.src = 'color hats/color hats1.png';
  
  console.log('🔍 Testing image path: color hats/color hats1.png');
}

// Test function for dynamic hat assignment
function testDynamicHatAssignment() {
  console.log('🧪 Testing dynamic hat assignment...');
  
  // Test assigning hats to new fields
  const testFields = ['Data Science', 'Machine Learning', 'Web Development'];
  
  testFields.forEach(field => {
    const assignedHat = assignHatToNewField(field);
    console.log(`🎩 Field "${field}" assigned hat: ${assignedHat}`);
  });
  
  // Test what happens when we run out of hats
  const extraField = assignHatToNewField('Extra Field');
  console.log(`🎩 Extra field assigned hat: ${extraField}`);
  
  // Show current mapping
  console.log('📊 Current field-hat mapping:', FIELD_HAT_MAPPING);
  console.log('📊 Assigned hats:', Array.from(assignedHats));
  
  return true;
}

// Debug function to check what hat was assigned to History
function debugHistoryField() {
  console.log('🔍 Debugging History field...');
  console.log('🔍 History field mapping:', FIELD_HAT_MAPPING['History']);
  console.log('🔍 Current mapping:', FIELD_HAT_MAPPING);
  console.log('🔍 Assigned hats:', Array.from(assignedHats));
  
  // Test the logo update for History
  updateLogoForField('History');
  
  return FIELD_HAT_MAPPING['History'];
}

// Fix History field by reassigning a working hat
function fixHistoryField() {
  console.log('🔧 Fixing History field...');
  
  // Remove History from assigned hats if it exists
  if (FIELD_HAT_MAPPING['History']) {
    const oldHat = FIELD_HAT_MAPPING['History'];
    assignedHats.delete(oldHat);
    console.log(`🗑️ Removed old hat "${oldHat}" from assigned hats`);
  }
  
  // Reassign a working hat
  const newHat = assignHatToNewField('History');
  console.log(`🎩 Reassigned History to hat: ${newHat}`);
  
  // Update the logo
  updateLogoForField('History');
  
  return newHat;
}

// Comprehensive field mapping for smart recognition (300+ fields)
const fieldMappings = {
  // Computer Science & Technology
  'computer science': 'Computer Science',
  'cs': 'Computer Science',
  'programming': 'Computer Science',
  'software': 'Computer Science',
  'coding': 'Computer Science',
  'tech': 'Computer Science',
  'ai': 'Computer Science',
  'artificial intelligence': 'Computer Science',
  'machine learning': 'Computer Science',
  'data science': 'Computer Science',
  'cybersecurity': 'Computer Science',
  'information technology': 'Computer Science',
  'it': 'Computer Science',
  'web development': 'Computer Science',
  'app development': 'Computer Science',
  'game development': 'Computer Science',
  'blockchain': 'Computer Science',
  'cloud computing': 'Computer Science',
  'software engineering': 'Computer Science',
  'computer engineering': 'Computer Science',
  'data engineering': 'Computer Science',
  
  // Architecture & Design
  'architecture': 'Architecture',
  'architectural': 'Architecture',
  'arch': 'Architecture',
  'building design': 'Architecture',
  'urban planning': 'Architecture',
  'landscape architecture': 'Architecture',
  'interior design': 'Architecture',
  'construction': 'Architecture',
  'structural engineering': 'Architecture',
  'urban design': 'Architecture',
  'architectural engineering': 'Architecture',
  
  // Medicine & Healthcare
  'medicine': 'Medicine',
  'medical': 'Medicine',
  'healthcare': 'Medicine',
  'health': 'Medicine',
  'clinical': 'Medicine',
  'pharmacy': 'Medicine',
  'nursing': 'Medicine',
  'surgery': 'Medicine',
  'dentistry': 'Medicine',
  'dental': 'Medicine',
  'veterinary': 'Medicine',
  'vet': 'Medicine',
  'public health': 'Medicine',
  'epidemiology': 'Medicine',
  'pathology': 'Medicine',
  'radiology': 'Medicine',
  'pediatrics': 'Medicine',
  'cardiology': 'Medicine',
  'neurology': 'Medicine',
  'oncology': 'Medicine',
  'immunology': 'Medicine',
  'dermatology': 'Medicine',
  'ophthalmology': 'Medicine',
  'psychiatry': 'Medicine',
  
  // Business & Finance
  'business': 'Business',
  'finance': 'Business',
  'economics': 'Business',
  'marketing': 'Business',
  'management': 'Business',
  'accounting': 'Business',
  'entrepreneurship': 'Business',
  'banking': 'Business',
  'investment': 'Business',
  'consulting': 'Business',
  'hr': 'Business',
  'human resources': 'Business',
  'operations': 'Business',
  'strategy': 'Business',
  'sales': 'Business',
  'retail': 'Business',
  'e-commerce': 'Business',
  'business administration': 'Business',
  'mba': 'Business',
  'financial planning': 'Business',
  'corporate finance': 'Business',
  'venture capital': 'Business',
  'private equity': 'Business',
  
  // Engineering
  'engineering': 'Engineering',
  'mechanical': 'Engineering',
  'mechanical engineering': 'Engineering',
  'electrical': 'Engineering',
  'electrical engineering': 'Engineering',
  'civil': 'Engineering',
  'civil engineering': 'Engineering',
  'chemical': 'Engineering',
  'chemical engineering': 'Engineering',
  'aerospace': 'Engineering',
  'aerospace engineering': 'Engineering',
  'biomedical': 'Engineering',
  'biomedical engineering': 'Engineering',
  'environmental': 'Engineering',
  'environmental engineering': 'Engineering',
  'industrial': 'Engineering',
  'industrial engineering': 'Engineering',
  'materials': 'Engineering',
  'materials engineering': 'Engineering',
  'nuclear': 'Engineering',
  'nuclear engineering': 'Engineering',
  'petroleum': 'Engineering',
  'petroleum engineering': 'Engineering',
  'automotive': 'Engineering',
  'robotics': 'Engineering',
  'mechatronics': 'Engineering',
  
  // Law & Legal
  'law': 'Law',
  'legal': 'Law',
  'jurisprudence': 'Law',
  'litigation': 'Law',
  'criminal law': 'Law',
  'civil law': 'Law',
  'constitutional law': 'Law',
  'corporate law': 'Law',
  'intellectual property': 'Law',
  'patent law': 'Law',
  'immigration law': 'Law',
  'family law': 'Law',
  'environmental law': 'Law',
  'tax law': 'Law',
  'labor law': 'Law',
  'contract law': 'Law',
  
  // Psychology & Social Sciences
  'psychology': 'Psychology',
  'mental health': 'Psychology',
  'therapy': 'Psychology',
  'counseling': 'Psychology',
  'social work': 'Social Sciences',
  'sociology': 'Social Sciences',
  'anthropology': 'Social Sciences',
  'political science': 'Social Sciences',
  'international relations': 'Social Sciences',
  'public policy': 'Social Sciences',
  'criminology': 'Social Sciences',
  'social sciences': 'Social Sciences',
  'behavioral science': 'Psychology',
  'cognitive science': 'Psychology',
  
  // Arts & Literature
  'literature': 'Literature',
  'english': 'Literature',
  'writing': 'Literature',
  'poetry': 'Literature',
  'creative writing': 'Literature',
  'journalism': 'Literature',
  'communications': 'Literature',
  'media studies': 'Literature',
  'art': 'Arts',
  'fine arts': 'Arts',
  'visual arts': 'Arts',
  'graphic design': 'Arts',
  'photography': 'Arts',
  'music': 'Arts',
  'theater': 'Arts',
  'drama': 'Arts',
  'film': 'Arts',
  'cinema': 'Arts',
  'dance': 'Arts',
  'performing arts': 'Arts',
  'art history': 'Arts',
  
  // History & Humanities
  'history': 'History',
  'historical': 'History',
  'archaeology': 'History',
  'philosophy': 'Philosophy',
  'religious studies': 'Philosophy',
  'theology': 'Philosophy',
  'classics': 'History',
  'linguistics': 'Linguistics',
  'foreign languages': 'Linguistics',
  'cultural studies': 'History',
  'humanities': 'History',
  
  // Natural Sciences
  'physics': 'Physics',
  'quantum': 'Physics',
  'astronomy': 'Physics',
  'astrophysics': 'Physics',
  'chemistry': 'Chemistry',
  'biochemistry': 'Chemistry',
  'organic chemistry': 'Chemistry',
  'inorganic chemistry': 'Chemistry',
  'physical chemistry': 'Chemistry',
  'biology': 'Biology',
  'molecular biology': 'Biology',
  'cell biology': 'Biology',
  'genetics': 'Biology',
  'ecology': 'Biology',
  'botany': 'Biology',
  'zoology': 'Biology',
  'marine biology': 'Biology',
  'microbiology': 'Biology',
  'neuroscience': 'Biology',
  'biotechnology': 'Biology',
  
  // Mathematics & Statistics
  'mathematics': 'Mathematics',
  'math': 'Mathematics',
  'statistics': 'Mathematics',
  'calculus': 'Mathematics',
  'algebra': 'Mathematics',
  'geometry': 'Mathematics',
  'applied mathematics': 'Mathematics',
  'pure mathematics': 'Mathematics',
  'actuarial science': 'Mathematics',
  'data analytics': 'Mathematics',
  
  // Education
  'education': 'Education',
  'teaching': 'Education',
  'pedagogy': 'Education',
  'curriculum': 'Education',
  'educational psychology': 'Education',
  'special education': 'Education',
  'early childhood': 'Education',
  'higher education': 'Education',
  
  // Agriculture & Environmental
  'agriculture': 'Agriculture',
  'farming': 'Agriculture',
  'agronomy': 'Agriculture',
  'agricultural science': 'Agriculture',
  'environmental science': 'Environmental Science',
  'sustainability': 'Environmental Science',
  'conservation': 'Environmental Science',
  'climate science': 'Environmental Science',
  'geology': 'Environmental Science',
  'geography': 'Environmental Science',
  'earth science': 'Environmental Science',
  
  // Sports & Recreation
  'sports': 'Sports',
  'athletics': 'Sports',
  'fitness': 'Sports',
  'kinesiology': 'Sports',
  'physical therapy': 'Sports',
  'sports medicine': 'Sports',
  'coaching': 'Sports',
  'exercise science': 'Sports',
  
  // Hospitality & Tourism
  'hospitality': 'Hospitality',
  'tourism': 'Hospitality',
  'hotel management': 'Hospitality',
  'restaurant management': 'Hospitality',
  'culinary arts': 'Hospitality',
  'event planning': 'Hospitality',
  'food science': 'Hospitality',
  
  // Transportation & Logistics
  'transportation': 'Transportation',
  'logistics': 'Transportation',
  'supply chain': 'Transportation',
  'aviation': 'Transportation',
  'maritime': 'Transportation',
  'railway': 'Transportation',
  'shipping': 'Transportation',
  
  // Fashion & Textiles
  'fashion': 'Fashion',
  'textiles': 'Fashion',
  'fashion design': 'Fashion',
  'merchandising': 'Fashion',
  'apparel': 'Fashion',
  
  // Real Estate
  'real estate': 'Real Estate',
  'property': 'Real Estate',
  'realty': 'Real Estate',
  'property management': 'Real Estate',
  
  // Insurance
  'insurance': 'Insurance',
  'actuarial': 'Insurance',
  'risk management': 'Insurance',
  
  // Energy & Utilities
  'energy': 'Energy',
  'renewable energy': 'Energy',
  'solar': 'Energy',
  'wind': 'Energy',
  'nuclear energy': 'Energy',
  'oil and gas': 'Energy',
  'utilities': 'Energy',
  
  // Telecommunications
  'telecommunications': 'Telecommunications',
  'telecom': 'Telecommunications',
  'networking': 'Telecommunications',
  'wireless': 'Telecommunications',
  
  // Manufacturing
  'manufacturing': 'Manufacturing',
  'production': 'Manufacturing',
  'quality control': 'Manufacturing',
  'lean manufacturing': 'Manufacturing',
  'industrial design': 'Manufacturing',
  
  // Mining & Materials
  'mining': 'Mining',
  'metallurgy': 'Mining',
  'materials science': 'Mining',
  
  // Defense & Security
  'defense': 'Defense',
  'military': 'Defense',
  'security': 'Defense',
  'intelligence': 'Defense',
  'homeland security': 'Defense',
  
  // Government & Public Service
  'government': 'Government',
  'public administration': 'Government',
  'public service': 'Government',
  'diplomacy': 'Government',
  'foreign service': 'Government',
  
  // Non-profit & Social Impact
  'non-profit': 'Non-profit',
  'ngo': 'Non-profit',
  'social impact': 'Non-profit',
  'charity': 'Non-profit',
  'philanthropy': 'Non-profit',
  
  // Library & Information Science
  'library science': 'Library Science',
  'information science': 'Library Science',
  'archives': 'Library Science',
  
  // Veterinary Science
  'veterinary science': 'Veterinary Science',
  'animal science': 'Veterinary Science',
  
  // Astronomy
  'astronomy': 'Astronomy',
  'cosmology': 'Astronomy',
  'space science': 'Astronomy'
};

// DOM elements
const elements = {
  welcomePage: document.getElementById('welcome-page'),
  mainApp: document.getElementById('main-app'),
  hatsPage: document.getElementById('hats-page'),
  fieldInput: document.getElementById('field-input'),
  fieldSuggestions: document.getElementById('field-suggestions'),
  fieldLabelOptions: document.querySelectorAll('.field-label-option'),
  stars: document.querySelectorAll('.star'),
  continueBtn: document.getElementById('continue-btn'),
  currentField: document.getElementById('current-field'),
  currentExperience: document.getElementById('current-experience'),
  fieldSetting: document.getElementById('field-setting'),
  levelSetting: document.getElementById('level-setting'),
  downloadStatus: document.getElementById('download-status'),
  summaryList: document.getElementById('summary-list'),
  summaryHeader: document.getElementById('summary-header'),
  summaryToggle: document.getElementById('summary-toggle'),
  keywordsHeader: document.getElementById('keywords-header'),
  keywordsToggle: document.getElementById('keywords-toggle'),
  btnCoreFinder: document.getElementById('btn-core-finder'),
  btnReadingMap: document.getElementById('btn-reading-map'),
  btnVocabPocket: document.getElementById('btn-vocab-pocket'),
  coreFinderResults: document.getElementById('core-finder-results'),
  coreKeywordsList: document.getElementById('core-keywords-list'),
  readingMapResults: document.getElementById('reading-map-results'),
  readingMapList: document.getElementById('reading-map-list'),
  diveInResults: document.getElementById('dive-in-results'),
  // Dive In section elements
  diveInTermExplanationHeader: document.getElementById('term-explanation-header'),
  diveInTermExplanationToggle: document.getElementById('term-explanation-toggle'),
  diveInTermExplanationContent: document.getElementById('term-explanation-content'),
  diveInFieldVocabularyHeader: document.getElementById('field-vocabulary-header'),
  diveInFieldVocabularyToggle: document.getElementById('field-vocabulary-toggle'),
  diveInFieldVocabularyContent: document.getElementById('field-vocabulary-content'),
  diveInNotesHeader: document.getElementById('notes-header'),
  diveInNotesToggle: document.getElementById('notes-toggle'),
  diveInNotesContent: document.getElementById('notes-content'),
  diveInAskHatrickHeader: document.getElementById('ask-hatrick-header'),
  diveInAskHatrickToggle: document.getElementById('ask-hatrick-toggle'),
  diveInAskHatrickContent: document.getElementById('ask-hatrick-content'),
  // Ask Hatrick chat elements
  chatMessages: document.getElementById('chat-messages'),
  askHatrickInput: document.getElementById('ask-hatrick-input'),
  askHatrickSend: document.getElementById('ask-hatrick-send'),
  // Term explanation elements
  selectedTermDisplay: document.getElementById('selected-term-display'),
  selectedTermText: document.getElementById('selected-term-text'),
  heartButton: document.getElementById('heart-button'),
  termExplanationResults: document.getElementById('term-explanation-results'),
  footerClickable: document.getElementById('footer-clickable'),
  welcomeFooterClickable: document.getElementById('welcome-footer-clickable'),
  backToMain: document.getElementById('back-to-main'),
  hatsList: document.getElementById('hats-list'),
  // Welcome page elements
  newFieldWelcome: document.getElementById('new-field-welcome'),
  welcomeHatImage: document.getElementById('welcome-hat-image'),
  welcomeTitle: document.getElementById('welcome-title'),
  welcomeMessage: document.getElementById('welcome-message'),
  startExploringBtn: document.getElementById('start-exploring')
};

// Send message to background script
async function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

// Convert markdown formatting to HTML
function formatExplanation(explanation) {
  return explanation
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>') // ***text*** -> bold italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')              // **text** -> bold
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');                         // *text* -> italic
}

// Enhanced smart field recognition with fuzzy matching
function recognizeField(userInput) {
  const normalized = userInput.toLowerCase().trim();
  
  // Direct match
  if (fieldMappings[normalized]) {
    return fieldMappings[normalized];
  }
  
  // Remove common suffixes and try again
  const cleaned = normalized
    .replace(/\b(studies?|science|engineering|design|management|arts?|degree|major)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleaned && fieldMappings[cleaned]) {
    return fieldMappings[cleaned];
  }
  
  // Partial match - prioritize exact word boundaries
  const partialMatches = Object.entries(fieldMappings)
    .filter(([key, value]) => {
      // Check if the input contains the key as a whole word
      const keyWords = key.split(' ');
      const inputWords = normalized.split(' ');
      
      return keyWords.some(kw => inputWords.some(iw => iw === kw || iw.startsWith(kw) || kw.startsWith(iw)));
    })
    .sort((a, b) => b[0].length - a[0].length); // Sort by key length (longer = more specific)
  
  if (partialMatches.length > 0) {
    return partialMatches[0][1];
  }
  
  // Fuzzy match for common abbreviations
  const fuzzyMap = {
    'arch': 'Architecture',
    'archi': 'Architecture',
    'med': 'Medicine',
    'bio': 'Biology',
    'chem': 'Chemistry',
    'phys': 'Physics',
    'maths': 'Mathematics',
    'stats': 'Mathematics',
    'econ': 'Business',
    'biz': 'Business',
    'eng': 'Engineering',
    'mech': 'Engineering',
    'elec': 'Engineering',
    'psych': 'Psychology',
    'soc': 'Social Sciences',
    'lit': 'Literature',
    'hist': 'History',
    'phil': 'Philosophy',
    'geo': 'Environmental Science',
    'ag': 'Agriculture',
    'ed': 'Education'
  };
  
  if (fuzzyMap[normalized]) {
    return fuzzyMap[normalized];
  }
  
  // If no match found, capitalize the input
  return userInput.charAt(0).toUpperCase() + userInput.slice(1);
}

// Show field suggestions with improved matching
function showFieldSuggestions(input) {
  if (!input || input.length < 2) {
    elements.fieldSuggestions.style.display = 'none';
    return;
  }
  
  const normalized = input.toLowerCase();
  const suggestions = Object.entries(fieldMappings)
    .filter(([key, value]) => {
      return key.includes(normalized) || 
             value.toLowerCase().includes(normalized) ||
             key.includes(normalized.replace(/\s+/g, '')) ||
             value.toLowerCase().includes(normalized.replace(/\s+/g, ''));
    })
    .slice(0, 8) // Show more suggestions
    .map(([key, value]) => value)
    .filter((value, index, arr) => arr.indexOf(value) === index); // Remove duplicates
  
  if (suggestions.length > 0) {
    elements.fieldSuggestions.innerHTML = suggestions
      .map(suggestion => `<div class="field-suggestion" data-field="${suggestion}">${suggestion}</div>`)
      .join('');
    elements.fieldSuggestions.style.display = 'block';
  } else {
    elements.fieldSuggestions.style.display = 'none';
  }
}

// Handle field label selection
function handleFieldLabelClick(event) {
  const field = event.target.dataset.field;
  
  if (field === 'add-new') {
    // Handle add new label functionality
    handleAddNewLabel();
    return;
  }
  
  // Remove previous selection
  elements.fieldLabelOptions.forEach(option => option.classList.remove('selected'));
  
  // Add selection to clicked option
  event.target.classList.add('selected');
  
  // Store the selected field
  userField = field;
  selectedFieldLabel = event.target;
  
  console.log('🔍 Field selected:', userField);
  
  // Check if continue button should be enabled
  checkCanProceed();
}

// Handle add new label functionality
function handleAddNewLabel() {
  const newLabel = prompt('Enter a new field label:');
  if (newLabel && newLabel.trim()) {
    const fieldName = newLabel.trim();
    
    // Assign a new hat to this field
    const assignedHat = assignHatToNewField(fieldName);
    console.log(`🎩 New field "${fieldName}" assigned hat: ${assignedHat}`);
    
    // Create a new label option with delete button
    const newOption = document.createElement('div');
    newOption.className = 'field-label-option';
    newOption.dataset.field = fieldName;
    newOption.innerHTML = `
      ${fieldName}
      <button class="delete-field-btn" data-field="${fieldName}" title="Delete field">×</button>
    `;
    
    // Insert before the "add new label" option
    const addNewOption = document.querySelector('.add-new-label');
    addNewOption.parentNode.insertBefore(newOption, addNewOption);
    
    // Add click event listener for the field
    newOption.addEventListener('click', handleFieldLabelClick);
    
    // Add click event listener for the delete button
    const deleteBtn = newOption.querySelector('.delete-field-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent field selection when clicking delete
      handleDeleteField(fieldName);
    });
    
    // Update the elements array
    elements.fieldLabelOptions = document.querySelectorAll('.field-label-option');
    
                // Select the new option
                newOption.classList.add('selected');
                userField = fieldName;
                selectedFieldLabel = newOption;
                
                // Show welcome page for new field
                showNewFieldWelcome(fieldName, assignedHat);
                
                // Check if continue button should be enabled
                checkCanProceed();
  }
}

// Handle delete field functionality
function handleDeleteField(fieldName) {
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete the field "${fieldName}"?`)) {
    return;
  }
  
  console.log(`🗑️ Deleting field: ${fieldName}`);
  
  // Remove from field-hat mapping
  if (FIELD_HAT_MAPPING[fieldName]) {
    const assignedHat = FIELD_HAT_MAPPING[fieldName];
    delete FIELD_HAT_MAPPING[fieldName];
    assignedHats.delete(assignedHat);
    console.log(`🗑️ Removed field "${fieldName}" and freed hat "${assignedHat}"`);
  }
  
  // Remove from DOM
  const fieldElement = document.querySelector(`[data-field="${fieldName}"]`);
  if (fieldElement) {
    fieldElement.remove();
  }
  
  // Update elements array
  elements.fieldLabelOptions = document.querySelectorAll('.field-label-option');
  
  // If this was the selected field, clear selection
  if (userField === fieldName) {
    userField = '';
    selectedFieldLabel = null;
    checkCanProceed();
  }
  
  console.log(`✅ Field "${fieldName}" deleted successfully`);
}

// Handle field suggestion click
function handleFieldSuggestionClick(event) {
  const field = event.target.dataset.field;
  elements.fieldInput.value = field;
  elements.fieldSuggestions.style.display = 'none';
  
  // Check if continue button should be enabled
  checkCanProceed();
}

// Handle experience level selection
function handleExperienceSelection(level) {
  isSelecting = true;
  
  // Remove previous selection from all stars
  elements.stars.forEach(star => star.classList.remove('selected'));
  
  // Add selection to clicked star and all previous stars
  const levelIndex = ['beginner', 'intermediate', 'professional'].indexOf(level);
  console.log('Selecting level:', level, 'at index:', levelIndex);
  
  for (let i = 0; i <= levelIndex; i++) {
    elements.stars[i].classList.add('selected');
    console.log('Added selected class to star', i);
  }
  
  userExperience = level;
  console.log('Experience level selected:', userExperience);
  
  // Check if we can proceed
  checkCanProceed();
  
  // Reset the flag after a short delay
  setTimeout(() => {
    isSelecting = false;
  }, 200);
}

// Highlight stars up to a specific index (for hover effect)
function highlightStarsUpTo(index) {
  elements.stars.forEach((star, i) => {
    if (i <= index) {
      star.classList.add('hover-highlight');
    } else {
      star.classList.remove('hover-highlight');
    }
  });
}

// Restore the actual selection state (remove hover highlights)
function restoreStarSelection() {
  // Don't restore if we're in the middle of selecting
  if (isSelecting) {
    console.log('Skipping restore - currently selecting');
    return;
  }
  
  console.log('Restoring star selection, current userExperience:', userExperience);
  
  elements.stars.forEach(star => {
    star.classList.remove('hover-highlight');
  });
  
  // Re-apply the actual selection based on userExperience
  if (userExperience) {
    const levelIndex = ['beginner', 'intermediate', 'professional'].indexOf(userExperience);
    console.log('Restoring selection for level:', userExperience, 'at index:', levelIndex);
    
    if (levelIndex >= 0) {
      elements.stars.forEach((star, i) => {
        if (i <= levelIndex) {
          star.classList.add('selected');
          console.log('Restored selected class to star', i);
        } else {
          star.classList.remove('selected');
        }
      });
    }
  }
}

// Check if user can proceed to main app
function checkCanProceed() {
  const hasField = userField !== '';
  const hasExperience = userExperience !== '';
  
  // Enable/disable continue button
  if (hasField && hasExperience) {
    elements.continueBtn.disabled = false;
  } else {
    elements.continueBtn.disabled = true;
  }
}

// Handle continue button click
function handleContinueClick() {
  const hasField = userField !== '';
  const hasExperience = userExperience !== '';
  
  if (hasField && hasExperience) {
    // Save user preferences (keep exact user selection, don't convert)
    chrome.storage.local.set({
      userField: userField,
      userExperience: userExperience,
      hasCompletedSetup: true
    });
    
    // Update field display with user-selected field
    console.log('🔍 Setting field display to:', userField);
    console.log('🔍 Setting experience display to:', userExperience);
    elements.currentField.textContent = userField;
    elements.currentExperience.textContent = userExperience;
    
    // Update logo for the selected field
    updateLogoForField(userField);
    
    // Show main app
    showMainApp();
  }
}

// Show main app and hide welcome page
function showMainApp() {
  elements.welcomePage.style.display = 'none';
  elements.mainApp.style.display = 'block';
  
  // Update user settings display
  updateUserSettingsDisplay();
  
  
  // Initialize main app
  initMainApp();
  
  // Initialize Ask Hatrick chat
  initAskHatrickChat();
}

// Update user settings display
function updateUserSettingsDisplay() {
  // Don't override the field if it's auto-detected - let updateFieldDisplay handle it
  // elements.currentField.textContent = userField; // Removed this line
  
  // Map experience levels to display text
  const experienceMap = {
    'beginner': 'New to field',
    'intermediate': 'Intermediate',
    'professional': 'Professional'
  };
  const experienceText = experienceMap[userExperience] || 'Not selected';
  elements.currentExperience.textContent = experienceText;
  elements.currentExperience.title = `Experience Level: ${experienceText}`;
  
  // Update field detection display (this will set the correct field)
  updateFieldDisplay();
}


// Handle change settings button click
function handleChangeSettings() {
  // Show welcome page again
  elements.welcomePage.style.display = 'block';
  elements.mainApp.style.display = 'none';
  
  // Pre-fill the form with current values
  // Find and select the matching label option
  elements.fieldLabelOptions.forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.field === userField) {
      option.classList.add('selected');
      selectedFieldLabel = option;
    }
  });
  
  // Pre-select the experience level stars
  elements.stars.forEach(star => star.classList.remove('selected'));
  const levelIndex = ['beginner', 'intermediate', 'professional'].indexOf(userExperience);
  if (levelIndex >= 0) {
    for (let i = 0; i <= levelIndex; i++) {
      elements.stars[i].classList.add('selected');
    }
  }
  
  // Check if continue button should be enabled
  checkCanProceed();
}

// Old summarize function removed - now integrated into Core Finder

// Handle Summary Toggle click
function handleSummaryToggle() {
  const isCollapsed = elements.summaryList.classList.contains('collapsed');
  
  if (isCollapsed) {
    // Expand summary
    elements.summaryList.classList.remove('collapsed');
    elements.summaryToggle.classList.remove('collapsed');
    // elements.summaryToggle.textContent = '▼';
  } else {
    // Collapse summary
    elements.summaryList.classList.add('collapsed');
    elements.summaryToggle.classList.add('collapsed');
    // elements.summaryToggle.textContent = '▶';
  }
}

// Handle Keywords Toggle click
function handleKeywordsToggle() {
  const isCollapsed = elements.coreKeywordsList.classList.contains('collapsed');
  
  if (isCollapsed) {
    // Expand keywords
    elements.coreKeywordsList.classList.remove('collapsed');
    elements.keywordsToggle.classList.remove('collapsed');
    // elements.keywordsToggle.textContent = '▼';
  } else {
    // Collapse keywords
    elements.coreKeywordsList.classList.add('collapsed');
    elements.keywordsToggle.classList.add('collapsed');
    // elements.keywordsToggle.textContent = '▶';
  }
}

// Add click handlers to keyword cards
function addKeywordCardHandlers() {
  const keywordCards = document.querySelectorAll('.keyword-card');
  
  keywordCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking the heart button
      if (e.target.closest('.heart-btn')) {
        return;
      }
      
      const keywordId = this.getAttribute('data-keyword-id');
      const explanation = document.getElementById(`explanation-${keywordId}`);
      const isVisible = explanation.classList.contains('visible');
      
      // Close all other explanations first
      document.querySelectorAll('.keyword-explanation.visible').forEach(exp => {
        exp.classList.remove('visible');
      });
      document.querySelectorAll('.keyword-card.active').forEach(c => {
        c.classList.remove('active');
      });
      
      if (!isVisible) {
        // Show this explanation
        explanation.classList.add('visible');
        this.classList.add('active');
      }
    });
  });
  
  // Add heart button click handlers
  addHeartClickHandlers();
}

// Add heart button click handlers
function addHeartClickHandlers() {
  const heartButtons = document.querySelectorAll('.heart-btn');
  
  heartButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent keyword card click
      
      const keywordId = this.getAttribute('data-keyword-id');
      const term = this.getAttribute('data-term');
      const heartIcon = this.querySelector('.heart-icon');
      
      // Toggle heart state
      if (this.classList.contains('saved')) {
        // Remove from vocab pocket
        removeFromVocabPocket(term);
        this.classList.remove('saved');
        heartIcon.textContent = '♡';
        console.log(`💔 Removed "${term}" from vocab pocket`);
      } else {
        // Add to vocab pocket
        addToVocabPocket(term);
        this.classList.add('saved');
        heartIcon.textContent = '♥';
        console.log(`❤️ Added "${term}" to vocab pocket`);
      }
    });
  });
}

// Vocab pocket storage functions
async function addToVocabPocket(term) {
  try {
    const result = await chrome.storage.local.get(['vocabPocket']);
    const vocabPocket = result.vocabPocket || [];
    
    if (!vocabPocket.includes(term)) {
      vocabPocket.push(term);
      await chrome.storage.local.set({ vocabPocket });
      console.log(`📚 Added "${term}" to vocab pocket. Total terms: ${vocabPocket.length}`);
      
      // Also add to field vocabulary if user has a field selected
      if (userField) {
        await addToFieldVocabulary(userField, term);
      }
    }
  } catch (error) {
    console.error('Error adding term to vocab pocket:', error);
  }
}

async function removeFromVocabPocket(term) {
  try {
    const result = await chrome.storage.local.get(['vocabPocket']);
    const vocabPocket = result.vocabPocket || [];
    
    const index = vocabPocket.indexOf(term);
    if (index > -1) {
      vocabPocket.splice(index, 1);
      await chrome.storage.local.set({ vocabPocket });
      console.log(`📚 Removed "${term}" from vocab pocket. Total terms: ${vocabPocket.length}`);
      
      // Also remove from field vocabulary if user has a field selected
      if (userField) {
        await removeFromFieldVocabulary(userField, term);
      }
    }
  } catch (error) {
    console.error('Error removing term from vocab pocket:', error);
  }
}

async function getVocabPocket() {
  try {
    const result = await chrome.storage.local.get(['vocabPocket']);
    return result.vocabPocket || [];
  } catch (error) {
    console.error('Error getting vocab pocket:', error);
    return [];
  }
}

// Field vocabulary storage functions
async function getFieldVocabulary(field) {
  try {
    const result = await chrome.storage.local.get(['fieldVocabularies']);
    const fieldVocabularies = result.fieldVocabularies || {};
    return fieldVocabularies[field] || [];
  } catch (error) {
    console.error('Error getting field vocabulary:', error);
    return [];
  }
}

async function addToFieldVocabulary(field, term) {
  try {
    const result = await chrome.storage.local.get(['fieldVocabularies']);
    const fieldVocabularies = result.fieldVocabularies || {};
    
    if (!fieldVocabularies[field]) {
      fieldVocabularies[field] = [];
    }
    
    if (!fieldVocabularies[field].includes(term)) {
      fieldVocabularies[field].push(term);
      await chrome.storage.local.set({ fieldVocabularies });
      console.log(`📚 Added "${term}" to field vocabulary for "${field}"`);
    }
  } catch (error) {
    console.error('Error adding to field vocabulary:', error);
  }
}

async function removeFromFieldVocabulary(field, term) {
  try {
    const result = await chrome.storage.local.get(['fieldVocabularies']);
    const fieldVocabularies = result.fieldVocabularies || {};
    
    if (fieldVocabularies[field]) {
      const index = fieldVocabularies[field].indexOf(term);
      if (index > -1) {
        fieldVocabularies[field].splice(index, 1);
        await chrome.storage.local.set({ fieldVocabularies });
        console.log(`📚 Removed "${term}" from field vocabulary for "${field}"`);
      }
    }
  } catch (error) {
    console.error('Error removing from field vocabulary:', error);
  }
}

async function getAllFieldVocabularies() {
  try {
    const result = await chrome.storage.local.get(['fieldVocabularies']);
    return result.fieldVocabularies || {};
  } catch (error) {
    console.error('Error getting all field vocabularies:', error);
    return {};
  }
}

// Check and set heart button states for existing saved terms
async function checkAndSetHeartButtonStates() {
  try {
    const vocabPocket = await getVocabPocket();
    const heartButtons = document.querySelectorAll('.heart-btn');
    
    heartButtons.forEach(btn => {
      const term = btn.getAttribute('data-term');
      const heartIcon = btn.querySelector('.heart-icon');
      
      if (vocabPocket.includes(term)) {
        btn.classList.add('saved');
        heartIcon.textContent = '♥';
      } else {
        btn.classList.remove('saved');
        heartIcon.textContent = '♡';
      }
    });
  } catch (error) {
    console.error('Error checking heart button states:', error);
  }
}

// Cache management functions
async function getCacheKey() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab ? tab.url : null;
  } catch (error) {
    console.error('Error getting cache key:', error);
    return null;
  }
}

async function getCachedResults() {
  try {
    const cacheKey = await getCacheKey();
    if (!cacheKey) return null;
    
    const result = await chrome.storage.local.get(['analysisCache']);
    const cache = result.analysisCache || {};
    
    return cache[cacheKey] || null;
  } catch (error) {
    console.error('Error getting cached results:', error);
    return null;
  }
}

async function setCachedResults(summaryResponse, keywordsResponse) {
  try {
    const cacheKey = await getCacheKey();
    if (!cacheKey) return;
    
    const result = await chrome.storage.local.get(['analysisCache']);
    const cache = result.analysisCache || {};
    
    cache[cacheKey] = {
      summary: summaryResponse,
      keywords: keywordsResponse,
      timestamp: Date.now()
    };
    
    await chrome.storage.local.set({ analysisCache: cache });
    console.log('💾 Cached analysis results for:', cacheKey);
  } catch (error) {
    console.error('Error caching results:', error);
  }
}

async function clearCache() {
  try {
    await chrome.storage.local.remove(['analysisCache']);
    console.log('🗑️ Cleared analysis cache');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Check if current page has changed and clear cache if needed
async function checkPageChange() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tab ? tab.url : null;
    
    if (!currentUrl) return;
    
    const result = await chrome.storage.local.get(['lastPageUrl']);
    const lastUrl = result.lastPageUrl;
    
    if (lastUrl && lastUrl !== currentUrl) {
      console.log('🔄 Page changed, clearing cache');
      await clearCache();
    }
    
    // Update the stored URL
    await chrome.storage.local.set({ lastPageUrl: currentUrl });
  } catch (error) {
    console.error('Error checking page change:', error);
  }
}


// Navigate to hats collection page
function showHatsPage() {
  console.log('🎩 Navigating to hats collection page');
  elements.mainApp.style.display = 'none';
  elements.hatsPage.style.display = 'block';
  loadHatsCollection();
}

// Navigate back to main app from hats page
function showMainAppFromHats() {
  console.log('🏠 Navigating back to main app from hats page');
  elements.hatsPage.style.display = 'none';
  elements.mainApp.style.display = 'block';
}

// Load and display the hats collection
async function loadHatsCollection() {
  try {
    // Get the hats grid element
    const hatsGrid = document.getElementById('hats-grid');
    if (!hatsGrid) {
      console.error('Hats grid element not found');
      return;
    }
    
    // Get fields that have hats assigned
    const fieldsWithHats = Object.entries(FIELD_HAT_MAPPING)
      .filter(([field, hat]) => field !== 'default' && hat !== 'logo.png')
      .map(([field, hat]) => ({ field, hat }));
    
    console.log('🎩 Fields with hats:', fieldsWithHats);
    
    if (fieldsWithHats.length === 0) {
      hatsGrid.innerHTML = '<p class="muted">No hats collected yet. Select a field to get your first hat!</p>';
      return;
    }
    
    // Generate hat cards for each field with vocabulary count
    const hatsHtml = await Promise.all(fieldsWithHats.map(async ({ field, hat }) => {
      const fieldVocabulary = await getFieldVocabulary(field);
      const vocabCount = fieldVocabulary.length;
      
      return `
        <div class="hat-card" data-field="${field}" title="${field}">
          <img src="color hats/${hat}" alt="${field} Hat" class="hat-image">
          <div class="hat-vocab-count">${vocabCount} terms</div>
        </div>
      `;
    }));
    
    hatsGrid.innerHTML = hatsHtml.join('');
    console.log(`🎩 Loaded ${fieldsWithHats.length} collected hats`);
    
    // Add click handlers for hat cards
    document.querySelectorAll('.hat-card[data-field]').forEach(card => {
      card.addEventListener('click', async () => {
        const field = card.dataset.field;
        console.log(`🎩 Hat clicked for field: ${field}`);
        
        // Show field vocabulary in the hats page
        await showFieldVocabularyInHatsPage(field);
      });
    });
    
  } catch (error) {
    console.error('Error loading hats collection:', error);
    const hatsGrid = document.getElementById('hats-grid');
    if (hatsGrid) {
      hatsGrid.innerHTML = '<p class="muted">Error loading hats. Please try again.</p>';
    }
  }
}

// Show field vocabulary for a specific hat/field
async function showFieldVocabularyForHat(field) {
  try {
    const fieldVocabulary = await getFieldVocabulary(field);
    
    // Create a modal or section to show the vocabulary
    const vocabSection = document.createElement('div');
    vocabSection.className = 'field-vocabulary-modal';
    vocabSection.innerHTML = `
      <div class="field-vocabulary-content">
        <h3>${field} Vocabulary</h3>
        <div class="field-vocab-list">
          ${fieldVocabulary.length > 0 ? 
            fieldVocabulary.map(term => `
              <div class="field-vocab-item">
                <span class="vocab-term">${term}</span>
                <button class="remove-vocab-btn" data-term="${term}" data-field="${field}">×</button>
              </div>
            `).join('') : 
            '<p class="muted">No vocabulary terms saved for this field yet.</p>'
          }
        </div>
        <button class="close-vocab-modal">Close</button>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(vocabSection);
    
    // Add event listeners
    vocabSection.querySelector('.close-vocab-modal').addEventListener('click', () => {
      vocabSection.remove();
    });
    
    // Add remove button listeners
    vocabSection.querySelectorAll('.remove-vocab-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const term = btn.dataset.term;
        const field = btn.dataset.field;
        
        await removeFromFieldVocabulary(field, term);
        btn.parentElement.remove();
        
        // Update hat card vocabulary count
        await loadHatsCollection();
      });
    });
    
  } catch (error) {
    console.error('Error showing field vocabulary:', error);
  }
}

// Show field vocabulary in main app (navigate back and display)
async function showFieldVocabularyInMainApp(field) {
  try {
    console.log(`🎩 Showing vocabulary for field: ${field}`);
    
    // Set the selected field for vocabulary display
    selectedFieldForVocabulary = field;
    
    // Navigate back to main app
    elements.hatsPage.style.display = 'none';
    elements.mainApp.style.display = 'block';
    
    // Switch to Dive In tab to show vocabulary
    elements.btnVocabPocket.click();
    
    // Update the field vocabulary display with the selected field
    await updateFieldVocabularyDisplay();
    
  } catch (error) {
    console.error('Error showing field vocabulary in main app:', error);
  }
}

// Show field vocabulary in hats page
async function showFieldVocabularyInHatsPage(field) {
  try {
    console.log(`🎩 Showing vocabulary for field: ${field} in hats page`);
    
    const fieldVocabulary = await getFieldVocabulary(field);
    const vocabularyGrid = document.querySelector('.vocabulary-grid');
    
    if (!vocabularyGrid) {
      console.error('Vocabulary grid not found in hats page');
      return;
    }
    
    if (fieldVocabulary.length === 0) {
      vocabularyGrid.innerHTML = `
        <div class="vocab-card empty">
          <p class="muted">No vocabulary terms saved for ${field} yet</p>
        </div>
      `;
    } else {
      // Create vocabulary cards for each term (matching First Skim keyword style)
      const vocabCards = fieldVocabulary.map(term => `
        <div class="core-keyword-item">
          <div class="keyword-card" data-term="${term}" data-field="${field}">
            <span class="keyword-term">${term}</span>
            <button class="heart-btn saved" data-term="${term}" data-field="${field}" title="Remove from ${field} vocabulary">
              <span class="heart-icon">♥</span>
            </button>
          </div>
        </div>
      `).join('');
      
      vocabularyGrid.innerHTML = vocabCards;
      
      // Add event listeners for heart buttons (remove functionality)
      vocabularyGrid.querySelectorAll('.heart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const term = btn.dataset.term;
          const field = btn.dataset.field;
          
          console.log(`🗑️ Removing "${term}" from ${field} vocabulary`);
          
          // Remove from field vocabulary
          await removeFromFieldVocabulary(field, term);
          
          // Remove the entire keyword card from display
          const keywordCard = btn.closest('.core-keyword-item');
          if (keywordCard) {
            keywordCard.remove();
          }
          
          // Update hat card vocabulary count
          await loadHatsCollection();
          
          // If no more terms, show empty message
          if (vocabularyGrid.children.length === 0) {
            vocabularyGrid.innerHTML = `
              <div class="vocab-card empty">
                <p class="muted">No vocabulary terms saved for ${field} yet</p>
              </div>
            `;
          }
        });
      });
    }
    
    // Update the section title to show which field's vocabulary is displayed
    const sectionTitle = document.querySelector('.vocabulary-pocket-section .section-title');
    if (sectionTitle) {
      sectionTitle.textContent = `${field} Vocabulary`;
    }
    
  } catch (error) {
    console.error('Error showing field vocabulary in hats page:', error);
  }
}

// Clear selected field for vocabulary (reset to current user field)
function clearSelectedFieldForVocabulary() {
  selectedFieldForVocabulary = '';
  console.log('🔄 Cleared selected field for vocabulary, back to current field');
}

// Show new field welcome page
function showNewFieldWelcome(fieldName, hatImage) {
  console.log(`🎉 Showing welcome page for new field: ${fieldName} with hat: ${hatImage}`);
  
  // Update welcome page content
  elements.welcomeTitle.textContent = `🎉 Welcome to ${fieldName}!`;
  elements.welcomeMessage.textContent = `You've gained a new hat! Start exploring this exciting field and collect vocabulary terms along the way.`;
  elements.welcomeHatImage.src = `color hats/${hatImage}`;
  
  // Show the welcome page
  elements.newFieldWelcome.style.display = 'flex';
  
  // Stay on page until user clicks a button (no auto-hide)
}

// Hide new field welcome page
function hideNewFieldWelcome() {
  console.log('🎉 Hiding welcome page');
  elements.newFieldWelcome.style.display = 'none';
}

// Handle Core Finder button click
// Tab switching functionality
function switchTab(activeButton) {
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to clicked button
  activeButton.classList.add('active');
  
  // Hide all result sections
  elements.coreFinderResults.style.display = 'none';
  elements.readingMapResults.style.display = 'none';
  elements.diveInResults.style.display = 'none';
  
  // Show dive in results for vocab pocket
  if (activeButton.id === 'btn-vocab-pocket') {
    elements.diveInResults.style.display = 'block';
  }
}

async function handleCoreFinderClick() {
  try {
    // Switch to this tab
    switchTab(elements.btnCoreFinder);
    
    // Show loading state
    elements.btnCoreFinder.disabled = true;
    
    // Show results section with loading messages
    elements.coreFinderResults.style.display = 'block';
    elements.summaryList.innerHTML = '<p class="muted">Loading page summary...</p>';
    elements.coreKeywordsList.innerHTML = '<p class="muted">Loading core keywords...</p>';
    
    // Check for cached results first
    const cachedResults = await getCachedResults();
    if (cachedResults) {
      console.log('📋 Using cached results');
      elements.summaryList.innerHTML = '<p class="muted">Loading cached summary...</p>';
      elements.coreKeywordsList.innerHTML = '<p class="muted">Loading cached keywords...</p>';
      
      // Display cached summary
      if (cachedResults.summary && cachedResults.summary.ok && cachedResults.summary.bullets && cachedResults.summary.bullets.length > 0) {
        elements.summaryList.innerHTML = `<div class="summary-item">${cachedResults.summary.bullets[0]}</div>`;
      } else {
        elements.summaryList.innerHTML = '<p class="muted">No cached summary available</p>';
      }
      
      // Display cached keywords
      if (cachedResults.keywords && cachedResults.keywords.ok && cachedResults.keywords.keywords) {
        // Store keywords for toggle functionality
        lastExtractedKeywords = cachedResults.keywords.keywords;
        
        // Create cards row and individual explanation containers
        const cardsHtml = `
          <div class="keywords-cards-row">
            ${cachedResults.keywords.keywords
              .map((keyword, index) => `
                <div class="keyword-card" data-keyword-id="${index}">
                  <div class="keyword-term">${keyword.term}</div>
                  <button class="heart-btn" data-keyword-id="${index}" data-term="${keyword.term}" title="Save to vocab pocket">
                    <span class="heart-icon">♡</span>
                  </button>
                </div>
              `)
              .join('')}
          </div>
          ${cachedResults.keywords.keywords
            .map((keyword, index) => `
              <div class="keyword-explanation" id="explanation-${index}">
                ${formatExplanation(keyword.explanation)}
              </div>
            `)
            .join('')}
        `;
        
        elements.coreKeywordsList.innerHTML = cardsHtml;
        
        // Add click handlers to keyword cards
        addKeywordCardHandlers();
        
        // Check and set heart button states for existing saved terms
        await checkAndSetHeartButtonStates();
        
        // Send keywords to content script for highlighting
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.id) {
            await chrome.tabs.sendMessage(tab.id, {
              type: 'HIGHLIGHT_KEYWORDS',
              keywords: cachedResults.keywords.keywords
            });
            
            // Keywords are ready for highlighting (toggle remains off by default)
            console.log('🎨 Cached keywords ready for highlighting');
          }
        } catch (error) {
          console.error('Error sending keywords to content script:', error);
        }
      } else {
        elements.coreKeywordsList.innerHTML = '<p class="muted">No cached keywords available</p>';
      }
      
      // Re-enable button
      elements.btnCoreFinder.disabled = false;
      return;
    }
    
    // No cached results, proceed with generation
    console.log('🔄 Generating new analysis results');
    elements.summaryList.innerHTML = '<p class="muted">Generating page summary...</p>';
    elements.coreKeywordsList.innerHTML = '<p class="muted">Extracting core keywords...</p>';
    
    // Get page text from storage
    const result = await chrome.storage.local.get(['pageText']);
    const pageText = result.pageText || '';
    
    if (!pageText) {
      elements.summaryList.innerHTML = '<p class="muted">No page text available. Please refresh the page and try again.</p>';
      elements.coreKeywordsList.innerHTML = '<p class="muted">No page text available. Please refresh the page and try again.</p>';
      return;
    }
    
    // Generate summary and keywords in parallel
    const [summaryResponse, keywordsResponse] = await Promise.all([
      sendMessage({
        type: 'GET_SUMMARY',
        text: pageText
      }),
      sendMessage({
        type: 'GET_CORE_KEYWORDS',
        text: pageText,
        userField: userField,
        userExperience: userExperience
      })
    ]);
    
    // Cache the results
    await setCachedResults(summaryResponse, keywordsResponse);
    
    // Display summary
    if (summaryResponse && summaryResponse.ok && summaryResponse.bullets && summaryResponse.bullets.length > 0) {
      // Display as a single paragraph summary
      elements.summaryList.innerHTML = `<div class="summary-item">${summaryResponse.bullets[0]}</div>`;
    } else {
      elements.summaryList.innerHTML = '<p class="muted">Failed to generate summary</p>';
    }
    
    // Display keywords
    if (keywordsResponse && keywordsResponse.ok && keywordsResponse.keywords) {
      // Store keywords for toggle functionality
      lastExtractedKeywords = keywordsResponse.keywords;
      
      // Create cards row and individual explanation containers
      const cardsHtml = `
        <div class="keywords-cards-row">
          ${keywordsResponse.keywords
            .map((keyword, index) => `
              <div class="keyword-card" data-keyword-id="${index}">
                <div class="keyword-term">${keyword.term}</div>
                <button class="heart-btn" data-keyword-id="${index}" data-term="${keyword.term}" title="Save to vocab pocket">
                  <span class="heart-icon">♡</span>
                </button>
              </div>
            `)
            .join('')}
        </div>
        ${keywordsResponse.keywords
          .map((keyword, index) => `
            <div class="keyword-explanation" id="explanation-${index}">
              ${formatExplanation(keyword.explanation)}
            </div>
          `)
          .join('')}
      `;
      
      elements.coreKeywordsList.innerHTML = cardsHtml;
      
      // Add click handlers to keyword cards
      addKeywordCardHandlers();
      
      // Check and set heart button states for existing saved terms
      await checkAndSetHeartButtonStates();
      
      // Send keywords to content script for highlighting
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'HIGHLIGHT_KEYWORDS',
            keywords: keywordsResponse.keywords
          });
          
          // Keywords are ready for highlighting (toggle remains off by default)
          console.log('🎨 Keywords ready for highlighting');
        }
      } catch (error) {
        console.log('Could not highlight keywords in page:', error);
        // This is expected if we're not on a regular webpage
      }
    } else {
      elements.coreKeywordsList.innerHTML = '<p class="muted">Failed to extract core keywords</p>';
      lastExtractedKeywords = null;
    }
  } catch (error) {
    console.error('Error in Core Finder:', error);
    elements.summaryList.innerHTML = '<p class="muted">Error generating summary</p>';
    elements.coreKeywordsList.innerHTML = '<p class="muted">Error extracting core keywords</p>';
  } finally {
    // Reset button state
    elements.btnCoreFinder.disabled = false;
    elements.btnCoreFinder.textContent = 'First Skim';
  }
}

// Handle Vocab Pocket button click
async function handleVocabPocketClick() {
  // Switch to this tab
  switchTab(elements.btnVocabPocket);
  
  // Clear selected field to show current user's field vocabulary
  clearSelectedFieldForVocabulary();
  
  // Show dive in results
  elements.diveInResults.style.display = 'block';
  
  // Update field vocabulary display
  await updateFieldVocabularyDisplay();
  
  // Initialize sticker notes
  initializeStickerNotes();
  
  // Ensure notes section is expanded when Dive In is opened
  const notesContent = document.getElementById('notes-content');
  const notesHeader = document.getElementById('notes-header');
  if (notesContent && notesHeader) {
    notesContent.style.display = 'block';
    notesHeader.classList.add('expanded');
  }
  
  // Ensure Ask Hatrick section is visible when Dive In is opened
  if (elements.diveInAskHatrickContent) {
    elements.diveInAskHatrickContent.style.display = 'block';
    elements.diveInAskHatrickToggle.textContent = '▼';
  }
  
  console.log('Dive In clicked - showing four sections');
}

// Handle Dive In section toggle
function handleDiveInToggle(sectionName) {
  let header, content, toggle;
  
  // Handle different section naming conventions
  if (sectionName === 'ask-hatrick') {
    header = elements.diveInAskHatrickHeader;
    content = elements.diveInAskHatrickContent;
    toggle = elements.diveInAskHatrickToggle;
  } else {
    // Use the original naming convention for other sections
    const capitalizedName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', '');
    header = elements[`diveIn${capitalizedName}Header`];
    content = elements[`diveIn${capitalizedName}Content`];
    toggle = elements[`diveIn${capitalizedName}Toggle`];
  }
  
  if (content && toggle) {
    const isVisible = content.style.display !== 'none';
    content.style.display = isVisible ? 'none' : 'block';
    toggle.textContent = isVisible ? '▶' : '▼';
    
    // Special handling for Ask Hatrick section
    if (sectionName === 'ask-hatrick' && !isVisible) {
      // Focus on input when Ask Hatrick section is opened
      setTimeout(() => {
        if (elements.askHatrickInput) {
          elements.askHatrickInput.focus();
        }
      }, 100);
    }
  }
}

// Handle Mind Map button click - shows paragraph summaries
async function handleReadingMapClick() {
  try {
    // Switch to this tab
    switchTab(elements.btnReadingMap);
    
    // Show loading state
    elements.btnReadingMap.disabled = true;
    
    // Show results section with loading messages
    elements.readingMapResults.style.display = 'block';
    elements.readingMapList.innerHTML = '<p class="muted">Generating mind map...</p>';
    
    // Get page text from storage
    const result = await chrome.storage.local.get(['pageText']);
    const pageText = result.pageText || '';
    
    if (!pageText) {
      elements.readingMapList.innerHTML = '<p class="muted">No page text available. Please refresh the page and try again.</p>';
      return;
    }
    
    // Generate paragraph summaries using summary of summaries technique
    const summariesResponse = await sendMessage({
      type: 'GET_PARAGRAPH_SUMMARIES',
      text: pageText,
      userField: userField,
      userExperience: userExperience
    });
    
    // Display paragraph summaries with color coding
    if (summariesResponse && summariesResponse.ok && summariesResponse.summaries) {
      // Create structure map overview
      const structureMapHtml = `
        <div class="structure-map-overview">
          <div class="mind-map-legend">
            <div class="legend-header">
              <h4>🧠 Mind Map</h4>
              <button id="toggle-all-sections" class="toggle-all-btn">
                <span id="toggle-text">Collapse All</span>
                <span id="toggle-icon">▼</span>
              </button>
            </div>
            <div class="legend-items">
              <div class="legend-item">
                <span class="legend-color high-importance"></span>
                <span class="legend-text">High Importance</span>
              </div>
              <div class="legend-item">
                <span class="legend-color medium-importance"></span>
                <span class="legend-text">Medium Importance</span>
              </div>
              <div class="legend-item">
                <span class="legend-color low-importance"></span>
                <span class="legend-text">Low Importance</span>
              </div>
            </div>
          </div>
          <div class="structure-flow">
            ${summariesResponse.summaries.map((summary, index) => {
              const relevanceClass = summary.relevanceLevel || 'low';
              const isLast = index === summariesResponse.summaries.length - 1;
              
              // Generate meaningful section titles based on actual content analysis
              let sectionTitle = generateSectionTitle(summary.summary, index, summariesResponse.summaries.length);
              
              return `
                <div class="structure-node ${relevanceClass}-importance">
                  <div class="node-content">
                    <div class="node-header" data-node-index="${index}">
                      <span class="node-title">${sectionTitle}</span>
                    </div>
                    <div class="node-summary collapsible-content" style="display: none;">
                      ${summary.summary}
                    </div>
                  </div>
                  ${!isLast ? '<div class="flow-connector"></div>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      
      // Display only the structure map as the main feature
      elements.readingMapList.innerHTML = structureMapHtml;
      
      // Add global toggle functionality
      addGlobalToggleHandler();
    } else {
      elements.readingMapList.innerHTML = '<p class="muted">Failed to generate mind map</p>';
    }
  } catch (error) {
    console.error('Error in Mind Map:', error);
    elements.readingMapList.innerHTML = '<p class="muted">Error generating mind map</p>';
  } finally {
    // Reset button state
    elements.btnReadingMap.disabled = false;
    elements.btnReadingMap.textContent = 'Mind Map';
  }
}



// Show download status when models are downloading
function showDownloadStatus() {
  elements.downloadStatus.style.display = 'block';
}

// Hide download status when models are ready
function hideDownloadStatus() {
  elements.downloadStatus.style.display = 'none';
}


// Initialize main app
async function initMainApp() {
  // Trigger model download when panel opens (user activation)
  const downloadResponse = await sendMessage({ type: 'TRIGGER_MODEL_DOWNLOAD' });
  
  // Show download status if models are downloading
  if (downloadResponse && downloadResponse.downloading) {
    showDownloadStatus();
  }
  
  // Update field display with any auto-detected field
  updateFieldDisplay();
  
}

// Initialize Ask Hatrick chat interface
function initAskHatrickChat() {
  if (!elements.askHatrickInput || !elements.askHatrickSend || !elements.chatMessages) {
    console.log('⚠️ Ask Hatrick elements not found, skipping initialization');
    return;
  }

  // Add event listeners for chat functionality
  elements.askHatrickSend.addEventListener('click', handleAskHatrickSend);
  elements.askHatrickInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskHatrickSend();
    }
  });

}

// Handle sending a message to Ask Hatrick
async function handleAskHatrickSend() {
  const question = elements.askHatrickInput.value.trim();
  if (!question) return;

  // Disable input and send button
  elements.askHatrickInput.disabled = true;
  elements.askHatrickSend.disabled = true;

  // Add user message to chat
  addChatMessage(question, 'user');
  
  // Clear input
  elements.askHatrickInput.value = '';

  // Show typing indicator
  showTypingIndicator();

  try {
    // Get user settings for context
    const userSettings = await chrome.storage.local.get(['userField', 'userExperience']);
    const userField = userSettings.userField || '';
    const userExperience = userSettings.userExperience || '';

    // Get page content from storage
    const pageData = await chrome.storage.local.get(['pageText', 'currentUrl']);
    const pageContent = pageData.pageText || '';

    // Send message to background script for AI processing
    const response = await sendMessage({
      type: 'ASK_HATRICK',
      question: question,
      pageContent: pageContent,
      userField: userField,
      userExperience: userExperience
    });
    
    // Remove typing indicator
    hideTypingIndicator();
    
    if (response.ok) {
      // Add Hatrick's response
      addChatMessage(response.response, 'hatrick');
    } else {
      // Handle error
      addChatMessage('Sorry, I encountered an error. Please try again.', 'hatrick');
    }
    
  } catch (error) {
    console.error('Error getting response:', error);
    hideTypingIndicator();
    addChatMessage('Sorry, I encountered an error. Please try again.', 'hatrick');
  } finally {
    // Re-enable input and send button
    elements.askHatrickInput.disabled = false;
    elements.askHatrickSend.disabled = false;
    elements.askHatrickInput.focus();
  }
}

// Add a message to the chat
function addChatMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}-message`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = sender === 'user' ? 'U' : '🎩';
  
  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = `<p>${message}</p>`;
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  elements.chatMessages.appendChild(messageDiv);
}

// Show typing indicator
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message hatrick-message typing-message';
  typingDiv.id = 'typing-indicator';
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = '🎩';
  
  const content = document.createElement('div');
  content.className = 'typing-indicator';
  content.innerHTML = `
    <span>Hatrick is thinking</span>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(content);
  
  elements.chatMessages.appendChild(typingDiv);
}

// Hide typing indicator
function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}


// Auto-detect field from current page and fill the appropriate field
// NOTE: This function is currently DISABLED - all calls to it are commented out
// To re-enable: uncomment the function calls in the codebase
async function autoDetectAndFillField() {
  try {
    console.log('🔍 Auto-detecting field from current page...');
    
    // Small delay to ensure page text is collected and DOM is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get page content and trigger field detection
    const response = await sendMessage({ type: 'PULL_PAGE_TEXT' });
    console.log('📄 Page text response:', response);
    
    if (response && response.pageText && response.pageText.length > 50) {
      // Request field detection from background script
      console.log('🤖 Sending field detection request...');
      const detectionResponse = await sendMessage({
        type: 'DETECT_FIELD',
        pageContent: response.pageText,
        url: response.url
      });
      console.log('🎯 Field detection response:', detectionResponse);
      
      if (detectionResponse && detectionResponse.ok && detectionResponse.displayField) {
        console.log('✅ Field auto-detected:', detectionResponse.displayField);
        
        // Check if user is in onboarding (welcome page visible) or main app
        const isOnboarding = elements.welcomePage.style.display !== 'none';
        console.log('🔍 Is onboarding?', isOnboarding);
        console.log('🔍 Welcome page display:', elements.welcomePage.style.display);
        console.log('🔍 Field input element:', elements.fieldInput);
        
        if (isOnboarding) {
          // Fill the welcome page input field
          console.log('📝 Filling welcome page input with:', detectionResponse.displayField);
          
          if (elements.fieldInput) {
            elements.fieldInput.value = detectionResponse.displayField;
            
            // Show a subtle indication that the field was auto-detected
            elements.fieldInput.style.backgroundColor = '#f8f9fa';
            elements.fieldInput.style.borderColor = '#007bff';
            
            // Show a brief tooltip or message
            showAutoDetectionMessage(detectionResponse.displayField, detectionResponse.confidence);
            
            // Check if continue button should be enabled
            checkCanProceed();
            
            console.log('✅ Successfully filled field input');
          } else {
            console.log('❌ Field input element not found!');
          }
        } else {
          // Update the main app field display
          console.log('📝 Updating main app field display');
          updateFieldDisplay();
        }
        
      } else {
        console.log('ℹ️ No field auto-detected, keeping default placeholder');
      }
    } else {
      console.log('ℹ️ No page content available for auto-detection');
    }
    
  } catch (error) {
    console.log('❌ Auto-detection failed:', error);
    // Continue with normal flow if auto-detection fails
  }
}

// Show a brief message about auto-detection
function showAutoDetectionMessage(field, confidence) {
  // Create a temporary message element
  const message = document.createElement('div');
  message.className = 'auto-detection-message';
  message.textContent = `Auto-detected: ${field}`;
  message.style.cssText = `
    position: absolute;
    top: -25px;
    left: 0;
    font-size: 11px;
    color: #6c757d;
    background: #e3f2fd;
    padding: 2px 6px;
    border-radius: 4px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  // Insert the message before the field input
  elements.fieldInput.parentNode.insertBefore(message, elements.fieldInput);
  
  // Fade in
  setTimeout(() => message.style.opacity = '1', 100);
  
  // Fade out and remove after 3 seconds
  setTimeout(() => {
    message.style.opacity = '0';
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Initialize panel
async function init() {
  console.log('🚀 Panel script is running!');
  console.log('🔍 Elements available:', elements);
  console.log('🔍 Field input element:', elements.fieldInput);
  
  // Check for page changes and clear cache if needed
  await checkPageChange();
  
  // Check if user has completed setup
  const result = await chrome.storage.local.get(['hasCompletedSetup', 'userField', 'userExperience', 'fieldDetails']);
  console.log('🔍 Storage result:', result);
  
  if (result.hasCompletedSetup && result.userField && result.userExperience) {
    // User has completed setup, show main app
    userField = result.userField;
    userExperience = result.userExperience;
    
    // Update field display with user-selected field
    elements.currentField.textContent = userField;
    elements.currentExperience.textContent = userExperience;
    
    // Update logo for the current field
    updateLogoForField(userField);
    
    showMainApp();
  } else {
    // Show welcome page
    elements.welcomePage.style.display = 'block';
    elements.mainApp.style.display = 'none';
    
    // Check if there's already field detection data available
    if (result.fieldDetails && result.fieldDetails.displayField) {
      console.log('🎯 Found existing field detection data, filling field...');
      fillDetectedField(result.fieldDetails);
    } else {
      // Run field detection if no data available
      // DISABLED: Auto-detection temporarily turned off
      // await autoDetectAndFillField();
    }
  }
}

// Event listeners
// Add click listeners to all field label options
elements.fieldLabelOptions.forEach(option => {
  option.addEventListener('click', handleFieldLabelClick);
  
  // Add delete button listeners for existing fields
  const deleteBtn = option.querySelector('.delete-field-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent field selection when clicking delete
      const fieldName = deleteBtn.dataset.field;
      handleDeleteField(fieldName);
    });
  }
});
elements.fieldSuggestions.addEventListener('click', handleFieldSuggestionClick);

// Add event listeners to stars
elements.stars.forEach((star, index) => {
  star.addEventListener('click', (e) => {
    e.preventDefault();
    const levels = ['beginner', 'intermediate', 'professional'];
    handleExperienceSelection(levels[index]);
  });
  
  // Add hover event listeners
  star.addEventListener('mouseenter', () => {
    highlightStarsUpTo(index);
  });
  
  star.addEventListener('mouseleave', () => {
    restoreStarSelection();
  });
});

// Add event listener to continue button
elements.continueBtn.addEventListener('click', handleContinueClick);

elements.fieldSetting.addEventListener('click', handleChangeSettings);
elements.levelSetting.addEventListener('click', handleChangeSettings);
elements.btnCoreFinder.addEventListener('click', handleCoreFinderClick);
elements.btnReadingMap.addEventListener('click', handleReadingMapClick);
elements.btnVocabPocket.addEventListener('click', handleVocabPocketClick);
elements.summaryHeader.addEventListener('click', handleSummaryToggle);
elements.keywordsHeader.addEventListener('click', handleKeywordsToggle);

// Dive In section event listeners
elements.diveInTermExplanationHeader.addEventListener('click', () => handleDiveInToggle('term-explanation'));
elements.diveInFieldVocabularyHeader.addEventListener('click', () => handleDiveInToggle('field-vocabulary'));
elements.diveInNotesHeader.addEventListener('click', () => handleDiveInToggle('notes'));
elements.diveInAskHatrickHeader.addEventListener('click', () => handleDiveInToggle('ask-hatrick'));

// Heart button event listener
elements.heartButton.addEventListener('click', async () => {
  const isFavorited = elements.heartButton.classList.contains('favorited');
  const term = elements.selectedTermText.textContent;
  
  if (isFavorited) {
    // Remove from vocab pocket - show save icon
    elements.heartButton.classList.remove('favorited');
    showSaveIcon();
    await removeFromVocabPocket(term);
    console.log('💔 Term removed from vocab pocket');
  } else {
    // Add to vocab pocket - show saved icon
    elements.heartButton.classList.add('favorited');
    showSavedIcon();
    await addToVocabPocket(term);
    console.log('❤️ Term added to vocab pocket');
  }
  
  // Update field vocabulary display
  await updateFieldVocabularyDisplay();
});

// Navigation event listeners
if (elements.footerClickable) {
  elements.footerClickable.addEventListener('click', showHatsPage);
}
if (elements.welcomeFooterClickable) {
  elements.welcomeFooterClickable.addEventListener('click', showHatsPage);
}
if (elements.backToMain) {
  elements.backToMain.addEventListener('click', showMainAppFromHats);
}

// Welcome page event listeners
if (elements.startExploringBtn) {
  elements.startExploringBtn.addEventListener('click', () => {
    hideNewFieldWelcome();
    // Go to main app with features (First Skim, Mind Map, Dive In)
    showMainApp();
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'MODEL_DOWNLOAD':
      // Handle model download updates (unused for now)
      console.log('Model download update:', message);
      break;
      
    case 'AUTO_DETECT_FIELD':
      // Handle auto-detection response
      console.log('Auto-detection response:', message);
      sendResponse({ ok: true });
      break;
      
  }
});

// Display explanation in the panel
function displayExplanation(explanationData) {
  console.log('📝 Displaying explanation in panel:', explanationData);
  
  // Get the current term from storage
  chrome.storage.local.get(['lastSelection'], (result) => {
    const term = result.lastSelection || 'Unknown term';
    
    // Show the explanation section
    const explanationSection = document.getElementById('term-explanation-section');
    if (explanationSection) {
      explanationSection.style.display = 'block';
      
      // Update the selected term
      const selectedTermElement = document.getElementById('selected-term-text');
      if (selectedTermElement) {
        selectedTermElement.textContent = term;
      }
      
      // Update explanation content
      const beginnerBox = document.getElementById('term-explain-beginner');
      const advancedBox = document.getElementById('term-explain-advanced');
      
      if (beginnerBox && advancedBox) {
        beginnerBox.innerHTML = `<p>${formatExplanation(explanationData.beginner)}</p>`;
        advancedBox.innerHTML = `<p>${formatExplanation(explanationData.advanced)}</p>`;
      }
      
      // Set up tab switching
      const tabs = explanationSection.querySelectorAll('.explanation-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active class from all tabs
          tabs.forEach(t => t.classList.remove('active'));
          // Add active class to clicked tab
          tab.classList.add('active');
          
          // Show/hide appropriate explanation
          const level = tab.dataset.level;
          if (level === 'beginner') {
            beginnerBox.style.display = 'block';
            advancedBox.style.display = 'none';
          } else {
            beginnerBox.style.display = 'none';
            advancedBox.style.display = 'block';
          }
        });
      });
      
      // Set up save button
      const saveBtn = document.getElementById('btn-save-term');
      if (saveBtn) {
        saveBtn.onclick = () => saveVocab(term);
      }
      
      // Set up clear highlights button
      const clearBtn = document.getElementById('btn-clear-selected-highlights');
      if (clearBtn) {
        console.log('🔗 Setting up clear highlights button for Term Explanation');
        clearBtn.onclick = () => {
          console.log('🔘 Clear Highlights button clicked in Term Explanation');
          clearHighlights();
        };
      } else {
        console.error('❌ Clear highlights button not found in Term Explanation');
      }
      
      // Show the appropriate explanation based on user experience
      const userExp = explanationData.userExperience || 'beginner';
      if (userExp === 'advanced') {
        tabs[1].click(); // Click the advanced tab
      }
    } else {
      console.error('❌ Explanation section not found in panel');
    }
  });
}

// Clear selected text highlights from the page (for Term Explanation section)
function clearHighlights() {
  console.log('🧹 Clearing selected text highlights from panel');
  
  // Send message to content script to clear only selected text highlights
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      console.log('🧹 Sending CLEAR_SELECTED_HIGHLIGHTS message to tab:', tabs[0].id);
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'CLEAR_SELECTED_HIGHLIGHTS'
      }, (response) => {
        console.log('🧹 Response from content script:', response);
        if (response && response.ok) {
          console.log('✅ Selected text highlights cleared successfully');
        } else {
          console.error('❌ Failed to clear selected text highlights:', response);
        }
      });
    } else {
      console.error('❌ No active tab found');
    }
  });
}

// Save term to vocab pocket
async function saveVocab(term) {
  try {
    const vocabPocket = await getVocabPocket();
    if (!vocabPocket.includes(term)) {
      await addToVocabPocket(term);
      console.log('Term saved to vocab pocket:', term);
      
      // Show success feedback
      const saveBtn = document.getElementById('btn-save-term');
      if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = '#28a745';
        setTimeout(() => {
          saveBtn.textContent = originalText;
          saveBtn.style.background = '';
        }, 2000);
      }
    } else {
      // Show already saved feedback
      const saveBtn = document.getElementById('btn-save-term');
      if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Already Saved';
        saveBtn.style.background = '#6c757d';
        setTimeout(() => {
          saveBtn.textContent = originalText;
          saveBtn.style.background = '';
        }, 2000);
      }
    }
  } catch (error) {
    console.error('Error saving term to vocab pocket:', error);
  }
}

// Format explanation text (same as content.js)
function formatExplanation(explanation) {
  return explanation
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>') // ***text*** -> bold italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')              // **text** -> bold
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');                         // *text* -> italic
}

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // Handle explanation updates from inline dialog
    if (changes.lastExplanation) {
      console.log('📥 Received explanation update in panel');
      console.log('📥 Explanation data:', changes.lastExplanation.newValue);
      displayExplanation(changes.lastExplanation.newValue);
    }
  }
});

// Generate section title based on content analysis
function generateSectionTitle(summary, index, totalSections) {
  const text = summary.toLowerCase();
  const positionRatio = index / (totalSections - 1);
  
  // Content-based analysis
  const hasIntroductionKeywords = text.includes('introduces') || text.includes('introduction') || 
                                 text.includes('overview') || text.includes('background') ||
                                 text.includes('context') || text.includes('sets the stage');
  
  const hasProblemKeywords = text.includes('problem') || text.includes('challenge') || 
                           text.includes('issue') || text.includes('difficulty') ||
                           text.includes('obstacle') || text.includes('barrier');
  
  const hasArgumentKeywords = text.includes('argument') || text.includes('claim') || 
                             text.includes('thesis') || text.includes('position') ||
                             text.includes('asserts') || text.includes('main point');
  
  const hasFindingsKeywords = text.includes('findings') || text.includes('results') || 
                             text.includes('discovery') || text.includes('outcome') ||
                             text.includes('conclusion') || text.includes('shows that');
  
  const hasEvidenceKeywords = text.includes('evidence') || text.includes('support') || 
                             text.includes('example') || text.includes('data') ||
                             text.includes('research') || text.includes('study');
  
  const hasTechnicalKeywords = text.includes('implementation') || text.includes('method') || 
                              text.includes('process') || text.includes('technique') ||
                              text.includes('approach') || text.includes('system');
  
  const hasConclusionKeywords = text.includes('concludes') || text.includes('summary') || 
                               text.includes('final') || text.includes('overall') ||
                               text.includes('implications') || text.includes('significance');
  
  // Generate title based on content analysis
  if (hasIntroductionKeywords && hasProblemKeywords) {
    return 'Introduction & Problem Statement';
  } else if (hasIntroductionKeywords) {
    return 'Introduction & Overview';
  } else if (hasArgumentKeywords && hasFindingsKeywords) {
    return 'Core Argument & Key Findings';
  } else if (hasArgumentKeywords) {
    return 'Main Arguments';
  } else if (hasFindingsKeywords) {
    return 'Key Findings & Results';
  } else if (hasEvidenceKeywords) {
    return 'Supporting Evidence & Examples';
  } else if (hasTechnicalKeywords) {
    return 'Technical Implementation';
  } else if (hasConclusionKeywords) {
    return 'Conclusion & Implications';
  } else if (positionRatio < 0.2) {
    return 'Opening Section';
  } else if (positionRatio > 0.8) {
    return 'Closing Section';
  } else {
    return 'Analysis & Discussion';
  }
}

// Simple field display function - shows user-selected field
function updateFieldDisplay() {
  chrome.storage.local.get(['userField'], (result) => {
    console.log('🔍 Storage data retrieved:', result);
    
    const userField = result.userField || 'Unknown';
    const fieldElement = document.getElementById('current-field');
    console.log('🔍 Field element found:', fieldElement);
    
    if (fieldElement) {
      console.log('🔄 Updating field display with user-selected field:', userField);
      
      // Show the user-selected field (not auto-detected)
      fieldElement.textContent = userField;
      fieldElement.title = 'User-selected field';
      console.log('✅ Set field to user selection:', userField);
      
      // Reset any previous color styling
      fieldElement.style.color = '';
    } else {
      console.log('❌ Field element not found!');
    }
  });
}

// Listen for storage changes to update field display when auto-detection completes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // Only update if userField changes (not auto-detection)
    if (changes.userField && !changes.autoDetectedField) {
      console.log('🔄 User field changed, updating display');
      updateFieldDisplay();
    }
  }
});

// Listen for messages from content script about page navigation and field detection
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_NAVIGATED') {
    console.log('🌐 Page navigation detected, running field detection...');
    // Run field detection when user navigates to a new page
    // DISABLED: Auto-detection temporarily turned off
    // autoDetectAndFillField();
  } else if (message.type === 'FIELD_DETECTION_COMPLETED') {
    console.log('🎯 Field detection completed in content script, but ignoring auto-detection...');
    // DISABLED: Auto-detection is turned off, ignore field detection results
    // fillDetectedField(message.fieldDetails);
  }
});

// Fill the detected field in the appropriate location
function fillDetectedField(fieldDetails) {
  console.log('🔄 Filling detected field:', fieldDetails);
  
  // Check if user is in onboarding (welcome page visible) or main app
  const isOnboarding = elements.welcomePage.style.display !== 'none';
  console.log('🔍 Is onboarding?', isOnboarding);
  console.log('🔍 Welcome page display:', elements.welcomePage.style.display);
  console.log('🔍 Field input element:', elements.fieldInput);
  
  if (isOnboarding) {
    // Fill the welcome page input field
    console.log('📝 Filling welcome page input with:', fieldDetails.displayField);
    
    if (elements.fieldInput) {
      elements.fieldInput.value = fieldDetails.displayField;
      
      // Show a subtle indication that the field was auto-detected
      elements.fieldInput.style.backgroundColor = '#f8f9fa';
      elements.fieldInput.style.borderColor = '#007bff';
      
      // Show a brief tooltip or message
      showAutoDetectionMessage(fieldDetails.displayField, fieldDetails.confidence);
      
      // Check if continue button should be enabled
      checkCanProceed();
      
      console.log('✅ Successfully filled field input');
    } else {
      console.log('❌ Field input element not found!');
    }
  } else {
    // Update the main app field display
    console.log('📝 Updating main app field display');
    updateFieldDisplay();
  }
}

// Set panel height dynamically and position footer
function setPanelHeight() {
  const panelHeight = window.innerHeight;
  document.documentElement.style.setProperty('--panel-height', panelHeight + 'px');
  
  // Position footer at the bottom of the viewport
  const footerHeight = 50; // Height of the footer
  const footerBottom = panelHeight - footerHeight;
  document.documentElement.style.setProperty('--footer-bottom', footerBottom + 'px');
  
  console.log('Panel height set to:', panelHeight + 'px');
  console.log('Footer positioned at bottom:', footerBottom + 'px');
  console.log('Document height:', document.documentElement.offsetHeight);
  console.log('Body height:', document.body.offsetHeight);
  console.log('Main app height:', document.getElementById('main-app')?.offsetHeight);
  console.log('Welcome page height:', document.getElementById('welcome-page')?.offsetHeight);
}

// Set height on load and resize
setPanelHeight();
window.addEventListener('resize', setPanelHeight);

// Add global toggle functionality for mind map sections
function addGlobalToggleHandler() {
  const toggleBtn = document.getElementById('toggle-all-sections');
  const toggleText = document.getElementById('toggle-text');
  const toggleIcon = document.getElementById('toggle-icon');
  let allCollapsed = true; // Start with all collapsed
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      const allContents = document.querySelectorAll('.collapsible-content');
      
      if (allCollapsed) {
        // Expand all
        allContents.forEach(content => {
          content.style.display = 'block';
        });
        toggleText.textContent = 'Collapse All';
        toggleIcon.textContent = '▼';
        allCollapsed = false;
      } else {
        // Collapse all
        allContents.forEach(content => {
          content.style.display = 'none';
        });
        toggleText.textContent = 'Expand All';
        toggleIcon.textContent = '▲';
        allCollapsed = true;
      }
    });
  }
}

// Handle term explanation display
async function displayTermExplanation(term) {
  console.log('📚 Panel: Displaying term explanation for:', term);
  
  // Show the selected term display
  elements.selectedTermDisplay.style.display = 'block';
  elements.selectedTermText.textContent = term;
  
  // Check if term is already in vocabulary and set heart button state
  await checkAndSetHeartButtonState(term);
  
  // Show the term explanation section and expand it
  elements.diveInResults.style.display = 'block';
  elements.diveInTermExplanationContent.style.display = 'block';
  elements.diveInTermExplanationToggle.textContent = '▼';
  
  // Switch to dive in tab
  switchTab(elements.btnVocabPocket);
  
  // Update the explanation results with loading state
  elements.termExplanationResults.innerHTML = `
    <div class="explanation-loading">
      <p class="muted">Loading explanation for "${term}"...</p>
    </div>
  `;
  
  try {
    // Get page context for better explanations
    const pageContext = await getPageContext();
    const userField = elements.fieldSetting?.value || '';
    const userExperience = elements.levelSetting?.value || '';
    
    console.log('📚 Panel: Calling API with context:', { term, userField, userExperience });
    console.log('📚 Panel: Page context:', pageContext);
    
    // Call the real API
    const response = await sendMessage({
      type: 'GET_EXPLANATION',
      term: term,
      pageContext: pageContext,
      userField: userField,
      userExperience: userExperience
    });
    
    console.log('📚 Panel: API response:', response);
    
    if (response.ok && (response.beginner || response.advanced)) {
      console.log('📚 Panel: API response received:', { beginner: response.beginner, advanced: response.advanced });
      
      // Display the real explanations
      elements.termExplanationResults.innerHTML = `
        <div class="explanation-content">
          <div class="explanation-tabs">
            <button class="explanation-tab active" data-level="beginner">Simple</button>
            <button class="explanation-tab" data-level="advanced">Detailed</button>
          </div>
          <div class="explanation-boxes">
            <div id="term-explain-beginner" class="explanation-box active">
              <p>${formatExplanation(response.beginner)}</p>
            </div>
            <div id="term-explain-advanced" class="explanation-box">
              <p>${formatExplanation(response.advanced)}</p>
            </div>
          </div>
          <div class="explanation-actions">
            <button id="btn-save-term-dive" class="btn btn-primary">Save to Vocabulary</button>
          </div>
        </div>
      `;
      
      // Set up tab switching
      setupExplanationTabs();
      
      // Set up save button
      setupSaveButton(term);
      
    } else {
      throw new Error(response.error || 'Failed to get explanation');
    }
    
  } catch (error) {
    console.error('📚 Panel: Error getting explanation:', error);
    console.error('📚 Panel: Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Show error state
    elements.termExplanationResults.innerHTML = `
      <div class="explanation-error">
        <p class="muted">Sorry, couldn't get explanation for "${term}". Please try again.</p>
        <p class="muted" style="font-size: 11px; color: #999;">Error: ${error.message}</p>
        <button class="btn btn-secondary" onclick="displayTermExplanation('${term}')">Retry</button>
      </div>
    `;
  }
}

// Helper function to get page context
async function getPageContext() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return {
            title: document.title,
            url: window.location.href,
            content: document.body.innerText.substring(0, 2000) // Limit content
          };
        }
      });
      return results[0]?.result || '';
    }
  } catch (error) {
    console.log('Could not get page context:', error);
  }
  return '';
}

// Helper function to format explanation text
function formatExplanation(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Helper function to set up explanation tabs
function setupExplanationTabs() {
  const tabs = document.querySelectorAll('.explanation-tab');
  const boxes = document.querySelectorAll('.explanation-box');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const level = tab.dataset.level;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active box
      boxes.forEach(box => {
        box.classList.remove('active');
        if (box.id.includes(level)) {
          box.classList.add('active');
        }
      });
    });
  });
}

// Helper function to set up save button
function setupSaveButton(term) {
  const saveBtn = document.getElementById('btn-save-term-dive');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveVocab(term);
    });
  }
}


// Update field vocabulary display
async function updateFieldVocabularyDisplay() {
  try {
    // Use selected field for vocabulary if available, otherwise use current user field
    const fieldToShow = selectedFieldForVocabulary || userField;
    const fieldVocabulary = await getFieldVocabulary(fieldToShow);
    
    if (fieldVocabulary.length === 0) {
      const fieldName = selectedFieldForVocabulary || 'your field';
      elements.diveInFieldVocabularyContent.innerHTML = `
        <p class="muted">No vocabulary terms saved for ${fieldName} yet</p>
      `;
    } else {
      // Create keyword cards similar to first skim page
      const keywordCards = fieldVocabulary.map(term => `
        <div class="core-keyword-item">
          <div class="keyword-card" data-term="${term}">
            <span class="keyword-term">${term}</span>
            <button class="heart-btn saved" data-term="${term}" title="Remove from field vocabulary">
              <span class="heart-icon">♥</span>
            </button>
          </div>
        </div>
      `).join('');
      
      const fieldName = selectedFieldForVocabulary || userField;
      elements.diveInFieldVocabularyContent.innerHTML = `
        <div class="field-vocabulary-header">
          <h4>${fieldName} Vocabulary (${fieldVocabulary.length} terms)</h4>
        </div>
        <div class="core-keywords-list">
          <div class="keywords-cards-row">
            ${keywordCards}
          </div>
        </div>
      `;
      
      // Add click handlers for field vocabulary terms
      addFieldVocabularyClickHandlers();
    }
  } catch (error) {
    console.error('❌ Error updating field vocabulary display:', error);
  }
}

// Add click handlers for field vocabulary terms
function addFieldVocabularyClickHandlers() {
  const keywordCards = elements.diveInFieldVocabularyContent.querySelectorAll('.keyword-card');
  
  keywordCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the heart button
      if (e.target.closest('.heart-btn')) {
        return;
      }
      
      const term = card.dataset.term;
      console.log('📚 Field vocabulary term clicked:', term);
      
      // Show term explanation for this term
      displayTermExplanation(term);
    });
  });
  
  // Add heart button click handlers for field vocabulary
  const heartButtons = elements.diveInFieldVocabularyContent.querySelectorAll('.heart-btn');
  
  heartButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation(); // Prevent keyword card click
      
      const term = this.getAttribute('data-term');
      const heartIcon = this.querySelector('.heart-icon');
      
      // Remove from field vocabulary (use selected field if available)
      const fieldToRemoveFrom = selectedFieldForVocabulary || userField;
      await removeFromFieldVocabulary(fieldToRemoveFrom, term);
      this.classList.remove('saved');
      heartIcon.textContent = '♡';
      console.log(`💔 Removed "${term}" from ${fieldToRemoveFrom} vocabulary`);
      
      // Update the display
      await updateFieldVocabularyDisplay();
    });
  });
}

// Check if term is in vocabulary and set heart button state
async function checkAndSetHeartButtonState(term) {
  try {
    const vocabPocket = await getVocabPocket();
    const isInVocab = vocabPocket.includes(term);
    
    if (isInVocab) {
      elements.heartButton.classList.add('favorited');
      showSavedIcon();
    } else {
      elements.heartButton.classList.remove('favorited');
      showSaveIcon();
    }
  } catch (error) {
    console.error('❌ Error checking heart button state:', error);
  }
}

// Show save icon (not saved state)
function showSaveIcon() {
  elements.heartButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21L10.55 19.7C8.86667 18.1834 7.475 16.875 6.375 15.775C5.275 14.675 4.4 13.6917 3.75 12.825C3.1 11.9417 2.64167 11.1334 2.375 10.4C2.125 9.66669 2 8.91669 2 8.15002C2 6.58336 2.525 5.27502 3.575 4.22502C4.625 3.17502 5.93333 2.65002 7.5 2.65002C8.36667 2.65002 9.19167 2.83336 9.975 3.20002C10.7583 3.56669 11.4333 4.08336 12 4.75003C12.5667 4.08336 13.2417 3.56669 14.025 3.20002C14.8083 2.83336 15.6333 2.65002 16.5 2.65002C18.0667 2.65002 19.375 3.17502 20.425 4.22502C21.475 5.27502 22 6.58336 22 8.15002C22 8.91669 21.8667 9.66669 21.6 10.4C21.35 11.1334 20.9 11.9417 20.25 12.825C19.6 13.6917 18.725 14.675 17.625 15.775C16.525 16.875 15.1333 18.1834 13.45 19.7L12 21ZM12 18.3C13.6 16.8667 14.9167 15.6417 15.95 14.625C16.9833 13.5917 17.8 12.7 18.4 11.95C19 11.1834 19.4167 10.5084 19.65 9.92503C19.8833 9.32503 20 8.73336 20 8.15002C20 7.15002 19.6667 6.31669 19 5.65003C18.3333 4.98336 17.5 4.65003 16.5 4.65003C15.7167 4.65003 14.9917 4.87503 14.325 5.32503C13.6583 5.75836 13.2 6.31669 12.95 7.00003H11.05C10.8 6.31669 10.3417 5.75836 9.675 5.32503C9.00833 4.87503 8.28333 4.65003 7.5 4.65003C6.5 4.65003 5.66667 4.98336 5 5.65003C4.33333 6.31669 4 7.15002 4 8.15002C4 8.73336 4.11667 9.32503 4.35 9.92503C4.58333 10.5084 5 11.1834 5.6 11.95C6.2 12.7 7.01667 13.5917 8.05 14.625C9.08333 15.6417 10.4 16.8667 12 18.3Z" fill="#1D1B20"/>
    </svg>
  `;
}

// Show saved icon (saved state)
function showSavedIcon() {
  elements.heartButton.innerHTML = `
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.35L8.55 17.05C6.86667 15.5333 5.475 14.225 4.375 13.125C3.275 12.025 2.4 11.0417 1.75 10.175C1.1 9.29167 0.641667 8.48333 0.375 7.75C0.125 7.01667 0 6.26667 0 5.5C0 3.93333 0.525 2.625 1.575 1.575C2.625 0.525 3.93333 0 5.5 0C6.36667 0 7.19167 0.183333 7.975 0.55C8.75833 0.916667 9.43333 1.43333 10 2.1C10.5667 1.43333 11.2417 0.916667 12.025 0.55C12.8083 0.183333 13.6333 0 14.5 0C16.0667 0 17.375 0.525 18.425 1.575C19.475 2.625 20 3.93333 20 5.5C20 6.26667 19.8667 7.01667 19.6 7.75C19.35 8.48333 18.9 9.29167 18.25 10.175C17.6 11.0417 16.725 12.025 15.625 13.125C14.525 14.225 13.1333 15.5333 11.45 17.05L10 18.35Z" fill="#E859B2"/>
    </svg>
  `;
}

// Initialize sticker notes functionality
function initializeStickerNotes() {
  const stickerNotes = document.querySelectorAll('.sticker-note');
  
  stickerNotes.forEach(note => {
    setupStickerNote(note);
  });
  
  // Setup add note button
  const addNoteBtn = document.getElementById('add-note-btn');
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling to header
      addNewStickerNote();
    });
  }
}

// Setup individual sticker note functionality
function setupStickerNote(note) {
  const content = note.querySelector('.sticker-content p');
  const closeBtn = note.querySelector('.sticker-close');
  
  // Make content editable
  content.contentEditable = true;
  content.style.outline = 'none';
  
  // Handle click to edit
  content.addEventListener('click', () => {
    if (content.textContent === 'Click to edit your note...') {
      content.textContent = '';
      content.focus();
    }
  });
  
  // Handle blur to save
  content.addEventListener('blur', () => {
    if (content.textContent.trim() === '') {
      content.textContent = content.dataset.placeholder || 'Click to edit your note...';
    }
  });
  
  // Handle close button
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    note.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      note.remove();
    });
  });
}

// Add new sticker note
function addNewStickerNote() {
  const container = document.querySelector('.sticker-notes-container');
  if (!container) return;
  
  // Ensure notes section is expanded
  const notesContent = document.getElementById('notes-content');
  const notesHeader = document.getElementById('notes-header');
  if (notesContent && notesHeader) {
    notesContent.style.display = 'block';
    notesHeader.classList.add('expanded');
  }
  
  // Create new note element
  const newNote = document.createElement('div');
  newNote.className = 'sticker-note purple';
  newNote.innerHTML = `
    <div class="sticker-header">
      <span class="sticker-title">Note</span>
      <button class="sticker-close">×</button>
    </div>
    <div class="sticker-content">
      <p>Click to edit your note...</p>
    </div>
  `;
  
  // Add to container (grid will automatically place it in the next available position)
  container.appendChild(newNote);
  
  // Setup the new note
  setupStickerNote(newNote);
  
  // Focus on the new note content
  const content = newNote.querySelector('.sticker-content p');
  content.click();
}

// Add text to notes from inline popup
function addTextToNotes(text) {
  const container = document.querySelector('.sticker-notes-container');
  if (!container) return;
  
  // First, check if there are any blank notes (notes with default content)
  const existingNotes = container.querySelectorAll('.sticker-note');
  let blankNote = null;
  
  for (let note of existingNotes) {
    const title = note.querySelector('.sticker-title');
    const content = note.querySelector('.sticker-content p');
    
    // Check if this is a blank note (has default title "Note" and default content)
    if (title && title.textContent === 'Note' && 
        content && (content.textContent === 'Click to edit your note...' || content.textContent.trim() === '')) {
      blankNote = note;
      break; // Use the first blank note found
    }
  }
  
  if (blankNote) {
    // Fill the first blank note
    const title = blankNote.querySelector('.sticker-title');
    const content = blankNote.querySelector('.sticker-content p');
    
    if (title) title.textContent = `"${text}"`;
    if (content) content.textContent = 'Click to edit your note...';
    
    console.log('📝 Filled existing blank note with text:', text);
  } else {
    // No blank notes found, create a new one
    const newNote = document.createElement('div');
    newNote.className = 'sticker-note purple';
    newNote.innerHTML = `
      <div class="sticker-header">
        <span class="sticker-title">"${text}"</span>
        <button class="sticker-close">×</button>
      </div>
      <div class="sticker-content">
        <p>Click to edit your note...</p>
      </div>
    `;
    
    // Add to container (grid will automatically place it in the next available position)
    container.appendChild(newNote);
    
    // Setup the new note
    setupStickerNote(newNote);
    
    console.log('📝 Created new note with text:', text);
  }
  
  // Show the Dive In section if it's not already visible
  if (elements.diveInResults.style.display === 'none') {
    handleVocabPocketClick();
  }
  
  // Expand the notes section
  const notesContent = document.getElementById('notes-content');
  const notesHeader = document.getElementById('notes-header');
  if (notesContent && notesHeader) {
    notesContent.style.display = 'block';
    notesHeader.classList.add('expanded');
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📚 Panel: Received message:', message);
  if (message.action === 'displayTermExplanation') {
    console.log('📚 Panel: Calling displayTermExplanation with term:', message.term);
    displayTermExplanation(message.term);
  } else if (message.type === 'addToNotes') {
    console.log('📚 Panel: Adding text to notes:', message.text);
    addTextToNotes(message.text);
  } else {
    console.log('📚 Panel: Unknown message type:', message.type || message.action);
  }
  return true;
});

// Start the panel
init();