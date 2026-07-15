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
const seedPassword = process.env['SEED_PASSWORD'] || 'slvsh2026'

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts')
  console.error('Get the service_role key from: Supabase Dashboard → Settings → API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Data ──

const USERS = [
  'Anna', 'Ben', 'Chris', 'Dana', 'Eli', 'Finn', 'Gina', 'Hugo',
  'Iris', 'Jonas', 'Kim', 'Lena', 'Milo', 'Nora',
] as const

const MATCHES = [
  { n: 1,  a: 'Nummendal',   b: 'Dahl' },
  { n: 2,  a: 'Greenway',    b: 'Henderson' },
  { n: 3,  a: 'Syrja',       b: 'Supple' },
  { n: 4,  a: 'Koivisto',    b: 'Buttars' },
  { n: 5,  a: 'Henderson',   b: 'Hogas' },
  { n: 6,  a: 'Moreno',      b: 'Stevenson' },
  { n: 7,  a: 'Andreassen',  b: 'Serra' },
  { n: 8,  a: 'Ralph',       b: 'Moffatt' },
  { n: 9,  a: 'Warnick',     b: 'Sjöstedt' },
  { n: 10, a: 'Asselin',     b: 'Burmansson' },
  { n: 11, a: 'Lundquist',   b: 'Esteban' },
  { n: 12, a: 'Langes',      b: 'Urness' },
] as const

type Letters = 'S' | 'SL' | 'SLV' | 'SLVS' | null
type Pred = [number, string, Letters] // [match_number, winner, letters (null = keine)]

// Predictions per user (match_number, predicted_winner, predicted_letters)
// Skipped where data is invalid (no valid letters, wrong player, etc.)
const PREDICTIONS: Record<string, Pred[]> = {
  Anna: [
    [1, 'Dahl', 'SLV'],
    [2, 'Henderson', 'SLVS'],
    [3, 'Syrja', 'SL'],
    [4, 'Koivisto', 'S'],
    [5, 'Henderson', null],     // "nix" = keine Buchstaben
    [6, 'Stevenson', 'SL'],
    [7, 'Serra', 'SLVS'],
    [8, 'Moffatt', 'SLVS'],
    [9, 'Sjöstedt', 'SLV'],
    [10, 'Asselin', 'SL'],
    [11, 'Lundquist', 'SLV'],
    [12, 'Urness', 'SLVS'],
  ],
  Ben: [
    [1, 'Dahl', 'SL'],
    [2, 'Henderson', 'SLV'],
    [3, 'Syrja', 'SL'],
    [4, 'Koivisto', 'SL'],
    [5, 'Henderson', 'S'],
    [6, 'Stevenson', 'SL'],
    [7, 'Serra', 'SLVS'],
    [8, 'Moffatt', 'SLVS'],    // "Max" = Max Moffatt
    [9, 'Warnick', 'SLV'],
    [10, 'Asselin', 'SL'],
    [11, 'Lundquist', 'S'],
    [12, 'Langes', 'SLVS'],
  ],
  Chris: [
    [1, 'Dahl', 'SLV'],
    [2, 'Henderson', 'SLV'],
    [3, 'Syrja', 'SLVS'],
    [4, 'Koivisto', 'SL'],
    [5, 'Hogas', 'SLVS'],
    [6, 'Stevenson', 'SL'],
    [7, 'Serra', 'SLV'],
    [8, 'Moffatt', 'SL'],
    [9, 'Sjöstedt', 'SLV'],
    [10, 'Burmansson', 'SL'],
    [11, 'Lundquist', 'SLV'],
    [12, 'Langes', 'SLVS'],
  ],
  Dana: [
    [1, 'Dahl', 'SLV'],
    [2, 'Henderson', 'SL'],
    [3, 'Syrja', 'SLVS'],
    // 4: übersprungen (Dana hat Match 4 nicht getippt)
    [5, 'Henderson', 'SLV'],
    [6, 'Stevenson', 'SLV'],
    [7, 'Serra', 'SLVS'],      // "SLVU" → SLVS (Tippfehler)
    [8, 'Moffatt', 'SL'],
    [9, 'Warnick', 'SLV'],
    [10, 'Asselin', 'SL'],
    [11, 'Lundquist', 'SLV'],   // "tayla" = Tayla Lundquist
    // 12: "hannah" ohne Buchstaben, übersprungen
  ],
  Eli: [
    [1, 'Dahl', 'SLV'],         // "Ferdi" = Ferdinand Dahl
    [2, 'Greenway', 'SLV'],     // "Greeners"
    [3, 'Syrja', 'SLVS'],       // "Kong"
    [4, 'Koivisto', 'SLVS'],    // "Kuura"
    [5, 'Henderson', 'S'],      // "Big Al" = Alec Henderson
    [6, 'Stevenson', 'S'],      // "Ryan" = Ryan Stevenson
    [7, 'Andreassen', 'SLV'],
    [8, 'Moffatt', 'SLV'],
    [9, 'Warnick', 'SLV'],
    [10, 'Asselin', 'SL'],
    [11, 'Esteban', 'SL'],
    [12, 'Urness', 'SLV'],
  ],
  Finn: [
    [1, 'Dahl', 'SL'],
    [2, 'Henderson', 'SLV'],
    [3, 'Syrja', 'SLVS'],
    [4, 'Koivisto', 'SLV'],
    [5, 'Hogas', 'SLVS'],
    [6, 'Stevenson', 'SL'],
    [7, 'Serra', 'SLV'],
    [8, 'Moffatt', 'SL'],
    [9, 'Sjöstedt', 'SLVS'],
    [10, 'Asselin', 'SLV'],
    [11, 'Esteban', 'SLVS'],
    [12, 'Langes', 'SLVS'],
  ],
  Gina: [
    [1, 'Dahl', 'SL'],
    [2, 'Henderson', 'SLV'],
    [3, 'Syrja', 'SL'],
    [4, 'Koivisto', 'S'],        // "Kuura"
    [5, 'Hogas', 'SL'],
    [6, 'Stevenson', 'SLVS'],
    [7, 'Serra', 'SLV'],
    [8, 'Moffatt', 'SL'],
    [9, 'Sjöstedt', 'SLVS'],
    [10, 'Asselin', 'SL'],
    [11, 'Esteban', 'SLV'],
    [12, 'Langes', 'SLV'],
  ],
  Hugo: [
    [1, 'Dahl', null],            // "ferdi - 0" = keine Buchstaben
    [2, 'Greenway', 'SLV'],     // "Greenjay"
    [3, 'Syrja', 'SL'],
    [4, 'Buttars', 'SLVS'],
    [5, 'Henderson', 'S'],      // "Alec"
    [6, 'Moreno', 'SLV'],
    [7, 'Serra', 'SL'],
    [8, 'Ralph', 'SLVS'],
    [9, 'Warnick', 'SL'],       // "Girlboss Riley" = Riley Warnick
    [10, 'Asselin', 'SL'],      // "Olive" = Olivia Asselin (Hugo hatte 10/11 vertauscht)
    [11, 'Esteban', 'SLV'],
    [12, 'Langes', 'SLVS'],     // "Han" = Hannah Langes
  ],
  Iris: [
    [1, 'Dahl', 'SLV'],
    [2, 'Henderson', 'SLV'],
    [3, 'Syrja', 'SLV'],
    [4, 'Koivisto', 'SL'],
    [5, 'Henderson', 'SLV'],
    [6, 'Stevenson', 'SLV'],
    [7, 'Serra', 'SLVS'],
    [8, 'Moffatt', 'SLV'],
    [9, 'Warnick', 'SLVS'],
    [10, 'Asselin', 'SLV'],
    [11, 'Esteban', 'SLVS'],
    [12, 'Langes', 'SLVS'],
  ],
  Jonas: [
    [1, 'Dahl', 'SLV'],         // "Ferdi"
    [2, 'Greenway', 'SLVS'],    // "Tom G"
    [3, 'Syrja', 'SLV'],        // "Elias Syra"
    [4, 'Koivisto', 'SL'],      // "Kuura"
    [5, 'Henderson', 'S'],
    [6, 'Stevenson', 'SLV'],    // "Ryan"
    [7, 'Serra', 'SLVS'],
    [8, 'Moffatt', 'SLV'],
    [9, 'Warnick', 'SLV'],
    [10, 'Asselin', 'SLVS'],
    [11, 'Lundquist', 'S'],
    [12, 'Langes', 'SLV'],
  ],
  Kim: [
    [1, 'Dahl', 'SL'],
    [2, 'Henderson', 'SLV'],
    [3, 'Syrja', 'SL'],
    [4, 'Koivisto', 'S'],
    [5, 'Hogas', 'SLV'],
    [6, 'Stevenson', 'SL'],
    [7, 'Serra', 'SLV'],
    [8, 'Moffatt', 'S'],
    [9, 'Warnick', 'SLVS'],
    [10, 'Asselin', 'S'],
    [11, 'Lundquist', 'SLV'],
    [12, 'Langes', 'SLVS'],
  ],
  Lena: [
    [1, 'Dahl', 'SLV'],         // "Ferdl"
    [2, 'Greenway', 'SLVS'],
    [3, 'Supple', 'SLV'],
    [4, 'Koivisto', 'SLV'],
    [5, 'Henderson', 'SL'],
    [6, 'Stevenson', 'SLVS'],
    [7, 'Andreassen', 'SL'],
    [8, 'Moffatt', 'SLV'],
    [9, 'Warnick', 'SLV'],
    [10, 'Asselin', 'SL'],      // "olivia"
    [11, 'Esteban', 'SLV'],
    [12, 'Langes', 'SLVS'],
  ],
  Milo: [
    [1, 'Dahl', 'SLV'],
    [2, 'Henderson', 'S'],
    [3, 'Syrja', 'SLV'],
    [4, 'Koivisto', 'SL'],
    [5, 'Henderson', 'S'],
    [6, 'Stevenson', 'SL'],
    [7, 'Andreassen', 'SLV'],
    [8, 'Moffatt', 'SLV'],
    [9, 'Warnick', 'SLVS'],
    [10, 'Asselin', 'SL'],
    [11, 'Lundquist', 'SLV'],
    [12, 'Langes', 'SLV'],
  ],
  // Nora: keine Tipps
}

// ── Seed ──

async function seed() {
  console.log('🎿 SLVSH Seed starten...\n')

  // 1. Create users + profiles
  // The handle_new_user trigger may fail, so we create profiles manually
  console.log('→ Users erstellen...')
  const userIds: Record<string, string> = {}

  // Get all existing users first
  const { data: { users: allExisting } } = await supabase.auth.admin.listUsers()

  for (const name of USERS) {
    const email = `${name.toLowerCase()}@slvsh.local`

    // Check if user already exists
    const existing = allExisting.find((u) => u.email === email)
    if (existing) {
      userIds[name] = existing.id
      // Ensure profile exists
      await supabase.from('profiles').upsert({ id: existing.id, display_name: name, email })
      console.log(`  ✓ ${name} (existiert bereits)`)
      continue
    }

    // Create auth user (trigger may fail — that's OK)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: seedPassword,
      email_confirm: true,
    })
    if (error) {
      console.error(`  ✗ ${name}: ${error.message}`)
      continue
    }
    userIds[name] = data.user.id

    // Create profile manually
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, display_name: name, email })
    if (profileErr) {
      console.error(`  ✗ ${name} Profil: ${profileErr.message}`)
    } else {
      console.log(`  ✓ ${name}`)
    }
  }

  // 2. Create tournament
  console.log('\n→ Turnier erstellen...')
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .upsert({
      name: 'SLVSH Cup Grandvalira 2026',
      slug: 'slvsh-cup-grandvalira-2026',
      description: 'SLVSH Cup in Grandvalira, Andorra',
      status: 'active',
    }, { onConflict: 'slug' })
    .select()
    .single()
  if (tErr) { console.error(tErr); process.exit(1) }
  console.log(`  ✓ ${tournament.name} (${tournament.id})`)

  // 3. Create round
  console.log('\n→ Runde erstellen...')
  // Check if round already exists
  const { data: existingRounds } = await supabase
    .from('rounds')
    .select('*')
    .eq('tournament_id', tournament.id)
    .eq('round_order', 1)

  let round
  if (existingRounds && existingRounds.length > 0) {
    round = existingRounds[0]
    console.log(`  ✓ ${round.name} (existiert bereits)`)
  } else {
    const { data: newRound, error: rErr } = await supabase
      .from('rounds')
      .insert({
        tournament_id: tournament.id,
        name: 'Runde 1',
        round_order: 1,
        deadline_at: '2026-03-10T12:00:00Z', // Deadline in der Vergangenheit → Tipps sichtbar
        is_locked: true,
      })
      .select()
      .single()
    if (rErr) { console.error(rErr); process.exit(1) }
    round = newRound
    console.log(`  ✓ ${round.name} (${round.id})`)
  }

  // 4. Create matches
  console.log('\n→ Matches erstellen...')
  const matchIds: Record<number, string> = {}
  for (const m of MATCHES) {
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('round_id', round.id)
      .eq('match_number', m.n)

    if (existingMatch && existingMatch.length > 0) {
      matchIds[m.n] = existingMatch[0].id
      console.log(`  ✓ #${m.n} ${m.a} vs ${m.b} (existiert)`)
      continue
    }

    const { data: match, error: mErr } = await supabase
      .from('matches')
      .insert({
        tournament_id: tournament.id,
        round_id: round.id,
        match_number: m.n,
        player_a: m.a,
        player_b: m.b,
      })
      .select()
      .single()
    if (mErr) { console.error(`  ✗ #${m.n}: ${mErr.message}`); continue }
    matchIds[m.n] = match.id
    console.log(`  ✓ #${m.n} ${m.a} vs ${m.b}`)
  }

  // 5. Insert predictions
  console.log('\n→ Predictions einfügen...')
  let inserted = 0
  let skipped = 0
  for (const [userName, preds] of Object.entries(PREDICTIONS)) {
    const userId = userIds[userName]
    if (!userId) { console.log(`  ⚠ ${userName}: kein User-ID, übersprungen`); continue }

    for (const [matchNum, winner, letters] of preds) {
      const matchId = matchIds[matchNum]
      if (!matchId) { console.log(`  ⚠ ${userName} Match #${matchNum}: kein Match-ID`); continue }

      // Check if prediction already exists
      const { data: existing } = await supabase
        .from('predictions')
        .select('id')
        .eq('user_id', userId)
        .eq('match_id', matchId)

      if (existing && existing.length > 0) {
        skipped++
        continue
      }

      const { error: pErr } = await supabase
        .from('predictions')
        .insert({
          user_id: userId,
          tournament_id: tournament.id,
          round_id: round.id,
          match_id: matchId,
          predicted_winner: winner,
          predicted_winner_letters: letters,
        })
      if (pErr) {
        console.log(`  ✗ ${userName} #${matchNum}: ${pErr.message}`)
      } else {
        inserted++
      }
    }
    console.log(`  ✓ ${userName}`)
  }

  console.log(`\n✅ Fertig! ${inserted} Predictions eingefügt, ${skipped} übersprungen (existierten bereits)`)
  console.log(`\nAlle User-Passwörter: ${seedPassword}`)
  console.log(`Login mit Benutzername (z.B. "anna") + Passwort "${seedPassword}"`)
}

seed().catch(console.error)
