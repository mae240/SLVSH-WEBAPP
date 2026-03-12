import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Load env ──
const envPath = resolve(import.meta.dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const supabaseUrl = env['VITE_SUPABASE_URL']
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/fix-henderson.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // Find matches with "Henderson"
  const { data: matches, error: mErr } = await supabase
    .from('matches')
    .select('*')
    .or('player_a.eq.Henderson,player_b.eq.Henderson')
  if (mErr) throw mErr

  console.log(`Found ${matches.length} matches with "Henderson"`)

  for (const m of matches) {
    const opponent = m.player_a === 'Henderson' ? m.player_b : m.player_a
    let newName: string

    if (opponent === 'Greenway') {
      // Match 2: Henderson vs Greenway → H.Henderson
      newName = 'H.Henderson'
    } else if (opponent === 'Hogas') {
      // Match 5: Henderson vs Hogas → A.Henderson
      newName = 'A.Henderson'
    } else {
      console.log(`  Skipping match ${m.match_number} (opponent: ${opponent})`)
      continue
    }

    const isPlayerA = m.player_a === 'Henderson'
    console.log(`  Match ${m.match_number}: ${m.player_a} vs ${m.player_b} → renaming to ${newName}`)

    // Update match player name
    const { error: updateErr } = await supabase
      .from('matches')
      .update(isPlayerA ? { player_a: newName } : { player_b: newName })
      .eq('id', m.id)
    if (updateErr) throw updateErr

    // Update match winner if it was "Henderson"
    if (m.winner === 'Henderson') {
      const { error: winErr } = await supabase
        .from('matches')
        .update({ winner: newName })
        .eq('id', m.id)
      if (winErr) throw winErr
      console.log(`    Also updated winner → ${newName}`)
    }

    // Update predictions for this match where predicted_winner = "Henderson"
    const { data: preds, error: pErr } = await supabase
      .from('predictions')
      .select('id')
      .eq('match_id', m.id)
      .eq('predicted_winner', 'Henderson')
    if (pErr) throw pErr

    if (preds.length > 0) {
      const { error: upErr } = await supabase
        .from('predictions')
        .update({ predicted_winner: newName })
        .eq('match_id', m.id)
        .eq('predicted_winner', 'Henderson')
      if (upErr) throw upErr
      console.log(`    Updated ${preds.length} predictions`)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
