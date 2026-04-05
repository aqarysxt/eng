const { Telegraf, Markup } = require('telegraf');

/**
 * Create and configure the Telegram bot.
 * @param {string} token - Bot token from BotFather
 * @param {string} frontendUrl - URL of the Mini App frontend
 * @returns {Telegraf} Configured bot instance
 */
function createBot(token, frontendUrl) {
  const bot = new Telegraf(token);

  // /start command
  bot.start(async (ctx) => {
    const firstName = ctx.from.first_name || 'there';
    await ctx.reply(
      `🚀 Welcome to EngRocket, ${firstName}!\n\n` +
      `Learn English from zero to A2 level in just 60 days!\n\n` +
      `📚 Daily IT & Business vocabulary\n` +
      `🎧 Listening exercises\n` +
      `🎤 Speaking practice with AI\n` +
      `✍️ Writing with grammar checks\n\n` +
      `Tap the button below to start learning! 👇`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('🎓 Open EngRocket', frontendUrl)],
      ])
    );
  });

  // /progress command
  bot.command('progress', async (ctx) => {
    await ctx.reply(
      `📊 Check your progress in the app! 👇`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('📈 View Progress', frontendUrl)],
      ])
    );
  });

  // /help command
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `ℹ️ *EngRocket Help*\n\n` +
      `🎓 *How it works:*\n` +
      `Every day you get a new lesson with 4 exercises:\n` +
      `1. 📚 Vocabulary — Learn 8 new IT/Business words\n` +
      `2. 🎧 Listening — Listen and answer questions\n` +
      `3. 🎤 Speaking — Read aloud and get AI feedback\n` +
      `4. ✍️ Writing — Write and get grammar corrections\n\n` +
      `Complete all 4 to unlock the next day!\n\n` +
      `*Commands:*\n` +
      `/start — Open the app\n` +
      `/progress — Check your progress\n` +
      `/help — Show this message`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle any text message — prompt to use the app
  bot.on('text', async (ctx) => {
    await ctx.reply(
      `Tap the button below to open EngRocket and start learning! 🚀`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('🎓 Open EngRocket', frontendUrl)],
      ])
    );
  });

  return bot;
}

module.exports = { createBot };
