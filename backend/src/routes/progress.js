const { Router } = require('express');
const { supabase } = require('../services/supabase');

const router = Router();

/**
 * GET /api/progress
 * Get the authenticated user's full progress array.
 */
router.get('/', async (req, res) => {
  try {
    const tgUser = req.telegramUser;

    // Get user (telegram_id is the PK)
    const { data: user } = await supabase
      .from('users')
      .select('telegram_id, current_day, streak')
      .eq('telegram_id', tgUser.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('telegram_id', tgUser.id)
      .order('day_number', { ascending: true });

    // Calculate stats
    const completedDays = (progress || []).filter(
      p => p.vocab_done && p.listening_done && p.speaking_done && p.writing_done
    ).length;

    const currentStreak = calculateStreak(progress || []);

    // Update streak in DB if changed
    if (currentStreak !== user.streak) {
      await supabase
        .from('users')
        .update({ streak: currentStreak })
        .eq('telegram_id', tgUser.id);
    }

    res.json({
      currentDay: user.current_day,
      totalDays: 60,
      completedDays,
      currentStreak,
      progress: progress || [],
    });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/**
 * PUT /api/progress/:day
 * Update a specific skill completion for a day.
 * Body: { skill: 'vocab_done' | 'listening_done' | 'speaking_done' | 'writing_done' }
 */
router.put('/:day', async (req, res) => {
  try {
    const tgUser = req.telegramUser;
    const day = parseInt(req.params.day, 10);
    const { skill } = req.body;

    const validSkills = ['vocab_done', 'listening_done', 'speaking_done', 'writing_done'];
    if (!validSkills.includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill. Must be one of: ' + validSkills.join(', ') });
    }

    if (isNaN(day) || day < 1 || day > 60) {
      return res.status(400).json({ error: 'Invalid day (1-60)' });
    }

    // Verify user exists
    const { data: user } = await supabase
      .from('users')
      .select('telegram_id, current_day')
      .eq('telegram_id', tgUser.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Upsert progress — set the specific skill to true
    const updateData = {
      telegram_id: tgUser.id,
      day_number: day,
      [skill]: true,
    };

    const { error: upsertErr } = await supabase
      .from('progress')
      .upsert(updateData, { onConflict: 'telegram_id,day_number' });

    if (upsertErr) throw upsertErr;

    // Re-fetch progress for this day to check all skills
    const { data: fullProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('telegram_id', tgUser.id)
      .eq('day_number', day)
      .single();

    if (fullProgress &&
        fullProgress.vocab_done &&
        fullProgress.listening_done &&
        fullProgress.speaking_done &&
        fullProgress.writing_done) {
      // Mark day as completed
      await supabase
        .from('progress')
        .update({ completed_at: new Date().toISOString() })
        .eq('telegram_id', tgUser.id)
        .eq('day_number', day);

      // Advance to next day if this is the current day
      if (day === user.current_day && day < 60) {
        await supabase
          .from('users')
          .update({ current_day: day + 1 })
          .eq('telegram_id', tgUser.id);

        // Create progress entry for next day
        await supabase
          .from('progress')
          .upsert(
            { telegram_id: tgUser.id, day_number: day + 1 },
            { onConflict: 'telegram_id,day_number' }
          );
      }
    }

    res.json({ success: true, progress: fullProgress });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

/**
 * Calculate current streak (consecutive completed days)
 */
function calculateStreak(progress) {
  let streak = 0;
  const sortedDays = progress
    .filter(p => p.vocab_done && p.listening_done && p.speaking_done && p.writing_done)
    .map(p => p.day_number)
    .sort((a, b) => b - a);

  if (sortedDays.length === 0) return 0;

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      streak = 1;
    } else if (sortedDays[i - 1] - sortedDays[i] === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

module.exports = router;
