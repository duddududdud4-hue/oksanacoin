import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function validateTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { initData } = req.body || {};
    if (!initData) {
      return res.status(400).json({ ok: false, error: 'Missing initData' });
    }

    const tgUser = validateTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
    if (!tgUser) {
      return res.status(401).json({ ok: false, error: 'Invalid Telegram auth' });
    }

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', String(tgUser.id))
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      const createdUser = await supabase
        .from('users')
        .insert({
          telegram_id: String(tgUser.id),
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          display_name: null
        })
        .select()
        .single();

      if (createdUser.error) throw createdUser.error;
      user = createdUser.data;

      const createdState = await supabase.from('player_state').insert({ user_id: user.id });
      if (createdState.error) throw createdState.error;

      const createdDaily = await supabase.from('daily_rewards').insert({ user_id: user.id });
      if (createdDaily.error) throw createdDaily.error;
    } else {
      const updatedUser = await supabase
        .from('users')
        .update({
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_login_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updatedUser.error) throw updatedUser.error;
      user = updatedUser.data;
    }

    return res.status(200).json({
      ok: true,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        display_name: user.display_name
      }
    });
  } catch (error) {
    console.error('auth-telegram error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Server error'
    });
  }
}
