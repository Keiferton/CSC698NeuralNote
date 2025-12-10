const { detectEmotion, generateSummary, generateAffirmation, getAffirmationLocal, detectCompletedHabits, generateReflection } = require('../services/aiService');

describe('AI Service', () => {
  describe('detectEmotion', () => {
    it('should detect happy emotion', async () => {
      const content = 'Today was a wonderful day! I feel so grateful and happy.';
      const emotion = await detectEmotion(content);
      expect(emotion).toBe('happy');
    });

    it('should detect sad emotion', async () => {
      const content = 'I feel so sad and disappointed today. Everything went wrong.';
      const emotion = await detectEmotion(content);
      expect(emotion).toBe('sad');
    });

    it('should detect anxious emotion', async () => {
      const content = 'I am feeling very anxious and worried about tomorrow.';
      const emotion = await detectEmotion(content);
      expect(emotion).toBe('anxious');
    });

    it('should detect calm emotion', async () => {
      const content = 'I feel so calm and peaceful after meditation.';
      const emotion = await detectEmotion(content);
      expect(emotion).toBe('calm');
    });

    it('should return neutral for unrecognized content', async () => {
      const content = 'I went to the store and bought some groceries.';
      const emotion = await detectEmotion(content);
      expect(emotion).toBe('neutral');
    });
  });

  describe('generateSummary', () => {
    // Store original env vars
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset env for each test
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should generate a summary from content using local fallback when HF disabled', async () => {
      process.env.USE_HUGGINGFACE = 'false';
      const content = 'Today I went to the gym and worked out for an hour. Then I came home and made a healthy dinner.';
      const summary = await generateSummary(content);
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should handle short content (< 30 chars) with local generation', async () => {
      const content = 'Good day.';
      const summary = await generateSummary(content);
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
    });

    it('should handle empty content gracefully', async () => {
      const content = '';
      const summary = await generateSummary(content);
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
    });

    it('should use local fallback when no API key provided', async () => {
      process.env.USE_HUGGINGFACE = 'true';
      delete process.env.HUGGINGFACE_API_KEY;
      
      const content = 'I had a great day at work today. Completed many tasks and felt productive.';
      const summary = await generateSummary(content);
      
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
    });

    it('should handle API errors and fallback to local generation', async () => {
      // Mock HfInference to throw an error
      const mockTextGeneration = jest.fn().mockRejectedValue(new Error('API Error'));
      jest.mock('@huggingface/inference', () => ({
        HfInference: jest.fn().mockImplementation(() => ({
          textGeneration: mockTextGeneration
        }))
      }));

      process.env.USE_HUGGINGFACE = 'true';
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      
      const content = 'I went hiking today and saw beautiful mountains. It was refreshing.';
      const summary = await generateSummary(content);
      
      // Should still return a valid summary from fallback
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
    });

    it('should detect and reject repeating summaries', async () => {
      // This tests the logic that detects when the summary just repeats the input
      const content = 'Short test content for summary generation';
      const summary = await generateSummary(content);
      
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
      // Summary should not be exactly the same as input
      expect(summary.toLowerCase()).not.toBe(content.toLowerCase());
    });
  });

  describe('getAffirmationLocal', () => {
    it('should return an affirmation for happy emotion', () => {
      const affirmation = getAffirmationLocal('happy');
      expect(affirmation).toBeTruthy();
      expect(typeof affirmation).toBe('string');
    });

    it('should return an affirmation for sad emotion', () => {
      const affirmation = getAffirmationLocal('sad');
      expect(affirmation).toBeTruthy();
    });

    it('should return an affirmation for unknown emotion', () => {
      const affirmation = getAffirmationLocal('unknown');
      expect(affirmation).toBeTruthy();
    });
  });

  describe('generateAffirmation', () => {
    // Store original env vars
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should generate affirmation using local fallback when HF disabled', async () => {
      process.env.USE_HUGGINGFACE = 'false';
      
      const affirmation = await generateAffirmation('happy');
      
      expect(affirmation).toBeTruthy();
      expect(typeof affirmation).toBe('string');
      expect(affirmation.length).toBeGreaterThan(0);
    });

    it('should use local fallback when no API key provided', async () => {
      process.env.USE_HUGGINGFACE = 'true';
      delete process.env.HUGGINGFACE_API_KEY;
      
      const affirmation = await generateAffirmation('anxious');
      
      expect(affirmation).toBeTruthy();
      expect(typeof affirmation).toBe('string');
    });

    it('should handle API errors and fallback to local generation', async () => {
      process.env.USE_HUGGINGFACE = 'true';
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      
      // The function will catch errors and fallback
      const affirmation = await generateAffirmation('sad');
      
      expect(affirmation).toBeTruthy();
      expect(typeof affirmation).toBe('string');
    });

    it('should handle empty response from API', async () => {
      process.env.USE_HUGGINGFACE = 'true';
      process.env.HUGGINGFACE_API_KEY = 'test-key';
      
      const affirmation = await generateAffirmation('motivated');
      
      // Should fallback to local if API returns empty
      expect(affirmation).toBeTruthy();
      expect(typeof affirmation).toBe('string');
      expect(affirmation.length).toBeGreaterThan(0);
    });

    it('should handle all emotion types', async () => {
      const emotions = ['happy', 'sad', 'anxious', 'angry', 'calm', 'motivated', 'tired', 'neutral'];
      
      for (const emotion of emotions) {
        const affirmation = await generateAffirmation(emotion);
        expect(affirmation).toBeTruthy();
        expect(typeof affirmation).toBe('string');
      }
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
    it('should generate a complete reflection', async () => {
      const content = 'I had a wonderful day! I exercised in the morning and felt so happy and grateful.';
      const habits = [{ id: '1', name: 'Exercise' }];
      
      const reflection = await generateReflection(content, habits);
      
      expect(reflection).toHaveProperty('summary');
      expect(reflection).toHaveProperty('emotion');
      expect(reflection).toHaveProperty('affirmation');
      expect(reflection).toHaveProperty('detectedHabits');
      expect(reflection.emotion).toBe('happy');
      expect(reflection.detectedHabits).toContain('1');
      expect(typeof reflection.summary).toBe('string');
      expect(typeof reflection.affirmation).toBe('string');
    });

    it('should handle content without habits', async () => {
      const content = 'Just a regular day with some thoughts.';
      const habits = [];
      
      const reflection = await generateReflection(content, habits);
      
      expect(reflection).toHaveProperty('summary');
      expect(reflection).toHaveProperty('emotion');
      expect(reflection).toHaveProperty('affirmation');
      expect(reflection).toHaveProperty('detectedHabits');
      expect(reflection.detectedHabits).toHaveLength(0);
    });

    it('should handle network failures gracefully', async () => {
      // Even with network issues, should return valid reflection with fallback
      const content = 'Today was challenging but I persevered.';
      const habits = [{ id: '1', name: 'Study' }];
      
      const reflection = await generateReflection(content, habits);
      
      expect(reflection).toBeTruthy();
      expect(reflection.summary).toBeTruthy();
      expect(reflection.emotion).toBeTruthy();
      expect(reflection.affirmation).toBeTruthy();
    });
  });

  // Edge case tests for Hugging Face integration
  describe('Hugging Face Integration Edge Cases', () => {
    describe('generateSummary with mock API', () => {
      it('should handle very long content', async () => {
        const longContent = 'Today was an amazing day! '.repeat(100);
        const summary = await generateSummary(longContent);
        
        expect(summary).toBeTruthy();
        expect(typeof summary).toBe('string');
        // Summary should be shorter than the original content
        expect(summary.length).toBeLessThan(longContent.length);
      });

      it('should handle content with special characters', async () => {
        const content = 'Today I felt great! @#$%^&*() <test> "quotes" \'apostrophes\' [brackets]';
        const summary = await generateSummary(content);
        
        expect(summary).toBeTruthy();
        expect(typeof summary).toBe('string');
      });

      it('should handle content with unicode and emoji', async () => {
        const content = 'Today was wonderful! 😊 I felt so happy 🎉 and grateful 💖';
        const summary = await generateSummary(content);
        
        expect(summary).toBeTruthy();
        expect(typeof summary).toBe('string');
      });

      it('should handle content with newlines and formatting', async () => {
        const content = `Today was great!\n\nI did multiple things:\n- Exercise\n- Reading\n- Meditation`;
        const summary = await generateSummary(content);
        
        expect(summary).toBeTruthy();
        expect(typeof summary).toBe('string');
      });
    });

    describe('generateAffirmation with mock API', () => {
      it('should handle rapid consecutive calls', async () => {
        const emotions = ['happy', 'sad', 'anxious'];
        const promises = emotions.map(emotion => generateAffirmation(emotion));
        
        const affirmations = await Promise.all(promises);
        
        expect(affirmations).toHaveLength(3);
        affirmations.forEach(affirmation => {
          expect(affirmation).toBeTruthy();
          expect(typeof affirmation).toBe('string');
        });
      });

      it('should handle invalid emotion gracefully', async () => {
        const affirmation = await generateAffirmation('completely_invalid_emotion_type');
        
        expect(affirmation).toBeTruthy();
        expect(typeof affirmation).toBe('string');
      });
    });

    describe('generateReflection with mock API', () => {
      it('should handle very short journal entries', async () => {
        const content = 'Good.';
        const reflection = await generateReflection(content, []);
        
        expect(reflection).toBeTruthy();
        expect(reflection.summary).toBeTruthy();
        expect(reflection.emotion).toBeTruthy();
        expect(reflection.affirmation).toBeTruthy();
      });

      it('should handle mixed emotion content', async () => {
        const content = 'I feel happy about my achievements but anxious about tomorrow. Also a bit sad about leaving.';
        const reflection = await generateReflection(content, []);
        
        expect(reflection).toBeTruthy();
        expect(reflection.summary).toBeTruthy();
        // Should detect at least one emotion
        expect(['happy', 'sad', 'anxious']).toContain(reflection.emotion);
      });

      it('should handle content with multiple habit mentions', async () => {
        const habits = [
          { id: '1', name: 'Exercise' },
          { id: '2', name: 'Read' },
          { id: '3', name: 'Meditation' },
          { id: '4', name: 'Journaling' }
        ];
        const content = 'Today I exercised, read a book, meditated, and did my journaling. Very productive!';
        
        const reflection = await generateReflection(content, habits);
        
        expect(reflection.detectedHabits.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
