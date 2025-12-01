/**
 * AI Service for generating journal reflections and detecting habits
 * This is a mock implementation that simulates AI responses.
 * In production, this would connect to an actual AI API (e.g., OpenAI, Anthropic).
 */

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
 * Generate a summary of the journal entry
 * @param {string} content - The journal entry content
 * @returns {string} - A brief summary
 */
function generateSummary(content) {
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
 * Get a random affirmation based on the detected emotion
 * @param {string} emotion - The detected emotion
 * @returns {string} - An affirmation
 */
function getAffirmation(emotion) {
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
 * @returns {Object} - Object containing summary, emotion, affirmation, and detectedHabits
 */
function generateReflection(content, userHabits = []) {
  const emotion = detectEmotion(content);
  const summary = generateSummary(content);
  const affirmation = getAffirmation(emotion);
  const detectedHabits = detectCompletedHabits(content, userHabits);
  
  return {
    summary,
    emotion,
    affirmation,
    detectedHabits
  };
}

module.exports = {
  generateReflection,
  detectEmotion,
  generateSummary,
  getAffirmation,
  detectCompletedHabits
};
