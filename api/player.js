import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { telegram_id } = req.query;
    if (!telegram_id) {
      return res.status(400).json({ ok: false, error: 'Missing telegram_id' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', String(telegram_id))
      .single();

    if (userError || !user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const { data: state, error: stateError } = await supabase
      .from('player_state')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (stateError) throw stateError;

    const { data: daily, error: dailyError } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (dailyError) throw dailyError;

    return res.status(200).json({
      ok: true,
      user,
      state,
      daily
    });
  } catch (error) {
    console.error('player error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Server error'
    });
  }
}
