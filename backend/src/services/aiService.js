/**
 * AI Service for generating journal reflections and detecting habits
 * Uses Hugging Face Inference API for text generation and local processing for emotion detection.
 */

const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const USE_HUGGINGFACE = process.env.USE_HUGGINGFACE === 'true';

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
 * Detect the primary emotion in a journal entry
 * @param {string} content - The journal entry content
 * @returns {string} - The detected emotion
 */
function detectEmotion(content) {
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
 * Generate a summary of the journal entry using Hugging Face
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - A brief summary
 */
async function generateSummary(content) {
  // If Hugging Face is not enabled or no API key, fallback to local generation
  if (!USE_HUGGINGFACE || !process.env.HUGGINGFACE_API_KEY) {
    console.log('[AI] Summarization: Using local fallback (HF disabled or no API key)');
    return generateSummaryLocal(content);
  }

  try {
    console.log('[AI] Summarization: Starting with BART model');
    console.log(`[AI] Content length: ${content.length} characters`);
    
    // Use the summarization task instead of text generation for better results
    const response = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: content,
      parameters: {
        max_length: 50,
        min_length: 20
      }
    });

    console.log('[AI] Summarization response:', JSON.stringify(response, null, 2));
    
    let summary = response[0]?.summary_text || '';
    
    console.log(`[AI] Generated summary: "${summary}"`);
    
    // If empty or too short, fall back to local
    if (!summary || summary.length < 10) {
      console.log('[AI] Summary too short, using local generation');
      return generateSummaryLocal(content);
    }
    
    return summary;
  } catch (error) {
    console.error('[AI] Hugging Face API error for summary:', error);
    console.error('[AI] Error details:', error.message);
    console.error('[AI] Full error:', JSON.stringify(error, null, 2));
    return generateSummaryLocal(content);
  }
}

/**
 * Fallback local summary generation
 * @param {string} content - The journal entry content
 * @returns {string} - A brief summary
 */
function generateSummaryLocal(content) {
  // Extract key sentences (simplified approach)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) {
    return "A brief moment of reflection was captured today.";
  }
  
  if (sentences.length === 1) {
    return sentences[0].trim() + ".";
  }
  
  // Get the first sentence or two for a basic summary
  const summaryParts = sentences.slice(0, Math.min(2, sentences.length));
  return summaryParts.map(s => s.trim()).join('. ') + '.';
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
  const emotion = detectEmotion(content);
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
 * Generate an affirmation using Hugging Face or fallback to local
 * @param {string} emotion - The detected emotion
 * @returns {Promise<string>} - An affirmation
 */
async function generateAffirmation(emotion) {
  if (!USE_HUGGINGFACE || !process.env.HUGGINGFACE_API_KEY) {
    return getAffirmationLocal(emotion);
  }

  try {
    const emotionDescription = {
      happy: 'joyful and positive',
      sad: 'sad and melancholic',
      anxious: 'anxious and worried',
      angry: 'frustrated and angry',
      calm: 'calm and peaceful',
      motivated: 'motivated and inspired',
      tired: 'tired and exhausted',
      neutral: 'neutral'
    }[emotion] || 'neutral';

    const prompt = `Write a short, encouraging affirmation (1 sentence, max 20 words) for someone feeling ${emotionDescription}. Only provide the affirmation, nothing else:\n\nAffirmation:`;
    
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.1',
      inputs: prompt,
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
        do_sample: false
      }
    });

    // Extract only the generated text (not the prompt)
    const fullText = response.generated_text;
    const affirmationStart = fullText.indexOf('Affirmation:') + 'Affirmation:'.length;
    let affirmation = fullText.substring(affirmationStart).trim();
    
    // Clean up any extra content
    affirmation = affirmation.split('\n')[0].trim();
    
    // If empty or too short, fall back to local
    if (!affirmation || affirmation.length < 5) {
      return getAffirmationLocal(emotion);
    }
    
    return affirmation;
  } catch (error) {
    console.error('Hugging Face API error for affirmation:', error.message);
    return getAffirmationLocal(emotion);
  }
}

module.exports = {
  generateReflection,
  detectEmotion,
  generateSummary,
  generateAffirmation,
  getAffirmationLocal,
  detectCompletedHabits
};
