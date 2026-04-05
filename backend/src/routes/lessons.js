const { Router } = require('express');
const { supabase } = require('../services/supabase');
const { curriculum } = require('../data/curriculum');

const router = Router();

/**
 * GET /api/lessons/today
 * Get the current day's lesson for the authenticated user.
 */
router.get('/today', async (req, res) => {
  try {
    const tgUser = req.telegramUser;

    // telegram_id is the PK — query directly
    const { data: user } = await supabase
      .from('users')
      .select('telegram_id, current_day')
      .eq('telegram_id', tgUser.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const day = user.current_day;

    // Try database first
    const { data: lesson } = await supabase
      .from('daily_lessons')
      .select('*')
      .eq('day', day)
      .single();

    if (lesson) {
      return res.json({ lesson, currentDay: day });
    }

    // Fallback to curriculum seed data
    const seedLesson = curriculum.find(l => l.day === day);
    if (seedLesson) {
      return res.json({
        lesson: {
          day: seedLesson.day,
          topic: seedLesson.topic,
          vocabulary: seedLesson.vocabulary,
          listening_text: seedLesson.listeningText,
          writing_prompt: seedLesson.writingPrompt,
        },
        currentDay: day,
      });
    }

    res.status(404).json({ error: 'No lesson found for this day' });
  } catch (err) {
    console.error('Lessons error:', err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

/**
 * GET /api/lessons/:day
 * Get a specific day's lesson.
 */
router.get('/:day', async (req, res) => {
  try {
    const day = parseInt(req.params.day, 10);

    if (isNaN(day) || day < 1 || day > 60) {
      return res.status(400).json({ error: 'Invalid day (must be 1-60)' });
    }

    // Try database first
    const { data: lesson } = await supabase
      .from('daily_lessons')
      .select('*')
      .eq('day', day)
      .single();

    if (lesson) {
      return res.json({ lesson });
    }

    // Fallback to curriculum seed data
    const seedLesson = curriculum.find(l => l.day === day);
    if (seedLesson) {
      return res.json({
        lesson: {
          day: seedLesson.day,
          topic: seedLesson.topic,
          vocabulary: seedLesson.vocabulary,
          listening_text: seedLesson.listeningText,
          writing_prompt: seedLesson.writingPrompt,
        },
      });
    }

    res.status(404).json({ error: 'Lesson not found' });
  } catch (err) {
    console.error('Lesson fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

module.exports = router;
