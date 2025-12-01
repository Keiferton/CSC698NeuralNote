const { detectEmotion, generateSummary, getAffirmation, detectCompletedHabits, generateReflection } = require('../services/aiService');

describe('AI Service', () => {
  describe('detectEmotion', () => {
    it('should detect happy emotion', () => {
      const content = 'Today was a wonderful day! I feel so grateful and happy.';
      const emotion = detectEmotion(content);
      expect(emotion).toBe('happy');
    });

    it('should detect sad emotion', () => {
      const content = 'I feel so sad and disappointed today. Everything went wrong.';
      const emotion = detectEmotion(content);
      expect(emotion).toBe('sad');
    });

    it('should detect anxious emotion', () => {
      const content = 'I am feeling very anxious and worried about tomorrow.';
      const emotion = detectEmotion(content);
      expect(emotion).toBe('anxious');
    });

    it('should detect calm emotion', () => {
      const content = 'I feel so calm and peaceful after meditation.';
      const emotion = detectEmotion(content);
      expect(emotion).toBe('calm');
    });

    it('should return neutral for unrecognized content', () => {
      const content = 'I went to the store and bought some groceries.';
      const emotion = detectEmotion(content);
      expect(emotion).toBe('neutral');
    });
  });

  describe('generateSummary', () => {
    it('should generate a summary from content', () => {
      const content = 'Today I went to the gym and worked out for an hour. Then I came home and made a healthy dinner.';
      const summary = generateSummary(content);
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
    });

    it('should handle short content', () => {
      const content = 'Good day.';
      const summary = generateSummary(content);
      expect(summary).toBeTruthy();
    });

    it('should handle empty content gracefully', () => {
      const content = '';
      const summary = generateSummary(content);
      expect(summary).toBeTruthy();
    });
  });

  describe('getAffirmation', () => {
    it('should return an affirmation for happy emotion', () => {
      const affirmation = getAffirmation('happy');
      expect(affirmation).toBeTruthy();
      expect(typeof affirmation).toBe('string');
    });

    it('should return an affirmation for sad emotion', () => {
      const affirmation = getAffirmation('sad');
      expect(affirmation).toBeTruthy();
    });

    it('should return an affirmation for unknown emotion', () => {
      const affirmation = getAffirmation('unknown');
      expect(affirmation).toBeTruthy();
    });
  });

  describe('detectCompletedHabits', () => {
    const userHabits = [
      { id: '1', name: 'Exercise' },
      { id: '2', name: 'Read a book' },
      { id: '3', name: 'Meditation' },
      { id: '4', name: 'Drink water' }
    ];

    it('should detect mentioned habits', () => {
      const content = 'Today I did my exercise routine in the morning and then practiced meditation for 20 minutes.';
      const detected = detectCompletedHabits(content, userHabits);
      expect(detected).toContain('1'); // Exercise
      expect(detected).toContain('3'); // Meditation
    });

    it('should detect partial habit name matches', () => {
      const content = 'I read for an hour today. It was great!';
      const detected = detectCompletedHabits(content, userHabits);
      expect(detected).toContain('2'); // Read a book
    });

    it('should return empty array when no habits mentioned', () => {
      const content = 'Just a regular day at work.';
      const detected = detectCompletedHabits(content, userHabits);
      expect(detected).toHaveLength(0);
    });
  });

  describe('generateReflection', () => {
    it('should generate a complete reflection', () => {
      const content = 'I had a wonderful day! I exercised in the morning and felt so happy and grateful.';
      const habits = [{ id: '1', name: 'Exercise' }];
      
      const reflection = generateReflection(content, habits);
      
      expect(reflection).toHaveProperty('summary');
      expect(reflection).toHaveProperty('emotion');
      expect(reflection).toHaveProperty('affirmation');
      expect(reflection).toHaveProperty('detectedHabits');
      expect(reflection.emotion).toBe('happy');
      expect(reflection.detectedHabits).toContain('1');
    });
  });
});
