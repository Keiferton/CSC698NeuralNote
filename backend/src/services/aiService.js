/**
 * AI Service for generating journal reflections and detecting habits
 * Uses Groq API for fast text generation, emotion detection, and summarization.
 * Emotion detection can identify any emotion word (not limited to predefined list).
 * Falls back to local keyword-based processing when AI is unavailable.
 */

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const AI_PROVIDER = process.env.AI_PROVIDER || 'local';

// Common emotion keywords for detection
const emotionKeywords = {
  happy: ['happy', 'joy', 'excited', 'grateful', 'thankful', 'wonderful', 'amazing', 'great', 'blessed', 'delighted', 'cheerful', 'content'],
  sad: ['sad', 'down', 'depressed', 'unhappy', 'disappointed', 'lonely', 'melancholy', 'gloomy', 'heartbroken'],
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'tense', 'uneasy', 'afraid', 'fearful'],
  angry: ['angry', 'frustrated', 'annoyed', 'irritated', 'mad', 'furious', 'upset'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'at ease', 'mindful'],
  motivated: ['motivated', 'inspired', 'determined', 'focused', 'energized', 'productive', 'ambitious'],
  tired: ['tired', 'exhausted', 'drained', 'fatigued', 'worn out', 'sleepy']
};

// Affirmations for different emotional states
const affirmations = {
  happy: [
    "Your positive energy is contagious. Keep embracing the joy in each moment!",
    "What a wonderful outlook! Continue nurturing this happiness.",
    "Your gratitude opens doors to even more blessings."
  ],
  sad: [
    "It's okay to feel this way. Every storm eventually passes, and brighter days are ahead.",
    "Be gentle with yourself. Your feelings are valid, and healing takes time.",
    "Remember, you are stronger than you know. This too shall pass."
  ],
  anxious: [
    "Take a deep breath. You've overcome challenges before, and you can do it again.",
    "One step at a time. Focus on what you can control in this moment.",
    "Your worries don't define you. You have the strength to navigate through this."
  ],
  angry: [
    "It's healthy to acknowledge your frustrations. Channel this energy into positive action.",
    "Your feelings are valid. Take time to process and find constructive outlets.",
    "Breathe through it. You have the wisdom to respond thoughtfully."
  ],
  calm: [
    "Your inner peace is a gift. Continue to cultivate this tranquility.",
    "In stillness, we find clarity. Your centered mindset serves you well.",
    "This balance you've found is precious. Protect and nurture it."
  ],
  motivated: [
    "Your drive is inspiring! Keep channeling this energy toward your goals.",
    "You're on the right track. Trust your journey and keep moving forward.",
    "This momentum will take you far. Believe in your capabilities!"
  ],
  tired: [
    "Rest is not laziness—it's essential. Honor your body's need for recovery.",
    "You've been working hard. Give yourself permission to recharge.",
    "Tomorrow is a new day. Take the rest you deserve tonight."
  ],
  neutral: [
    "Every day is a new opportunity for growth and discovery.",
    "You're doing better than you think. Keep going!",
    "Trust the process. Good things are coming your way."
  ]
};

/**
 * Detect the primary emotion in a journal entry using AI (Groq)
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - The detected emotion (can be any emotion word)
 */
async function detectEmotionAI(content) {
  if (AI_PROVIDER !== 'groq' || !process.env.GROQ_API_KEY) {
    console.log('[AI] Emotion detection: Using local fallback (Groq disabled or no API key)');
    return detectEmotionLocal(content);
  }

  try {
    console.log('[AI] Emotion detection: Using Groq API');
    
    // For very short content, use local detection
    if (content.length < 10) {
      console.log('[AI] Content too short for AI emotion detection, using local');
      return detectEmotionLocal(content);
    }
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an emotion detection assistant. Analyze journal entries and identify the primary emotion the writer is experiencing. Respond with ONLY a single emotion word (e.g., happy, sad, anxious, excited, grateful, frustrated, peaceful, energetic, exhausted, hopeful, etc.). Use the most accurate emotion word that best describes the emotional state. Do not include any explanation, punctuation, or additional text - just the emotion word."
        },
        {
          role: "user",
          content: `Analyze this journal entry and identify the primary emotion. Respond with ONLY a single emotion word that best describes how the writer is feeling.\n\nJournal entry: "${content}"\n\nEmotion:`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 15,
      top_p: 0.9
    });

    let emotion = completion.choices[0]?.message?.content || '';
    
    // Clean up the response
    emotion = emotion.trim().toLowerCase();
    
    // Remove any extra text, quotes, or punctuation
    emotion = emotion.replace(/^["']|["']$/g, '').trim();
    // Extract just the first word (in case AI adds extra words)
    emotion = emotion.split(/[\s,.\n;:!?]/)[0].toLowerCase();
    
    // Remove any trailing punctuation
    emotion = emotion.replace(/[.,;:!?]+$/, '');
    
    console.log('[AI] Groq emotion response:', emotion);
    
    // Validate that we got a reasonable emotion word (at least 2 characters, no special chars)
    if (emotion && emotion.length >= 2 && /^[a-z]+$/.test(emotion)) {
      console.log(`[AI] Detected emotion: ${emotion}`);
      return emotion;
    } else {
      console.log(`[AI] Invalid emotion response "${emotion}", falling back to local detection`);
      return detectEmotionLocal(content);
    }
  } catch (error) {
    console.error('[AI] Groq API error for emotion detection:', error.message);
    return detectEmotionLocal(content);
  }
}

/**
 * Detect the primary emotion in a journal entry using keyword matching (local fallback)
 * @param {string} content - The journal entry content
 * @returns {string} - The detected emotion
 */
function detectEmotionLocal(content) {
  const lowerContent = content.toLowerCase();
  const emotionScores = {};
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    emotionScores[emotion] = 0;
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        emotionScores[emotion]++;
      }
    }
  }
  
  // Find the emotion with the highest score
  let maxScore = 0;
  let detectedEmotion = 'neutral';
  
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }
  
  return detectedEmotion;
}

/**
 * Detect the primary emotion in a journal entry (uses AI if available, falls back to local)
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - The detected emotion
 */
async function detectEmotion(content) {
  return await detectEmotionAI(content);
}

/**
 * Generate a summary of the journal entry using Hugging Face
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - A brief summary
 */
async function generateSummary(content) {
  // If Groq is not enabled or no API key, fallback to local generation
  if (AI_PROVIDER !== 'groq' || !process.env.GROQ_API_KEY) {
    console.log('[AI] Summarization: Using local fallback (Groq disabled or no API key)');
    return generateSummaryLocal(content);
  }

  try {
    console.log('[AI] Summarization: Using Groq API');
    console.log(`[AI] Content length: ${content.length} characters`);

    // For very short content, use local generation
    if (content.length < 30) {
      console.log('[AI] Content too short, using local generation');
      return generateSummaryLocal(content);
    }

    // Use Groq with Llama 3.1 for fast, high-quality summaries
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a journal analysis assistant. Create accurate, objective summaries of journal entries that capture all key activities, events, and emotional states. Write a concise paragraph that doesn't miss important details."
        },
        {
          role: "user",
          content: `Read this journal entry and create an accurate, objective summary that captures all the key activities, events, and emotional state. Focus on what happened and how the person felt.\n\nJournal entry: "${content}"\n\nObjective summary (short paragraph):`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 150,
      top_p: 0.9
    });

    let summary = completion.choices[0]?.message?.content || '';

    console.log('[AI] Groq response:', summary);

    // Clean up the summary - minimal processing to preserve accuracy
    summary = summary.trim();

    // Remove common prefixes
    summary = summary.replace(/^(Summary:|Objective summary:|Here's a summary:|Key activities:|Activities:)\s*/i, '').trim();

    // Remove surrounding quotes if present
    summary = summary.replace(/^["']|["']$/g, '').trim();

    // Clean up any extra newlines (convert to spaces)
    summary = summary.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

    console.log(`[AI] Generated summary: "${summary}"`);

    // Check if the summary is just repeating the input
    const summaryLower = summary.toLowerCase().trim();
    const contentLower = content.toLowerCase().trim();

    if (summaryLower === contentLower || contentLower.startsWith(summaryLower) || summaryLower.length < 10) {
      console.log('[AI] Summary invalid or repeating input, using local generation');
      return generateSummaryLocal(content);
    }

    return summary;
  } catch (error) {
    console.error('[AI] Groq API error for summary:', error);
    console.error('[AI] Error details:', error.message);
    return generateSummaryLocal(content);
  }
}

/**
 * Fallback local summary generation
 * @param {string} content - The journal entry content
 * @returns {string} - A brief summary
 */
async function generateSummaryLocal(content) {
  console.log('[AI] Using local summary generation');

  const lowerContent = content.toLowerCase();

  // Extract emotion and theme
  const emotion = await detectEmotion(content);
  const theme = await detectMainTheme(content);

  // Extract activities and events
  const activities = extractActivities(content);

  // Build an objective summary
  let summary = '';

  // Start with emotional state if detected
  if (emotion !== 'neutral') {
    summary = `Experienced a ${emotion} day. `;
  }

  // Add activities if found
  if (activities.length > 0) {
    if (activities.length === 1) {
      summary += activities[0];
    } else if (activities.length === 2) {
      summary += `${activities[0]} and ${activities[1]}`;
    } else {
      // List first 2-3 notable activities
      const topActivities = activities.slice(0, 2);
      summary += topActivities.join(', ');
      if (activities.length > 2) {
        summary += `, and more`;
      }
    }
    summary += '.';
  } else {
    // If no activities found, provide a theme-based summary
    summary += `Reflected on ${theme}.`;
  }

  return summary.trim();
}

/**
 * Extract activities and notable events from journal content
 * @param {string} content - The journal entry content
 * @returns {Array<string>} - List of extracted activities
 */
function extractActivities(content) {
  const activities = [];
  const lowerContent = content.toLowerCase();

  // Action verb patterns to look for
  const actionPatterns = [
    // Past tense verbs indicating completed actions
    { pattern: /\b(went to|visited|attended)\s+([^.!?,]+)/gi, prefix: 'went to' },
    { pattern: /\b(met with|saw|talked to|spoke with)\s+([^.!?,]+)/gi, prefix: 'met with' },
    { pattern: /\b(worked on|completed|finished|did)\s+([^.!?,]+)/gi, prefix: 'worked on' },
    { pattern: /\b(exercised|ran|walked|jogged|swam|practiced)\s*([^.!?,]*)/gi, prefix: 'exercised' },
    { pattern: /\b(ate|had|cooked|made)\s+(breakfast|lunch|dinner|meal|food|[^.!?,]+)/gi, prefix: 'ate' },
    { pattern: /\b(read|watched|listened to|played)\s+([^.!?,]+)/gi, prefix: 'engaged in' },
    { pattern: /\b(studied|learned|practiced)\s+([^.!?,]+)/gi, prefix: 'studied' },
    { pattern: /\b(cleaned|organized|tidied)\s+([^.!?,]+)/gi, prefix: 'cleaned' },
    { pattern: /\b(felt|was|became)\s+(stressed|overwhelmed|anxious|happy|sad|tired|energized|motivated)/gi, prefix: 'felt' }
  ];

  // Extract matches
  for (const { pattern, prefix } of actionPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const activity = match[0].trim();
      // Clean up and limit length
      let cleaned = activity.substring(0, 60).trim();
      if (activity.length > 60) cleaned += '...';
      activities.push(cleaned);
      if (activities.length >= 4) break; // Limit to 4 activities
    }
    if (activities.length >= 4) break;
  }

  // If no activities found with patterns, try to extract key sentences with action verbs
  if (activities.length === 0) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      // Check for common action words
      const hasAction = /\b(went|did|had|was|got|made|took|felt|saw|met|worked|completed|finished|started)\b/.test(sentenceLower);
      if (hasAction) {
        let cleaned = sentence.trim();
        if (cleaned.length > 70) {
          cleaned = cleaned.substring(0, 67) + '...';
        }
        activities.push(cleaned);
        if (activities.length >= 2) break; // Limit to 2 sentences
      }
    }
  }

  return activities;
}

/**
 * Detect the main theme of the journal entry
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - A brief theme description
 */
async function detectMainTheme(content) {
  const lowerContent = content.toLowerCase();

  // Common themes
  if (lowerContent.includes('work') || lowerContent.includes('job') || lowerContent.includes('meeting')) {
    return 'work and career';
  }
  if (lowerContent.includes('family') || lowerContent.includes('parent') || lowerContent.includes('child')) {
    return 'family life';
  }
  if (lowerContent.includes('friend') || lowerContent.includes('social')) {
    return 'relationships and social connections';
  }
  if (lowerContent.includes('health') || lowerContent.includes('exercise') || lowerContent.includes('workout')) {
    return 'health and wellness';
  }
  if (lowerContent.includes('goal') || lowerContent.includes('plan') || lowerContent.includes('future')) {
    return 'personal goals and aspirations';
  }

  // Fallback to detected emotion
  const emotion = await detectEmotion(content);
  return `${emotion} moments`;
}

/**
 * Get a random affirmation based on the detected emotion (local fallback)
 * @param {string} emotion - The detected emotion
 * @returns {string} - An affirmation
 */
function getAffirmationLocal(emotion) {
  const emotionAffirmations = affirmations[emotion] || affirmations.neutral;
  const randomIndex = Math.floor(Math.random() * emotionAffirmations.length);
  return emotionAffirmations[randomIndex];
}

// Common completion indicators (defined outside function for performance)
const completionPhrases = [
  'did my', 'completed my', 'finished my', 'went to', 'went for',
  'practiced', 'worked on', 'did some', 'went', 'ate', 'drank',
  'read', 'wrote', 'exercised', 'ran', 'walked', 'meditated',
  'studied', 'learned', 'cooked', 'cleaned', 'organized'
];

/**
 * Detect which habits are mentioned as completed in the journal entry
 * @param {string} content - The journal entry content
 * @param {Array} userHabits - Array of user's habits
 * @returns {Array} - Array of habit IDs that were detected as completed
 */
function detectCompletedHabits(content, userHabits) {
  const lowerContent = content.toLowerCase();
  const completedHabits = [];
  
  for (const habit of userHabits) {
    const habitNameLower = habit.name.toLowerCase();
    const habitWords = habitNameLower.split(' ');
    
    // Check if habit name or its key words are mentioned
    let habitMentioned = lowerContent.includes(habitNameLower);
    
    if (!habitMentioned) {
      // Check for individual words in habit name
      habitMentioned = habitWords.some(word => 
        word.length > 3 && lowerContent.includes(word)
      );
    }
    
    if (habitMentioned) {
      // Check for completion context
      const hasCompletionContext = completionPhrases.some(phrase => 
        lowerContent.includes(phrase)
      );
      
      // If the habit is mentioned with completion context, mark as completed
      if (hasCompletionContext || habitMentioned) {
        completedHabits.push(habit.id);
      }
    }
  }
  
  return completedHabits;
}

/**
 * Generate a full AI reflection for a journal entry
 * @param {string} content - The journal entry content
 * @param {Array} userHabits - Array of user's habits
 * @returns {Promise<Object>} - Object containing summary, emotion, affirmation, and detectedHabits
 */
async function generateReflection(content, userHabits = []) {
  const emotion = await detectEmotion(content);
  const summary = await generateSummary(content);
  const affirmation = await generateAffirmation(emotion);
  const detectedHabits = detectCompletedHabits(content, userHabits);
  
  return {
    summary,
    emotion,
    affirmation,
    detectedHabits
  };
}

/**
 * Generate an affirmation using Groq or fallback to local
 * @param {string} emotion - The detected emotion (can be any emotion word)
 * @returns {Promise<string>} - An affirmation
 */
async function generateAffirmation(emotion) {
  if (AI_PROVIDER !== 'groq' || !process.env.GROQ_API_KEY) {
    return getAffirmationLocal(emotion);
  }

  try {
    // Map known emotions to descriptions, or use the emotion word directly for unknown emotions
    const emotionDescription = {
      happy: 'joyful and positive',
      sad: 'sad and melancholic',
      anxious: 'anxious and worried',
      angry: 'frustrated and angry',
      calm: 'calm and peaceful',
      motivated: 'motivated and inspired',
      tired: 'tired and exhausted',
      neutral: 'neutral'
    }[emotion] || emotion; // Use the emotion word directly if it's not in our mapping

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a supportive journal companion. Generate short, encouraging affirmations that are appropriate for the emotional state described."
        },
        {
          role: "user",
          content: `Write a short, encouraging affirmation (1 sentence, max 20 words) for someone feeling ${emotionDescription}. Make it supportive and appropriate for this emotional state. Only provide the affirmation, nothing else.`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 50
    });

    let affirmation = completion.choices[0]?.message?.content || '';

    // Clean up any extra content
    affirmation = affirmation.split('\n')[0].trim();
    affirmation = affirmation.replace(/^["']|["']$/g, '').trim();

    // If empty or too short, fall back to local
    if (!affirmation || affirmation.length < 5) {
      return getAffirmationLocal(emotion);
    }

    return affirmation;
  } catch (error) {
    console.error('Groq API error for affirmation:', error.message);
    return getAffirmationLocal(emotion);
  }
}

module.exports = {
  generateReflection,
  detectEmotion,
  detectEmotionLocal,
  generateSummary,
  generateAffirmation,
  getAffirmationLocal,
  detectCompletedHabits
};
