// Hatrick Chrome Extension - Background Script
// Handles context menus, message routing, and AI API interactions
//
// Main Features:
// 1. Chrome Prompt API integration for term explanations
// 2. Chrome Summarizer API integration for page summaries
// 3. Context menu handling
// 4. Message routing between content script and side panel
// 5. Side panel management

// ============================================================================
// CONFIGURATION AND GLOBAL VARIABLES
// ============================================================================

// Data provider toggle - switch between 'mock' and 'real'
const dataProvider = 'real'; // Using Chrome's built-in Prompt API

// Chrome Prompt API session for term explanations
let languageModelSession = null;

// ============================================================================
// COMPREHENSIVE PROFESSIONAL FIELDS STRUCTURE
// ============================================================================

// Comprehensive field structure based on professional_categories_subfields.csv
const PROFESSIONAL_FIELDS = {
  'Architecture & Design': [
    'Architecture', 'Urban Planning / Urban Design', 'Landscape Architecture',
    'Interior Design', 'Industrial / Product Design', 'Graphic / Visual Communication Design',
    'UX / Interaction Design', 'Exhibition / Environmental Design', 'Sustainable Design',
    'Computational Design'
  ],
  'Engineering & Technical Sciences': [
    'Civil / Structural Engineering', 'Mechanical Engineering', 'Electrical / Electronics Engineering',
    'Chemical Engineering', 'Environmental Engineering', 'Materials Science & Engineering',
    'Computer / Software Engineering', 'Industrial / Manufacturing Engineering',
    'Aerospace / Aeronautical Engineering', 'Marine / Naval Architecture'
  ],
  'Natural Sciences': [
    'Physics', 'Chemistry', 'Biology', 'Geology / Earth Sciences', 'Environmental Science',
    'Oceanography', 'Meteorology', 'Mathematics / Statistics', 'Astronomy'
  ],
  'Social Sciences': [
    'Economics', 'Sociology', 'Psychology', 'Political Science', 'Anthropology',
    'Geography', 'Education', 'Public Policy / Public Administration', 'Criminology', 'Demography'
  ],
  'Business, Management & Finance': [
    'Business Administration', 'Accounting / Auditing', 'Finance / Banking', 'Marketing',
    'Human Resources Management', 'Supply Chain / Logistics', 'International Business',
    'Entrepreneurship', 'Real Estate Management', 'E-Commerce'
  ],
  'Health & Medicine': [
    'Clinical Medicine', 'Dentistry', 'Nursing', 'Pharmacy', 'Public Health',
    'Biomedical Sciences', 'Medical Imaging', 'Nutrition Science',
    'Physical Therapy / Rehabilitation', 'Veterinary Medicine'
  ],
  'Arts & Humanities': [
    'Philosophy', 'History', 'Literature / Linguistics', 'Art History', 'Fine Arts',
    'Performing Arts (Music, Theatre, Dance)', 'Film / Photography / Media Studies',
    'Cultural Studies', 'Design Theory', 'Religion / Theology'
  ],
  'Information & Communication Technology': [
    'Computer Science', 'Information Systems', 'Data Science / Big Data',
    'Artificial Intelligence / Machine Learning', 'Cybersecurity', 'Network / Cloud Engineering',
    'Game Development', 'Software Development', 'Human-Computer Interaction',
    'Digital Media / Multimedia'
  ],
  'Agriculture, Forestry, Fisheries & Food': [
    'Agronomy / Crop Science', 'Horticulture', 'Forestry', 'Animal Science',
    'Fisheries / Aquaculture', 'Food Science / Food Technology', 'Agricultural Economics',
    'Soil Science'
  ],
  'Law & Public Service': [
    'Law / Legal Studies', 'International Law', 'Public Administration', 'Political Science',
    'Diplomacy / International Relations', 'Public Policy', 'Social Work',
    'Criminology / Criminal Justice', 'Ethics / Governance'
  ],
  'Transportation, Construction & Infrastructure': [
    'Construction Management', 'Transportation Planning', 'Highway / Bridge Engineering',
    'Railway / Metro Engineering', 'Logistics / Freight Management', 'Urban Transit Systems',
    'Aviation / Aerospace Transportation', 'Maritime Transportation'
  ],
  'Environmental & Sustainability Studies': [
    'Environmental Policy', 'Ecology / Conservation Ecology', 'Climate Science',
    'Renewable Energy', 'Sustainable Development', 'Environmental Design',
    'Waste Management', 'Environmental Economics'
  ],
  'Tourism, Hospitality & Service Management': [
    'Hospitality Management', 'Tourism Management', 'Event Management',
    'Culinary Arts / Food Service', 'Recreation / Leisure Studies', 'Customer Service'
  ],
  'Media, Communication & Journalism': [
    'Journalism', 'Mass Communication', 'Advertising', 'Public Relations',
    'Broadcasting / Television / Film', 'Digital Media / Social Media',
    'Publishing / Editing', 'Visual Communication'
  ],
  'Military, Security & Emergency Services': [
    'Military Science', 'Security Management', 'Police / Law Enforcement',
    'Emergency Management', 'Fire Protection Engineering', 'Disaster Response'
  ],
  'Emerging & Interdisciplinary Fields': [
    'Artificial Intelligence Ethics', 'Data & Society', 'Smart Cities', 'Climate Technology',
    'Computational Social Science', 'Human-Centered Design', 'Digital Humanities',
    'Bioinformatics', 'Cognitive Science', 'XR / AR / VR Design'
  ]
};

// Cache for field detection results (URL -> Field mapping)
const fieldDetectionCache = new Map();

// Chrome Summarizer API instance for page summaries
let summarizer = null;

// Chrome Summarizer API instance for paragraph summaries (Mind Map)
let paragraphSummarizer = null;

// Initialize Summarizer API for page summaries
async function initializeSummarizer() {
  try {
    // Check if the Summarizer API is available
    const availability = await Summarizer.availability();
    
    if (availability === 'unavailable') {
      throw new Error('Chrome Summarizer API is not available on this device');
    }
    
    if (availability === 'downloadable' || availability === 'downloading') {
      console.log('Summarizer model is downloading...');
      // The model will be downloaded automatically when first used
    }
    
    // Create summarizer with tldr type for paragraph summaries
    summarizer = await Summarizer.create({
      type: 'tldr',
      format: 'plain-text',
      length: 'medium', // 3 sentences for medium tldr
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Summarizer model downloaded ${e.loaded * 100}%`);
        });
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Summarizer:', error);
    return false;
  }
}

// Initialize Paragraph Summarizer API for Mind Map
async function initializeParagraphSummarizer() {
  try {
    // Check if the Summarizer API is available
    const availability = await Summarizer.availability();
    
    if (availability === 'unavailable') {
      throw new Error('Chrome Summarizer API is not available on this device');
    }
    
    if (availability === 'downloadable' || availability === 'downloading') {
      console.log('Paragraph Summarizer model is downloading...');
      // The model will be downloaded automatically when first used
    }
    
    // Create summarizer with headline type for single sentence summaries
    paragraphSummarizer = await Summarizer.create({
      type: 'headline',
      format: 'plain-text',
      length: 'medium', // 17 words for medium headline
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Paragraph Summarizer model downloaded ${e.loaded * 100}%`);
        });
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Paragraph Summarizer:', error);
    return false;
  }
}

// Real API function for page summarization - concise one-paragraph summary
async function getSummaryWithAPI(text) {
  try {
    // Initialize summarizer if not already done
    if (!summarizer) {
      const initialized = await initializeSummarizer();
      if (!initialized) {
        throw new Error('Failed to initialize Chrome Summarizer API');
      }
    }
    
    // Clean the text (remove HTML if present)
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    console.log('=== PAGE SUMMARY: CONCISE OVERVIEW ===');
    console.log('Text length:', cleanText.length, 'characters');
    
    // Use summary of summaries technique for page summary
    const contentChunks = splitContentThoughtfullyForSummary(cleanText);
    console.log('Page summary: split into', contentChunks.length, 'chunks');
    
    // If content is small enough, use direct summarization
    if (contentChunks.length === 1 && cleanText.length < 8000) {
      // Get user experience level from storage
      const result = await chrome.storage.local.get(['userExperience']);
      const userExperience = result.userExperience || 'Professional';
      
      let summaryPrompt;
      if (userExperience === 'New to field') {
        summaryPrompt = 'Summarize this piece in one short paragraph (3–4 sentences). Begin by clearly stating where it\'s from and what it is (e.g., "Article from [Outlet] explaining [Topic]"). Use very simple, friendly language as if explaining to a 12-year-old. Avoid professional or technical terms. Use everyday metaphors and examples to make complex ideas easy to picture. Focus on what the main idea is, why it matters in daily life, and one relatable takeaway that helps the reader feel they "get the big picture."';
      } else {
        summaryPrompt = 'Summarize this piece in one concise paragraph (3–4 sentences). Begin by clearly stating where it comes from and what type of publication it is (e.g., "Industry analysis from [Outlet]", "Research update from [Institution]"). Use professional, specific language appropriate for someone familiar with the field. Highlight the main argument or findings, connect them briefly to current industry trends or comparable developments, and note what makes this piece noteworthy. Keep the tone neutral, informative, and analytical — designed to help a professional decide whether it\'s worth a deeper read.';
      }
      
      const summary = await summarizer.summarize(cleanText, {
        context: summaryPrompt
      });
      
      // Return as a single paragraph summary
      return [summary.trim()];
    }
    
    // For larger content, use summary of summaries
    const chunkSummaries = [];
    for (const chunk of contentChunks) {
      const summary = await summarizer.summarize(chunk, {
        context: 'This is a section of web page content that should be summarized.'
      });
      chunkSummaries.push(summary);
    }
    
    // Combine summaries and create final concise summary
    const combinedSummaries = chunkSummaries.join('\n\n');
    
    // Get user experience level from storage for final summary
    const result = await chrome.storage.local.get(['userExperience']);
    const userExperience = result.userExperience || 'Professional';
    
    let finalSummaryPrompt;
    if (userExperience === 'New to field') {
      finalSummaryPrompt = 'These are summaries of different sections of a web page. Summarize this piece in one short paragraph (3–4 sentences). Begin by clearly stating where it\'s from and what it is (e.g., "Article from [Outlet] explaining [Topic]"). Use very simple, friendly language as if explaining to a 12-year-old. Avoid professional or technical terms. Use everyday metaphors and examples to make complex ideas easy to picture. Focus on what the main idea is, why it matters in daily life, and one relatable takeaway that helps the reader feel they "get the big picture."';
    } else {
      finalSummaryPrompt = 'These are summaries of different sections of a web page. Summarize this piece in one concise paragraph (3–4 sentences). Begin by clearly stating where it comes from and what type of publication it is (e.g., "Industry analysis from [Outlet]", "Research update from [Institution]"). Use professional, specific language appropriate for someone familiar with the field. Highlight the main argument or findings, connect them briefly to current industry trends or comparable developments, and note what makes this piece noteworthy. Keep the tone neutral, informative, and analytical — designed to help a professional decide whether it\'s worth a deeper read.';
    }
    
    const finalSummary = await summarizer.summarize(combinedSummaries, {
      context: finalSummaryPrompt
    });
    
    // Return as a single paragraph summary
    return [finalSummary.trim()];
    
  } catch (error) {
    console.error('Chrome Summarizer API Error:', error);
    // Fallback to mock data on API failure
    return [
      'This appears to be a web article covering key concepts and main ideas in a comprehensive manner. The content provides important details and supporting information to help readers understand the topic. The article offers practical insights and applications for further learning. This content would benefit readers seeking to understand the subject matter and its practical applications.'
    ];
  }
}

// Helper function for page summary content splitting
function splitContentThoughtfullyForSummary(text) {
  const chunks = [];
  const maxChunkSize = 3000; // ~750 tokens
  const chunkOverlap = 200; // Overlap to maintain context
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  
  let currentChunk = '';
  let currentLength = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphLength = paragraph.length;
    
    // If adding this paragraph would exceed max size, start a new chunk
    if (currentLength + paragraphLength > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap from previous chunk
      const overlapText = currentChunk.slice(-chunkOverlap);
      currentChunk = overlapText + ' ' + paragraph;
      currentLength = currentChunk.length;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentLength += paragraphLength;
    }
  }
  
  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  // If we still have very large chunks, split by sentences
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length > maxChunkSize) {
      const sentenceChunks = splitBySentencesForSummary(chunk, maxChunkSize, chunkOverlap);
      finalChunks.push(...sentenceChunks);
    } else {
      finalChunks.push(chunk);
    }
  }
  
  return finalChunks;
}

// Split large chunks by sentences for page summary
function splitBySentencesForSummary(text, maxSize, overlap) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + ' ' + sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Mock function for page summarization
async function getSummaryMock(text) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    'Article from TechCrunch covering the latest developments in artificial intelligence. The piece explores recent breakthroughs in machine learning algorithms and their practical applications in healthcare and finance. Key findings include improved accuracy in medical diagnosis and automated trading systems. This content would benefit developers, researchers, and business leaders interested in AI implementation and its real-world impact.'
  ];
}

// Main summary function that switches between mock and real
async function getSummary(text) {
  if (dataProvider === 'real') {
    return await getSummaryWithAPI(text);
  } else {
    return await getSummaryMock(text);
  }
}

// Initialize Chrome Prompt API session
async function initializeLanguageModel() {
  try {
    // Check if the Prompt API is available
    const availability = await LanguageModel.availability();
    
    if (availability === 'unavailable') {
      throw new Error('Chrome Prompt API is not available on this device');
    }
    
    if (availability === 'downloadable' || availability === 'downloading') {
      console.log('Language model is downloading...');
      // The model will be downloaded automatically when first used
    }
    
    // Create a new session
    languageModelSession = await LanguageModel.create();
    
    // Set up the session with initial context
    await languageModelSession.append({
      role: 'user',
      parts: [{
        type: 'text',
        value: 'You are a helpful educational assistant. Provide clear, accurate explanations for terms and concepts. Always format your responses with BEGINNER: and ADVANCED: sections.'
      }]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Language Model:', error);
    return false;
  }
}

// Real API function for term explanation using Chrome Prompt API with page context
async function explainTermWithAPI(term, pageContext = '', userField = '', userExperience = '') {
  try {
    // Initialize session if not already done
    if (!languageModelSession) {
      const initialized = await initializeLanguageModel();
      if (!initialized) {
        throw new Error('Failed to initialize Chrome Prompt API');
      }
    }
    
    // Clean and truncate page context for better processing
    const cleanContext = pageContext
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 3000); // Limit context to 3000 chars to leave room for the prompt
    
    // Build context-aware prompt
    let prompt = `You are explaining the term "${term}" to someone`;
    
    // Add user context if available
    if (userField) {
      prompt += ` studying/working in ${userField}`;
    }
    
    if (userExperience === 'beginner') {
      prompt += ` who is new to the field`;
    } else if (userExperience === 'professional') {
      prompt += ` who is an experienced professional`;
    }
    
    prompt += `.

WEBPAGE CONTEXT:
The term "${term}" appears in the following webpage content:
"""
${cleanContext}
"""

Based on this specific context and webpage content, please explain the term "${term}" in two ways:

1. Beginner explanation: Explain the term "${term}" to a beginner with no background in ${userField || 'the field'}. Use simple language, short sentences, and clear examples. Include:
   - A basic definition
   - Why it matters
   - How it works in simple terms
   - One easy example from real life
   Avoid jargon and keep it under 100 words.

2. Advanced explanation: Explain the term "${term}" to a professional in ${userField || 'the field'}. Include:
   - A concise, field-specific definition
   - Its practical relevance or context
   - How it works or key components
   - A real-world example or use case
   - Related or contrasting terms
   Keep the tone professional, concise (within 150 words), and assume the reader already has foundational knowledge.

Important: Your explanations should be informed by how the term is actually used in this specific webpage context, not just general definitions.

Format your response as:
BEGINNER: [simple explanation under 100 words, including basic definition, why it matters, how it works, and real-life example]
ADVANCED: [professional explanation within 150 words, including definition, relevance, components, example, and related terms]`;

    const response = await languageModelSession.prompt(prompt);
    
    // Parse the response to extract beginner and advanced explanations
    const beginnerMatch = response.match(/BEGINNER:\s*(.+?)(?=ADVANCED:|$)/s);
    const advancedMatch = response.match(/ADVANCED:\s*(.+?)$/s);
    
    return {
      beginner: beginnerMatch ? beginnerMatch[1].trim() : `"${term}" is a concept that requires further explanation in the context of this webpage.`,
      advanced: advancedMatch ? advancedMatch[1].trim() : `"${term}" is a complex concept with multiple layers of meaning as used in this specific context.`
    };
  } catch (error) {
    console.error('Chrome Prompt API Error:', error);
    // Fallback to mock data on API failure
    return {
      beginner: `"${term}" is a fundamental concept that beginners should understand as a building block for more advanced topics, particularly in the context of this webpage.`,
      advanced: `"${term}" represents a sophisticated concept involving complex relationships and nuanced understanding that requires deeper knowledge and experience, as demonstrated in this specific context.`
    };
  }
}

// Mock function for term explanation with context support
async function explainTermMock(term, pageContext = '', userField = '', userExperience = '') {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const contextNote = pageContext ? ' in the context of this webpage' : '';
  const fieldNote = userField ? ` in the ${userField} field` : '';
  
  return {
    beginner: `"${term}" is a fundamental concept that beginners should understand as a building block for more advanced topics${fieldNote}${contextNote}.`,
    advanced: `"${term}" represents a sophisticated concept involving complex relationships and nuanced understanding that requires deeper knowledge and experience${fieldNote}${contextNote}.`
  };
}

// Main term explanation function that switches between mock and real
async function explainTerm(term, pageContext = '', userField = '', userExperience = '') {
  if (dataProvider === 'real') {
    return await explainTermWithAPI(term, pageContext, userField, userExperience);
  } else {
    return await explainTermMock(term, pageContext, userField, userExperience);
  }
}

// ============================================================================
// FIELD DETECTION FUNCTIONS
// ============================================================================

// AI-powered field detection using Chrome Prompt API
async function detectFieldFromContent(pageContent, url) {
  try {
    // Initialize session if not already done
    if (!languageModelSession) {
      const initialized = await initializeLanguageModel();
      if (!initialized) {
        throw new Error('Failed to initialize Chrome Prompt API for field detection');
      }
    }
    
    // Clean and truncate content for better processing
    const cleanContent = pageContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 2000); // Limit to 2000 chars for field detection
    
    // Build comprehensive list of all subfields for the prompt
    const allSubfields = [];
    for (const [category, subfields] of Object.entries(PROFESSIONAL_FIELDS)) {
      allSubfields.push(...subfields);
    }
    
    const subfieldList = allSubfields.join('\n- ');
    const categoryList = Object.keys(PROFESSIONAL_FIELDS).join('\n- ');
    
    const prompt = `Analyze this webpage content and determine the most specific professional field it belongs to.

WEBPAGE CONTENT:
"""
${cleanContent}
"""

URL: ${url}

First, try to identify the most specific subfield from this comprehensive list:

SUBFIELDS:
- ${subfieldList}

If you can identify a specific subfield, respond with just that subfield name.

If the content is too general or spans multiple subfields, identify the broader category from this list:

CATEGORIES:
- ${categoryList}

Consider:
- Technical terminology and specialized jargon
- Subject matter depth and specificity
- Professional context and expertise level
- Industry focus and applications

Respond with either:
1. The most specific subfield name (preferred)
2. The broader category name (if no specific subfield matches)

Examples of good responses:
- "Artificial Intelligence / Machine Learning" (specific subfield)
- "Software Development" (specific subfield)
- "Information & Communication Technology" (broader category)
- "Health & Medicine" (broader category)`;

    const response = await languageModelSession.prompt(prompt);
    const detectedField = response.trim();
    
    // Validate and categorize the detected field
    const result = validateAndCategorizeField(detectedField);
    
    console.log('🎯 AI detected field:', detectedField, '→ Processed as:', result);
    return result;
    
  } catch (error) {
    console.error('❌ AI field detection failed:', error);
    return {
      category: 'General',
      subfield: null,
      fullPath: 'General',
      confidence: 'low'
    };
  }
}

// Validation and categorization function
function validateAndCategorizeField(detectedField) {
  // First, check if it's a direct subfield match
  for (const [category, subfields] of Object.entries(PROFESSIONAL_FIELDS)) {
    if (subfields.includes(detectedField)) {
      return {
        category: category,
        subfield: detectedField,
        fullPath: `${category} > ${detectedField}`,
        confidence: 'high',
        displayField: detectedField // The field to display in UI (subfield takes priority)
      };
    }
  }
  
  // Check if it's a category match
  if (PROFESSIONAL_FIELDS[detectedField]) {
    return {
      category: detectedField,
      subfield: null,
      fullPath: detectedField,
      confidence: 'medium',
      displayField: detectedField // The field to display in UI
    };
  }
  
  // Fuzzy matching for common variations
  const fuzzyMatches = findFuzzyMatches(detectedField);
  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];
    return {
      category: bestMatch.category,
      subfield: bestMatch.subfield,
      fullPath: bestMatch.subfield ? `${bestMatch.category} > ${bestMatch.subfield}` : bestMatch.category,
      confidence: 'medium',
      displayField: bestMatch.subfield || bestMatch.category // Subfield takes priority over category
    };
  }
  
  // Fallback to General
  return {
    category: 'General',
    subfield: null,
    fullPath: 'General',
    confidence: 'low',
    displayField: 'General' // The field to display in UI
  };
}

// Fuzzy matching function for common field variations
function findFuzzyMatches(detectedField) {
  const normalizedField = detectedField.toLowerCase();
  const matches = [];
  
  // Common field mappings
  const fieldMappings = {
    'computer science': ['Information & Communication Technology', 'Computer Science'],
    'software engineering': ['Engineering & Technical Sciences', 'Computer / Software Engineering'],
    'data science': ['Information & Communication Technology', 'Data Science / Big Data'],
    'ai': ['Information & Communication Technology', 'Artificial Intelligence / Machine Learning'],
    'machine learning': ['Information & Communication Technology', 'Artificial Intelligence / Machine Learning'],
    'medicine': ['Health & Medicine', 'Clinical Medicine'],
    'healthcare': ['Health & Medicine', 'Public Health'],
    'business': ['Business, Management & Finance', 'Business Administration'],
    'finance': ['Business, Management & Finance', 'Finance / Banking'],
    'engineering': ['Engineering & Technical Sciences', null],
    'law': ['Law & Public Service', 'Law / Legal Studies'],
    'psychology': ['Social Sciences', 'Psychology'],
    'education': ['Social Sciences', 'Education'],
    'architecture': ['Architecture & Design', 'Architecture'],
    'design': ['Architecture & Design', null]
  };
  
  for (const [key, value] of Object.entries(fieldMappings)) {
    if (normalizedField.includes(key)) {
      matches.push({
        category: value[0],
        subfield: value[1],
        score: key.length / normalizedField.length
      });
    }
  }
  
  // Sort by score (best match first)
  return matches.sort((a, b) => b.score - a.score);
}

// Cache management functions
function getCachedFieldDetection(url) {
  return fieldDetectionCache.get(url);
}

function cacheFieldDetection(url, fieldResult) {
  fieldDetectionCache.set(url, fieldResult);
  
  // Also save to chrome storage for persistence
  chrome.storage.local.get(['fieldDetectionCache'], (result) => {
    const cache = result.fieldDetectionCache || {};
    cache[url] = fieldResult;
    chrome.storage.local.set({ fieldDetectionCache: cache });
  });
}

// Load field detection cache from storage on startup
async function loadFieldDetectionCache() {
  try {
    const result = await chrome.storage.local.get(['fieldDetectionCache']);
    const cache = result.fieldDetectionCache || {};
    
    // Load into memory cache
    for (const [url, fieldResult] of Object.entries(cache)) {
      fieldDetectionCache.set(url, fieldResult);
    }
    
    console.log('📚 Loaded field detection cache:', fieldDetectionCache.size, 'entries');
  } catch (error) {
    console.error('❌ Failed to load field detection cache:', error);
  }
}

// Mock response function for Ask Hatrick (fallback)
async function getPlaceholderResponse(question) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  const lowerQuestion = question.toLowerCase();
  
  // Simple keyword-based responses
  if (lowerQuestion.includes('what') && lowerQuestion.includes('mean')) {
    return "I'd be happy to explain that! Based on the content on this page, I can provide detailed explanations of terms and concepts. Try selecting a specific term on the page and I'll give you a comprehensive explanation.";
  }
  
  if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize')) {
    return "Great question! I can help you understand the main points of this content. Try clicking the 'First Skim' button to get a comprehensive summary, or 'Mind Map' to see how the content is structured.";
  }
  
  if (lowerQuestion.includes('key') || lowerQuestion.includes('important')) {
    return "I can identify the most important concepts for you! The 'Core Finder' feature will highlight the key terms and concepts on this page, making it easier to focus on what matters most.";
  }
  
  if (lowerQuestion.includes('learn') || lowerQuestion.includes('study')) {
    return "Perfect! I'm designed to help you learn more effectively. I can break down complex concepts, explain difficult terms, and help you build your vocabulary. What specific aspect would you like to explore?";
  }
  
  if (lowerQuestion.includes('help') || lowerQuestion.includes('how')) {
    return "I'm here to help you understand any content! You can ask me about specific terms, request summaries, or get explanations. I work best when you're specific about what you'd like to know.";
  }
  
  // Default responses
  const defaultResponses = [
    "That's an interesting question! I can help you understand this content better. Try being more specific about what you'd like to know, and I'll do my best to help.",
    "I'd love to help you with that! I can explain terms, provide summaries, or break down complex concepts. What specific part of the content would you like me to focus on?",
    "Great question! I'm designed to help you learn more effectively. Try asking about specific terms or concepts, and I'll provide detailed explanations tailored to your level.",
    "I'm here to help you understand this content! I can explain difficult terms, provide summaries, or help you identify the most important concepts. What would you like to explore?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Real API function for Ask Hatrick questions using Chrome Prompt API
async function askHatrickWithAPI(question, pageContent = '', userField = '', userExperience = '') {
  try {
    // Initialize session if not already done
    if (!languageModelSession) {
      const initialized = await initializeLanguageModel();
      if (!initialized) {
        throw new Error('Failed to initialize Chrome Prompt API');
      }
    }
    
    // Clean and truncate page content for better processing
    const cleanContent = pageContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 5000); // Limit content to 5000 chars to leave room for the prompt
    
    // Build context-aware prompt for Ask Hatrick
    let prompt = `You are Hatrick, a helpful learning assistant. Answer the user's question based on the webpage content provided.
    
USER QUESTION: ${question}

WEBPAGE CONTENT:
"""
${cleanContent}
"""

Please provide a helpful, accurate answer based on the content above. If the content doesn't contain enough information to answer the question, let the user know and suggest what they might look for.`;

    // Add user context if available
    if (userField) {
      prompt += `\n\nUser Context: The user is studying/working in ${userField}`;
    }
    
    if (userExperience === 'beginner') {
      prompt += ` and is new to the field`;
    } else if (userExperience === 'professional') {
      prompt += ` and is an experienced professional`;
    }
    
    prompt += `.\n\nProvide an answer that is appropriate for their level and field.`;

    const response = await languageModelSession.prompt(prompt);
    return response;
    
  } catch (error) {
    console.error('Error in askHatrickWithAPI:', error);
    throw error;
  }
}

// Real API function for core keyword extraction using Chrome Prompt API
async function getCoreKeywordsWithAPI(text, userField = '', userExperience = '') {
  try {
    // Initialize session if not already done
    if (!languageModelSession) {
      const initialized = await initializeLanguageModel();
      if (!initialized) {
        throw new Error('Failed to initialize Chrome Prompt API');
      }
    }
    
    // Clean and truncate text for better processing
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 4000); // Limit to 4000 chars for keyword extraction
    
    // Build context-aware prompt for keyword extraction
    let prompt = `You are analyzing an article to find the most fundamental keywords for understanding it`;
    
    if (userField) {
      prompt += ` in the context of ${userField}`;
    }
    
    if (userExperience === 'beginner') {
      prompt += ` for someone new to the field`;
    } else if (userExperience === 'professional') {
      prompt += ` for an experienced professional`;
    }
    
    prompt += `.

ARTICLE TEXT:
"""
${cleanText}
"""

Please identify the 5-7 most fundamental keywords or key concepts that are essential for understanding this article. For each keyword, provide a brief 1-2 sentence explanation.

Format your response as:
KEYWORD: [keyword]
EXPLANATION: [brief explanation]

KEYWORD: [keyword]
EXPLANATION: [brief explanation]

(continue for all keywords)

Focus on:
- Core concepts that appear multiple times
- Technical terms specific to the subject matter
- Fundamental ideas that other concepts build upon
- Key processes, methods, or principles discussed`;

    const response = await languageModelSession.prompt(prompt);
    
    // Parse the response to extract keywords and explanations
    const keywordBlocks = response.split(/KEYWORD:/i).slice(1); // Remove first empty element
    const keywords = [];
    
    for (const block of keywordBlocks) {
      const lines = block.trim().split('\n');
      const keyword = lines[0].trim();
      
      // Find explanation line
      const explanationLine = lines.find(line => line.toLowerCase().startsWith('explanation:'));
      const explanation = explanationLine 
        ? explanationLine.replace(/^explanation:\s*/i, '').trim()
        : 'Key concept requiring further analysis.';
      
      if (keyword && explanation) {
        // Clean the keyword term of any markdown formatting
        let cleanTerm = keyword
          .replace(/\*\*/g, '')  // Remove all ** 
          .replace(/\*/g, '')    // Remove all *
          .replace(/_/g, '')     // Remove all _
          .trim();
        
        let processedExplanation = explanation;
        
        // Check if term contains both abbreviation and full name
        // Patterns like "AI (Artificial Intelligence)" or "Machine Learning (ML)" or "API - Application Programming Interface"
        const abbreviationPatterns = [
          /^([A-Z]{2,})\s*[\(\-]\s*([^)]+)[\)]?$/i,  // "AI (Artificial Intelligence)" or "AI - Artificial Intelligence"
          /^([^(]+)\s*\(([A-Z]{2,})\)$/i,            // "Artificial Intelligence (AI)"
          /^([A-Z]{2,})\s*[\-–]\s*(.+)$/i,          // "AI - Artificial Intelligence"
          /^(.+)\s*[\-–]\s*([A-Z]{2,})$/i           // "Artificial Intelligence - AI"
        ];
        
        let finalTerm = cleanTerm;
        let fullName = '';
        
        for (const pattern of abbreviationPatterns) {
          const match = cleanTerm.match(pattern);
          if (match) {
            const [, part1, part2] = match;
            
            // Determine which part is the abbreviation (shorter, more capitals)
            const part1IsAbbrev = part1.length <= 5 && /^[A-Z]{2,}$/.test(part1.trim());
            const part2IsAbbrev = part2.length <= 5 && /^[A-Z]{2,}$/.test(part2.trim());
            
            if (part1IsAbbrev && !part2IsAbbrev) {
              // Part1 is abbreviation, Part2 is full name
              finalTerm = part1.trim();
              fullName = part2.trim();
            } else if (part2IsAbbrev && !part1IsAbbrev) {
              // Part2 is abbreviation, Part1 is full name
              finalTerm = part2.trim();
              fullName = part1.trim();
            } else if (part1.length < part2.length) {
              // Use shorter as abbreviation
              finalTerm = part1.trim();
              fullName = part2.trim();
            } else {
              // Use longer as full name
              finalTerm = part2.trim();
              fullName = part1.trim();
            }
            break;
          }
        }
        
        // If we found a full name, prepend it to the explanation with formatting
        if (fullName) {
          processedExplanation = `***${fullName}*** - ${explanation}`;
        }
        
        keywords.push({
          term: finalTerm,
          explanation: processedExplanation
        });
      }
    }
    
    // Ensure we have at least some keywords
    if (keywords.length === 0) {
      return [
        { term: 'Core Concepts', explanation: 'Fundamental ideas presented in this content.' },
        { term: 'Key Terms', explanation: 'Important terminology used throughout the article.' },
        { term: 'Main Topics', explanation: 'Primary subjects discussed in the material.' }
      ];
    }
    
    return keywords.slice(0, 7); // Limit to 7 keywords max
  } catch (error) {
    console.error('Chrome Prompt API Error for keywords:', error);
    // Fallback to mock data on API failure
    return [
      { term: 'Core Concepts', explanation: 'Fundamental ideas presented in this content.' },
      { term: 'Key Terms', explanation: 'Important terminology used throughout the article.' },
      { term: 'Main Topics', explanation: 'Primary subjects discussed in the material.' }
    ];
  }
}

// Mock function for core keyword extraction
async function getCoreKeywordsMock(text, userField = '', userExperience = '') {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const fieldNote = userField ? ` in ${userField}` : '';
  
  return [
    { term: 'Core Concepts', explanation: `Fundamental ideas presented in this content${fieldNote}.` },
    { term: 'Key Terms', explanation: `Important terminology used throughout the article${fieldNote}.` },
    { term: 'Main Topics', explanation: `Primary subjects discussed in the material${fieldNote}.` },
    { term: 'Essential Principles', explanation: `Basic principles that underpin the discussion${fieldNote}.` }
  ];
}

// Main core keywords function that switches between mock and real
async function getCoreKeywords(text, userField = '', userExperience = '') {
  if (dataProvider === 'real') {
    return await getCoreKeywordsWithAPI(text, userField, userExperience);
  } else {
    return await getCoreKeywordsMock(text, userField, userExperience);
  }
}

// Real API function for paragraph summarization using Chrome Summarizer API
async function getParagraphSummariesWithAPI(text, userField = '', userExperience = '') {
  try {
    // Initialize paragraph summarizer if not already done
    if (!paragraphSummarizer) {
      const initialized = await initializeParagraphSummarizer();
      if (!initialized) {
        throw new Error('Failed to initialize Chrome Summarizer API for paragraphs');
      }
    }
    
    // Clean and truncate text for better processing
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('=== PARAGRAPH SUMMARIES TECHNIQUE ===');
    console.log('Original text length:', cleanText.length, 'characters');
    
    // Step 1: Thoughtfully split content using semantic boundaries
    const contentChunks = splitContentThoughtfully(cleanText);
    console.log('Content split into', contentChunks.length, 'chunks');
    
    // Step 2: Generate summaries for each chunk using Chrome Summarizer API
    const paragraphSummaries = [];
    for (let i = 0; i < contentChunks.length; i++) {
      const chunk = contentChunks[i];
      console.log(`Summarizing chunk ${i + 1}/${contentChunks.length} (${chunk.length} chars)`);
      
      try {
        // Build context for the summarizer
        let context = 'This is a section of web page content that should be summarized in one clear sentence.';
        
        if (userField) {
          context += ` The content is in the context of ${userField}.`;
        }
        
        if (userExperience === 'beginner') {
          context += ' Summarize for someone new to the field.';
        } else if (userExperience === 'professional') {
          context += ' Summarize for an experienced professional.';
        }
        
        context += ' Focus on how this section relates to the overall article structure and its role in the broader narrative.';
        
        const summary = await paragraphSummarizer.summarize(chunk, { context: context });
        
        if (summary) {
          // Analyze importance of this chunk
          const importanceAnalysis = analyzeChunkImportance(chunk, i, contentChunks.length);
          
          paragraphSummaries.push({
            paragraphNumber: i + 1,
            summary: summary.trim(),
            importanceScore: importanceAnalysis.importanceScore,
            relevanceLevel: importanceAnalysis.relevanceLevel,
            importanceReason: importanceAnalysis.importanceReason
          });
        }
      } catch (error) {
        console.error(`Error summarizing chunk ${i + 1}:`, error);
        // Skip this chunk if summarization fails
        continue;
      }
    }
    
    console.log('Created', paragraphSummaries.length, 'paragraph summaries');
    
    return paragraphSummaries;
    
  } catch (error) {
    console.error('Chrome Summarizer API Error for paragraph summaries:', error);
    // Fallback to mock data on API failure
    return [
      { paragraphNumber: 1, summary: 'This paragraph discusses important concepts and ideas.' },
      { paragraphNumber: 2, summary: 'This paragraph provides important details and supporting information.' },
      { paragraphNumber: 3, summary: 'This paragraph discusses practical applications and insights.' }
    ];
  }
}

// Thoughtfully split content at semantic boundaries (following Chrome's guidance)
function splitContentThoughtfully(text) {
  const chunks = [];
  const maxChunkSize = 3000; // ~750 tokens (following Chrome's recommendation)
  const chunkOverlap = 200; // Overlap to maintain context
  
  // Method 1: Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  
  let currentChunk = '';
  let currentLength = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphLength = paragraph.length;
    
    // If adding this paragraph would exceed max size, start a new chunk
    if (currentLength + paragraphLength > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap from previous chunk
      const overlapText = currentChunk.slice(-chunkOverlap);
      currentChunk = overlapText + ' ' + paragraph;
      currentLength = currentChunk.length;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentLength += paragraphLength;
    }
  }
  
  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  // Method 2: If we still have very large chunks, split by sentences
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length > maxChunkSize) {
      const sentenceChunks = splitBySentences(chunk, maxChunkSize, chunkOverlap);
      finalChunks.push(...sentenceChunks);
    } else {
      finalChunks.push(chunk);
    }
  }
  
  console.log('Content splitting complete:', finalChunks.length, 'final chunks');
  return finalChunks;
}

// Split large chunks by sentences while maintaining context
function splitBySentences(text, maxSize, overlap) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + ' ' + sentence;
        } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}


// Analyze chunk importance and relevance with improved distribution
function analyzeChunkImportance(chunkContent, index, totalChunks) {
  const text = chunkContent.trim();
  const length = text.length;
  const wordCount = text.split(/\s+/).length;
  
  // Calculate weighted importance score (0-100 scale for better differentiation)
  let importanceScore = 0;
  let importanceReason = '';
  
  // Factor 1: Content Density (20 points max)
  const contentDensity = Math.min(wordCount / 10, 20); // More words = higher density
  importanceScore += contentDensity;
  
  // Factor 2: Position Weight (15 points max)
  const positionWeight = calculatePositionWeight(index, totalChunks);
  importanceScore += positionWeight;
  
  // Factor 3: Semantic Importance (25 points max)
  const semanticScore = calculateSemanticImportance(text);
  importanceScore += semanticScore;
  
  // Factor 4: Structural Indicators (20 points max)
  const structuralScore = calculateStructuralImportance(text);
  importanceScore += structuralScore;
  
  // Factor 5: Content Quality (20 points max)
  const qualityScore = calculateContentQuality(text);
  importanceScore += qualityScore;
  
  // Normalize to 0-100 scale
  importanceScore = Math.min(Math.max(importanceScore, 0), 100);
  
  // Determine relevance level based on percentile distribution
  const relevanceLevel = determineRelevanceLevel(importanceScore, index, totalChunks);
  
  // Generate reason based on contributing factors
  importanceReason = generateImportanceReason({
    contentDensity,
    positionWeight,
    semanticScore,
    structuralScore,
    qualityScore,
    index,
    totalChunks
  });
  
  return {
    importanceScore: Math.round(importanceScore),
    relevanceLevel: relevanceLevel,
    importanceReason: importanceReason,
    wordCount: wordCount,
    length: length
  };
}

// Calculate position-based importance weight
function calculatePositionWeight(index, totalChunks) {
  const position = index / (totalChunks - 1); // 0 to 1
  
  // Introduction and conclusion get highest weight
  if (position <= 0.1) return 15; // First 10%
  if (position >= 0.9) return 12; // Last 10%
  
  // Middle sections get moderate weight
  if (position <= 0.3) return 8;  // Early sections
  if (position >= 0.7) return 6;  // Late sections
  
  return 3; // Middle sections
}

// Calculate semantic importance based on keywords and phrases
function calculateSemanticImportance(text) {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // High-impact keywords (3 points each)
  const highImpactKeywords = [
    'conclusion', 'summary', 'findings', 'results', 'key findings',
    'main point', 'primary', 'essential', 'critical', 'significant',
    'breakthrough', 'discovery', 'innovation', 'solution', 'answer'
  ];
  
  const highImpactMatches = highImpactKeywords.filter(keyword => 
    lowerText.includes(keyword)
  ).length;
  score += highImpactMatches * 3;
  
  // Medium-impact keywords (2 points each)
  const mediumImpactKeywords = [
    'important', 'key', 'main', 'however', 'therefore', 'furthermore',
    'moreover', 'specifically', 'particularly', 'especially', 'notably',
    'for example', 'in particular', 'study shows', 'research indicates'
  ];
  
  const mediumImpactMatches = mediumImpactKeywords.filter(keyword => 
    lowerText.includes(keyword)
  ).length;
  score += mediumImpactMatches * 2;
  
  // Transition words (1 point each)
  const transitionWords = [
    'additionally', 'furthermore', 'moreover', 'in addition',
    'consequently', 'thus', 'hence', 'accordingly'
  ];
  
  const transitionMatches = transitionWords.filter(word => 
    lowerText.includes(word)
  ).length;
  score += transitionMatches;
  
  return Math.min(score, 25);
}

// Calculate structural importance indicators
function calculateStructuralImportance(text) {
  let score = 0;
  
  // Questions and emphasis (2 points each)
  const questions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  score += (questions + exclamations) * 2;
  
  // Numbers and statistics (1 point each, max 5)
  const numbers = (text.match(/\d+/g) || []).length;
  score += Math.min(numbers, 5);
  
  // Lists and bullet points (3 points)
  if (text.includes('•') || text.includes('-') || text.includes('1.') || text.includes('2.')) {
    score += 3;
  }
  
  // Quotations and citations (2 points)
  if (text.includes('"') || text.includes("'") || text.includes('according to')) {
    score += 2;
  }
  
  return Math.min(score, 20);
}

// Calculate content quality indicators
function calculateContentQuality(text) {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // Technical terms (2 points each, max 10)
  const technicalTerms = [
    'algorithm', 'methodology', 'framework', 'protocol', 'system',
    'analysis', 'implementation', 'optimization', 'efficiency', 'performance',
    'method', 'approach', 'technique', 'strategy', 'model'
  ];
  
  const technicalMatches = technicalTerms.filter(term => 
    lowerText.includes(term)
  ).length;
  score += Math.min(technicalMatches * 2, 10);
  
  // Research indicators (3 points each, max 9)
  const researchTerms = [
    'study', 'research', 'data shows', 'findings', 'results',
    'journal', 'paper', 'report', 'survey'
  ];
  
  const researchMatches = researchTerms.filter(term => 
    lowerText.includes(term)
  ).length;
  score += Math.min(researchMatches * 3, 9);
  
  // Action words (1 point each, max 5)
  const actionWords = [
    'demonstrates', 'proves', 'shows', 'indicates', 'suggests',
    'reveals', 'confirms', 'validates', 'establishes'
  ];
  
  const actionMatches = actionWords.filter(word => 
    lowerText.includes(word)
  ).length;
  score += Math.min(actionMatches, 5);
  
  return Math.min(score, 20);
}

// Determine relevance level based on score distribution
function determineRelevanceLevel(score, index, totalChunks) {
  // Use percentile-based distribution for better control
  const position = index / (totalChunks - 1);
  
  // Force introduction and conclusion to be high importance
  if (position <= 0.1 || position >= 0.9) {
    return 'high';
  }
  
  // Use score thresholds for better distribution
  if (score >= 70) return 'high';      // Top 20-30%
  if (score >= 40) return 'medium';    // Middle 50%
  if (score >= 20) return 'low';      // Bottom 10-20%
  
  return 'low'; // Everything else is low (no background category)
}

// Generate detailed importance reason
function generateImportanceReason(factors) {
  const reasons = [];
  
  if (factors.positionWeight >= 12) {
    reasons.push('Introduction or conclusion section');
  }
  
  if (factors.semanticScore >= 10) {
    reasons.push('Contains high-impact keywords');
  }
  
  if (factors.structuralScore >= 8) {
    reasons.push('Has structural emphasis indicators');
  }
  
  if (factors.qualityScore >= 10) {
    reasons.push('Contains technical or research content');
  }
  
  if (factors.contentDensity >= 15) {
    reasons.push('High content density');
  }
  
  return reasons.length > 0 ? reasons.join('. ') + '.' : 'Standard content section.';
}

// Mock function for paragraph summarization
async function getParagraphSummariesMock(text, userField = '', userExperience = '') {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Split text into rough paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 50)
    .slice(0, 8);
  
  const fieldNote = userField ? ` in ${userField}` : '';
  
  return paragraphs.map((paragraph, index) => {
    const importanceAnalysis = analyzeChunkImportance(paragraph, index, paragraphs.length);
    
    // Generate structural summary based on position
    let structuralSummary;
    if (index === 0) {
      structuralSummary = `This opening section introduces the main topic and sets the context for the discussion.`;
    } else if (index === paragraphs.length - 1) {
      structuralSummary = `This concluding section summarizes key points and provides final insights.`;
    } else if (index === 1) {
      structuralSummary = `This section builds upon the introduction by developing the main arguments.`;
    } else if (index === paragraphs.length - 2) {
      structuralSummary = `This section prepares for the conclusion by synthesizing the main points.`;
    } else {
      structuralSummary = `This middle section provides supporting evidence and detailed analysis for the main topic.`;
    }
    
    return {
    paragraphNumber: index + 1,
      summary: structuralSummary,
      importanceScore: importanceAnalysis.importanceScore,
      relevanceLevel: importanceAnalysis.relevanceLevel,
      importanceReason: importanceAnalysis.importanceReason
    };
  });
}

// Main paragraph summaries function that switches between mock and real
async function getParagraphSummaries(text, userField = '', userExperience = '') {
  if (dataProvider === 'real') {
    return await getParagraphSummariesWithAPI(text, userField, userExperience);
  } else {
    return await getParagraphSummariesMock(text, userField, userExperience);
  }
}

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'explainWithHatrick',
    title: 'Explain with Hatrick',
    contexts: ['selection']
  });
  
  // Load field detection cache on startup
  loadFieldDetectionCache();
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'explainWithHatrick' && info.selectionText) {
    // Check if we're using inline explanation
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.hatrickUsingInlineExplanation || false
      });
      
      if (result && result.result) {
        console.log('🚩 Inline explanation is active, not opening panel');
        return;
      }
    } catch (error) {
      console.log('Could not check inline explanation flag:', error);
    }
    
    // Save selected text to storage
    await chrome.storage.local.set({
      lastSelection: info.selectionText
    });
    
    // Open side panel
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case 'GET_SUMMARY':
        const bullets = await getSummary(message.text || '');
        sendResponse({ ok: true, bullets });
        break;
        
      case 'GET_EXPLANATION':
        console.log('🤖 Background: GET_EXPLANATION received', {
          term: message.term,
          inline: message.inline,
          userExperience: message.userExperience
        });
        
        const explanation = await explainTerm(
          message.term || '', 
          message.pageContext || '', 
          message.userField || '', 
          message.userExperience || ''
        );
        
        console.log('🤖 Background: Explanation generated', {
          beginner: explanation.beginner?.substring(0, 100) + '...',
          advanced: explanation.advanced?.substring(0, 100) + '...'
        });
        
        // Only update storage if this is NOT an inline request
        if (!message.inline) {
          await chrome.storage.local.set({
            lastSelection: message.term || ''
          });
        }
        
        const response = { 
          ok: true, 
          beginner: explanation.beginner, 
          advanced: explanation.advanced 
        };
        
        console.log('🤖 Background: Sending response', response);
        sendResponse(response);
        break;
        
      case 'GET_CORE_KEYWORDS':
        const keywords = await getCoreKeywords(
          message.text || '', 
          message.userField || '', 
          message.userExperience || ''
        );
        sendResponse({ ok: true, keywords });
        break;
        
      case 'OPEN_SIDE_PANEL':
        console.log('🚀 Background: Opening side panel...');
        console.log('🚀 Background: Message received:', message);
        
        // Since we can't open side panel from background script without user gesture,
        // we'll use the action API to trigger the side panel
        try {
          // Set the action to open the side panel
          await chrome.action.setPopup({ popup: '' });
          
          // Get the current active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('🚀 Background: Current tab:', tab ? tab.id : 'no tab found');
          
          if (tab) {
            // Try to open the side panel
            console.log('🚀 Background: Attempting to open side panel for tab:', tab.id);
            await chrome.sidePanel.open({ tabId: tab.id });
            console.log('✅ Background: Side panel opened successfully');
            sendResponse({ ok: true, tabId: tab.id });
          } else {
            console.error('❌ Background: No active tab found');
            sendResponse({ ok: false, error: 'No active tab found' });
          }
        } catch (error) {
          console.error('❌ Background: Failed to open side panel:', error);
          console.log('🔄 Background: Trying alternative approach...');
          
          // Alternative: Use chrome.action to trigger side panel
          try {
            await chrome.action.openPopup();
            console.log('✅ Background: Side panel opened via action API');
            sendResponse({ ok: true, method: 'action' });
          } catch (actionError) {
            console.error('❌ Background: Action API also failed:', actionError);
            sendResponse({ ok: false, error: error.message, actionError: actionError.message });
          }
        }
        break;
        
      case 'DETECT_FIELD':
        console.log('🎯 Background: Field detection request received');
        try {
          const { pageContent, url } = message;
          
          // Check cache first
          const cachedResult = getCachedFieldDetection(url);
          if (cachedResult) {
            console.log('🎯 Background: Returning cached field detection:', cachedResult);
            sendResponse({ ok: true, ...cachedResult, cached: true });
            break;
          }
          
          // Detect field using AI
          const detectionResult = await detectFieldFromContent(pageContent, url);
          
          // Cache the result
          cacheFieldDetection(url, detectionResult);
          
          console.log('🎯 Background: Field detection completed:', detectionResult);
          sendResponse({ ok: true, ...detectionResult, cached: false });
        } catch (error) {
          console.error('❌ Background: Field detection error:', error);
          sendResponse({ ok: false, error: error.message });
        }
        break;
        
      case 'GET_PARAGRAPH_SUMMARIES':
        const summaries = await getParagraphSummaries(
          message.text || '', 
          message.userField || '', 
          message.userExperience || ''
        );
        sendResponse({ ok: true, summaries });
        break;
        
      case 'PULL_PAGE_TEXT':
        // Get page text from content script
        const result = await chrome.storage.local.get(['pageText', 'currentUrl']);
        sendResponse({ 
          pageText: result.pageText || '', 
          url: result.currentUrl || '' 
        });
        break;
        
      case 'ASK_HATRICK':
        try {
          const { question, pageContent, userField, userExperience } = message;
          
          if (dataProvider === 'real') {
            const response = await askHatrickWithAPI(question, pageContent, userField, userExperience);
            sendResponse({ ok: true, response: response });
          } else {
            // Fallback to mock response
            const mockResponse = await getPlaceholderResponse(question);
            sendResponse({ ok: true, response: mockResponse });
          }
        } catch (error) {
          console.error('Error in ASK_HATRICK:', error);
          sendResponse({ 
            ok: false, 
            error: error.message 
          });
        }
        break;
        
      case 'GET_API_STATUS':
        try {
          const promptAvailability = await LanguageModel.availability();
          const summarizerAvailability = await Summarizer.availability();
          sendResponse({ 
            ok: true, 
            promptAvailability: promptAvailability,
            summarizerAvailability: summarizerAvailability,
            dataProvider: dataProvider,
            hasPromptSession: !!languageModelSession,
            hasSummarizer: !!summarizer
          });
        } catch (error) {
          sendResponse({ 
            ok: false, 
            error: error.message,
            dataProvider: dataProvider
          });
        }
        break;
        
      case 'TRIGGER_MODEL_DOWNLOAD':
        try {
          // Check if models are already available
          const promptAvailability = await LanguageModel.availability();
          const summarizerAvailability = await Summarizer.availability();
          
          // If models are downloading, return downloading status
          if (promptAvailability === 'downloading' || summarizerAvailability === 'downloading') {
            sendResponse({ ok: true, downloading: true });
            return;
          }
          
          // If models are downloadable, trigger download
          if (promptAvailability === 'downloadable' || summarizerAvailability === 'downloadable') {
            // Try to initialize both APIs (this triggers downloads)
            const summarizerInit = summarizer ? true : await initializeSummarizer();
            const promptInit = languageModelSession ? true : await initializeLanguageModel();
            
            sendResponse({ ok: true, downloading: true });
            return;
          }
          
          // Models are available, no download needed
          sendResponse({ ok: true, downloading: false });
        } catch (error) {
          console.log('Model download triggered, may take time...', error);
          sendResponse({ ok: true, downloading: true });
        }
        break;
        
      case 'showTermExplanation':
        console.log('📚 Background: Show term explanation request received', message.term);
        try {
          // Get the current active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          console.log('📚 Background: Current tab found:', tab ? tab.id : 'no tab');
          if (tab) {
            // Send message to panel to show term explanation
            console.log('📚 Background: Sending message to panel:', { action: 'displayTermExplanation', term: message.term });
            chrome.runtime.sendMessage({
              action: 'displayTermExplanation',
              term: message.term
            });
            sendResponse({ ok: true });
          } else {
            console.error('❌ Background: No active tab found');
            sendResponse({ ok: false, error: 'No active tab found' });
          }
        } catch (error) {
          console.error('❌ Background: Failed to show term explanation:', error);
          sendResponse({ ok: false, error: error.message });
        }
        break;
        
      case 'addToNotes':
        console.log('📝 Background: Add to notes request received', message.text);
        try {
          // Send message directly to panel to add text to notes
          chrome.runtime.sendMessage({
            type: 'addToNotes',
            text: message.text
          });
          sendResponse({ ok: true });
        } catch (error) {
          console.error('❌ Background: Failed to add to notes:', error);
          sendResponse({ ok: false, error: error.message });
        }
        break;
        
      default:
        sendResponse({ ok: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ ok: false, error: error.message });
  }
}

// Handle side panel action click
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});