const { Router } = require('express');
const { supabase } = require('../services/supabase');
const { checkGrammar } = require('../services/openai');

const router = Router();

/**
 * POST /api/writing
 * Submit text for grammar checking via GPT-4o-mini.
 * Body: { text: string, day: number }
 */
router.post('/', async (req, res) => {
  try {
    const tgUser = req.telegramUser;
    const { text, day } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const dayNum = parseInt(day, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 60) {
      return res.status(400).json({ error: 'Invalid day' });
    }

    // Verify user exists (telegram_id is the PK)
    const { data: user } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('telegram_id', tgUser.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the writing prompt for context
    const { curriculum } = require('../data/curriculum');
    const seedLesson = curriculum.find(l => l.day === dayNum);
    const prompt = seedLesson ? seedLesson.writingPrompt : '';

    // Check grammar with GPT
    const result = await checkGrammar(text.trim(), prompt);

    // Save attempt
    await supabase.from('writing_attempts').insert({
      telegram_id: tgUser.id,
      day_number: dayNum,
      original_text: text.trim(),
      corrected_text: result.corrected_text,
      feedback: result.feedback,
      score: result.score,
    });

    // Mark writing as done if score >= 40
    if (result.score >= 40) {
      await supabase
        .from('progress')
        .upsert(
          { telegram_id: tgUser.id, day_number: dayNum, writing_done: true },
          { onConflict: 'telegram_id,day_number' }
        );
    }

    res.json(result);
  } catch (err) {
    console.error('Writing error:', err);
    res.status(500).json({ error: 'Failed to check writing' });
  }
});

module.exports = router;
