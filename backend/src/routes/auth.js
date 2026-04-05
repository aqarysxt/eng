const { Router } = require('express');
const { supabase } = require('../services/supabase');

const router = Router();

/**
 * POST /api/auth
 * Validate Telegram user and upsert into database.
 * The telegramAuth middleware already validated initData and attached telegramUser.
 *
 * Schema: users.telegram_id is the PK. progress uses telegram_id FK + day_number.
 */
router.post('/', async (req, res) => {
  try {
    const tgUser = req.telegramUser;

    // Upsert user (telegram_id is the PK)
    const { data: user, error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id: tgUser.id,
          first_name: tgUser.first_name || '',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          language_code: tgUser.language_code || 'en',
          last_active: new Date().toISOString(),
        },
        { onConflict: 'telegram_id' }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    // Ensure a progress row exists for the user's current day
    await supabase
      .from('progress')
      .upsert(
        { telegram_id: tgUser.id, day_number: user.current_day },
        { onConflict: 'telegram_id,day_number' }
      );

    // Fetch progress
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('telegram_id', tgUser.id)
      .order('day_number', { ascending: true });

    res.json({ user, progress: progress || [] });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
