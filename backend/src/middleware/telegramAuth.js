const crypto = require('crypto');

/**
 * Telegram Mini App initData validation middleware.
 * Validates the HMAC-SHA256 signature to ensure requests come from Telegram.
 * Attaches telegramUser to req on success.
 */
function telegramAuth(req, res, next) {
  try {
    const initData = req.headers['x-telegram-init-data'];

    if (!initData) {
      return res.status(401).json({ error: 'Missing Telegram init data' });
    }

    // Parse the initData query string
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return res.status(401).json({ error: 'Missing hash in init data' });
    }

    // Remove hash from params and sort alphabetically
    params.delete('hash');
    const dataCheckArr = [];
    for (const [key, value] of params.entries()) {
      dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Compute HMAC
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      return res.status(401).json({ error: 'Invalid Telegram signature' });
    }

    // Check auth_date is not too old (allow 24 hours)
    const authDate = parseInt(params.get('auth_date'), 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return res.status(401).json({ error: 'Init data expired' });
    }

    // Extract user object
    const userParam = params.get('user');
    if (userParam) {
      req.telegramUser = JSON.parse(decodeURIComponent(userParam));
    } else {
      return res.status(401).json({ error: 'No user data in init data' });
    }

    next();
  } catch (err) {
    console.error('Telegram auth error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { telegramAuth };
