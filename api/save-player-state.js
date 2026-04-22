import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { telegram_id, display_name, state, daily } = req.body || {};

    if (!telegram_id || !state) {
      return res.status(400).json({ ok: false, error: 'Missing telegram_id or state' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', String(telegram_id))
      .single();

    if (userError || !user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    if (typeof display_name === 'string') {
      const updateUser = await supabase
        .from('users')
        .update({
          display_name: display_name.trim() || null,
          last_login_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateUser.error) throw updateUser.error;
    }

    const updateState = await supabase
      .from('player_state')
      .update({
        coins: Math.floor(Number(state.coins || 0)),
        energy: Math.floor(Number(state.energy || 0)),
        max_energy: Number(state.max_energy || 1000),
        power_per_tap: Number(state.power_per_tap || 1),
        passive_per_second: Number(state.passive_per_second || 0),
        regen_per_second: Number(state.regen_per_second || 2),
        power_level: Number(state.power_level || 1),
        mine_level: Number(state.mine_level || 0),
        energy_level: Number(state.energy_level || 1),
        regen_level: Number(state.regen_level || 1),
        inventory_json: state.inventory_json || {},
        equipped_json: state.equipped_json || {},
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateState.error) throw updateState.error;

    if (daily) {
      const updateDaily = await supabase
        .from('daily_rewards')
        .update({
          streak: Number(daily.streak || 0),
          cycle_day: Number(daily.cycle_day || 1),
          last_claim_at: daily.last_claim_at || null
        })
        .eq('user_id', user.id);

      if (updateDaily.error) throw updateDaily.error;
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('save-player-state error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Server error'
    });
  }
}
