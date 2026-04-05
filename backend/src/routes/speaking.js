const { Router } = require('express');
const multer = require('multer');
const { supabase } = require('../services/supabase');
const { transcribeAudio, scoreSpeaking } = require('../services/openai');
const { curriculum } = require('../data/curriculum');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * POST /api/speaking
 * Upload audio → Whisper transcription → GPT scoring
 * Body: multipart form with 'audio' file and 'day' field
 */
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const tgUser = req.telegramUser;
    const day = parseInt(req.body.day, 10);

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    if (isNaN(day) || day < 1 || day > 60) {
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

    // Get expected text for this day (listening text doubles as speaking prompt)
    const seedLesson = curriculum.find(l => l.day === day);
    const expectedText = seedLesson ? seedLesson.listeningText.split('.').slice(0, 2).join('.') + '.' : '';

    // Transcribe audio
    const transcription = await transcribeAudio(
      req.file.buffer,
      req.file.originalname || 'audio.webm'
    );

    // Score the speaking
    const { score, feedback } = await scoreSpeaking(transcription, expectedText);

    // Save attempt
    await supabase.from('speaking_attempts').insert({
      telegram_id: tgUser.id,
      day_number: day,
      expected_text: expectedText,
      transcription,
      score,
      feedback,
    });

    // Mark speaking as done if score >= 40
    if (score >= 40) {
      await supabase
        .from('progress')
        .upsert(
          { telegram_id: tgUser.id, day_number: day, speaking_done: true },
          { onConflict: 'telegram_id,day_number' }
        );
    }

    res.json({ transcription, expectedText, score, feedback });
  } catch (err) {
    console.error('Speaking error:', err);
    res.status(500).json({ error: 'Failed to process speech' });
  }
});

module.exports = router;
