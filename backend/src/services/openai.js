const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio using OpenAI Whisper API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeAudio(audioBuffer, filename = 'audio.webm') {
  const file = new File([audioBuffer], filename, { type: 'audio/webm' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
  });

  return transcription.text;
}

/**
 * Score speaking by comparing transcription to expected text
 * @param {string} transcription - What the user actually said
 * @param {string} expectedText - What they were supposed to say
 * @returns {Promise<{score: number, feedback: string}>}
 */
async function scoreSpeaking(transcription, expectedText) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an English pronunciation and speaking coach for beginner learners.
Compare the student's spoken text (transcribed via speech-to-text) with the expected text.
Score from 0-100 based on accuracy, completeness, and correctness.
Provide brief, encouraging feedback (2-3 sentences max).
Respond in JSON format: {"score": number, "feedback": "string"}`
      },
      {
        role: 'user',
        content: `Expected text: "${expectedText}"
Student said: "${transcription}"`
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return { score: 0, feedback: 'Could not evaluate your speech. Please try again.' };
  }
}

/**
 * Check grammar and provide corrections using GPT-4o-mini
 * @param {string} text - User's written text
 * @param {string} prompt - The writing prompt for context
 * @returns {Promise<{corrected_text: string, feedback: string, score: number}>}
 */
async function checkGrammar(text, prompt = '') {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an English writing tutor for beginner learners (A1-A2 level).
The student was given this writing prompt: "${prompt}"
Correct their grammar, spelling, and punctuation.
Provide specific, constructive feedback (3-4 sentences) about what they did well and what to improve.
Score from 0-100 based on grammar accuracy, relevance to prompt, and effort.
Respond in JSON format: {"corrected_text": "string", "feedback": "string", "score": number}`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return {
      corrected_text: text,
      feedback: 'Could not check your writing. Please try again.',
      score: 0
    };
  }
}

module.exports = { transcribeAudio, scoreSpeaking, checkGrammar };
