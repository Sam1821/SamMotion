// SamMotion — exercise / equipment / routine data
// Exercise GIFs reference the Free Exercise DB CDN (MIT licensed):
//   https://github.com/yuhonas/free-exercise-db
// Pattern: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/<slug>/0.jpg
// (slugs are the canonical names from that repo; we hand-mapped a curated 100+ subset.)

import type { EquipmentDef, ExerciseDict, HistoryEntry, MuscleGroup, MuscleId, PR, Routine } from "./types"

const FE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"

// ──────────────────────────── Equipment catalog ────────────────────────────
export const EQUIPMENT_META: Record<string, EquipmentDef> = {
  // Free weights
  bb:        { label: "Barbell",         emoji: "🏋️",  cat: "Free Weights" },
  db:        { label: "Dumbbells",       emoji: "💪",  cat: "Free Weights" },
  ez:        { label: "EZ Curl Bar",     emoji: "〰️",  cat: "Free Weights" },
  trap:      { label: "Trap Bar",        emoji: "⬡",   cat: "Free Weights" },
  kb:        { label: "Kettlebell",      emoji: "🔔",  cat: "Free Weights" },
  plate:     { label: "Weight Plates",   emoji: "🥏",  cat: "Free Weights" },

  // Benches & racks
  bench_flat:    { label: "Flat Bench",        emoji: "🛏️",  cat: "Bench" },
  bench_inc:     { label: "Incline Bench",     emoji: "📐",  cat: "Bench" },
  bench_dec:     { label: "Decline Bench",     emoji: "📉",  cat: "Bench" },
  rack:          { label: "Power Rack",        emoji: "🔲",  cat: "Rack" },
  smith:         { label: "Smith Machine",     emoji: "⛓️",  cat: "Rack" },

  // Cable & cardio
  cable:     { label: "Cable Machine",   emoji: "🪢",  cat: "Cable" },
  pulldown:  { label: "Lat Pulldown",    emoji: "⬇️",  cat: "Cable" },
  row_cable: { label: "Cable Row",       emoji: "↔️",  cat: "Cable" },

  // Machines
  leg_press: { label: "Leg Press",       emoji: "🦵",  cat: "Machine" },
  leg_curl:  { label: "Leg Curl",        emoji: "🦿",  cat: "Machine" },
  leg_ext:   { label: "Leg Extension",   emoji: "🪑",  cat: "Machine" },
  hack:      { label: "Hack Squat",      emoji: "🅷",  cat: "Machine" },
  calf_m:    { label: "Calf Raise Mach", emoji: "🦶",  cat: "Machine" },
  pec_deck:  { label: "Pec Deck",        emoji: "🦋",  cat: "Machine" },
  chest_m:   { label: "Chest Press M",   emoji: "🅼",  cat: "Machine" },
  shoulder_m:{ label: "Shoulder Press M",emoji: "🅂",  cat: "Machine" },
  ab_m:      { label: "Ab Machine",      emoji: "🅰️",  cat: "Machine" },
  back_ext:  { label: "Back Extension",  emoji: "🅱️",  cat: "Machine" },
  glute_m:   { label: "Glute Machine",   emoji: "🅶",  cat: "Machine" },
  hip_thrust:{ label: "Hip Thrust Mach", emoji: "🍑",  cat: "Machine" },

  // Bodyweight stations
  pullup:    { label: "Pull-up Bar",     emoji: "🚪",  cat: "Bodyweight" },
  dipbar:    { label: "Dip Bars",        emoji: "║",   cat: "Bodyweight" },
  bench_ab:  { label: "Decline Ab Bench",emoji: "🪜",  cat: "Bodyweight" },
  rings:     { label: "Gymnastic Rings", emoji: "⭕",  cat: "Bodyweight" },
  trx:       { label: "TRX / Suspension",emoji: "🧗",  cat: "Bodyweight" },

  // Functional / extras
  band:      { label: "Resistance Band", emoji: "➰",  cat: "Functional" },
  rope:      { label: "Battle Rope",     emoji: "🪢",  cat: "Functional" },
  box:       { label: "Plyo Box",        emoji: "📦",  cat: "Functional" },
  mat:       { label: "Yoga Mat",        emoji: "🟦",  cat: "Functional" },
  foam:      { label: "Foam Roller",     emoji: "🌀",  cat: "Functional" },
  med_ball:  { label: "Medicine Ball",   emoji: "⚽",  cat: "Functional" },
  ball_swiss:{ label: "Swiss Ball",      emoji: "🔵",  cat: "Functional" },
  treadmill: { label: "Treadmill",       emoji: "🏃",  cat: "Cardio" },
  bike:      { label: "Stationary Bike", emoji: "🚴",  cat: "Cardio" },
  rower:     { label: "Rowing Machine",  emoji: "🚣",  cat: "Cardio" },

  // Bodyweight only — every gym implicitly has this
  bw:        { label: "Bodyweight",      emoji: "🧍",  cat: "Bodyweight" },
}

export const ALL_EQ_IDS: string[] = Object.keys(EQUIPMENT_META)

export const GYM_EMOJIS = ["🏠", "🏋️", "🏢", "🏨", "🌳", "🏭", "🛖", "🏟️", "💪", "🔥"]

// ──────────────────────────── Muscle group rollup ────────────────────────────
export const MUSCLE_GROUP: Record<MuscleId, MuscleGroup> = {
  chest_upper: "chest", chest_mid: "chest", chest_lower: "chest",
  lats: "back", traps_upper: "back", traps_mid: "back", traps_lower: "back", rhomboids: "back", lower_back: "back", rear_delts: "back",
  delts_front: "shoulders", delts_side: "shoulders",
  biceps_long: "biceps", biceps_short: "biceps", brachialis: "biceps",
  triceps_long: "triceps", triceps_lateral: "triceps", triceps_medial: "triceps",
  forearms: "forearms",
  abs_upper: "core", abs_lower: "core", obliques: "core",
  glutes: "glutes",
  quads_rf: "quads", quads_vl: "quads", quads_vm: "quads",
  hamstrings_bf: "hamstrings", hamstrings_sm: "hamstrings",
  adductors: "quads", abductors: "glutes",
  calves_gastroc: "calves", calves_soleus: "calves",
}

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest_upper: "Upper Chest", chest_mid: "Mid Chest", chest_lower: "Lower Chest",
  lats: "Lats", traps_upper: "Upper Traps", traps_mid: "Mid Traps", traps_lower: "Lower Traps",
  rhomboids: "Rhomboids", lower_back: "Lower Back", rear_delts: "Rear Delts",
  delts_front: "Front Delts", delts_side: "Side Delts",
  biceps_long: "Biceps Long Head", biceps_short: "Biceps Short Head", brachialis: "Brachialis",
  triceps_long: "Triceps Long Head", triceps_lateral: "Triceps Lateral Head", triceps_medial: "Triceps Medial Head",
  forearms: "Forearms",
  abs_upper: "Upper Abs", abs_lower: "Lower Abs", obliques: "Obliques",
  glutes: "Glutes",
  quads_rf: "Rectus Femoris", quads_vl: "Vastus Lateralis", quads_vm: "Vastus Medialis",
  hamstrings_bf: "Biceps Femoris", hamstrings_sm: "Semimembranosus",
  adductors: "Adductors", abductors: "Abductors",
  calves_gastroc: "Gastrocnemius", calves_soleus: "Soleus",
}

const gif = (slug: string) => `${FE_BASE}/${slug}/0.jpg`

// ──────────────────────────── Exercise dictionary ────────────────────────────
// 100+ curated exercises across all major movement patterns.
// Sub-head muscle assignments based on standard biomechanics references.
export const EX: ExerciseDict = {
  // ───── Chest ─────
  bench:        { n:"Barbell Bench Press",   p:["chest_mid","chest_lower"], s:["delts_front","triceps_lateral","triceps_medial"], req:["bb","bench_flat"], sets:4, r:8, w:60,  gif:gif("Barbell_Bench_Press_-_Medium_Grip"), level:"intermediate", category:"compound" },
  bench_inc:    { n:"Incline Barbell Press", p:["chest_upper"], s:["delts_front","triceps_lateral"], req:["bb","bench_inc"], sets:4, r:8, w:50, gif:gif("Barbell_Incline_Bench_Press_-_Medium-Grip"), level:"intermediate", category:"compound" },
  bench_dec:    { n:"Decline Barbell Press", p:["chest_lower"], s:["delts_front","triceps_lateral"], req:["bb","bench_dec"], sets:4, r:8, w:50, gif:gif("Barbell_Decline_Bench_Press_-_Medium_Grip"), level:"intermediate", category:"compound" },
  db_bench:     { n:"Dumbbell Bench Press",  p:["chest_mid","chest_lower"], s:["delts_front","triceps_lateral"], req:["db","bench_flat"], sets:4, r:10, w:22, gif:gif("Dumbbell_Bench_Press"), level:"beginner", category:"compound" },
  db_inc:       { n:"Incline DB Press",      p:["chest_upper"], s:["delts_front","triceps_lateral"], req:["db","bench_inc"], sets:4, r:10, w:20, gif:gif("Dumbbell_Bench_Press"), level:"beginner", category:"compound" },
  db_fly:       { n:"Dumbbell Fly",          p:["chest_mid"], s:["delts_front","biceps_short"], req:["db","bench_flat"], sets:3, r:12, w:12, gif:gif("Dumbbell_Flyes"), level:"beginner", category:"isolation" },
  cable_fly:    { n:"Cable Crossover",       p:["chest_mid","chest_lower"], s:["delts_front"], req:["cable"], sets:3, r:12, w:15, gif:gif("Cable_Crossover"), level:"beginner", category:"isolation" },
  pec_deck:     { n:"Pec Deck Fly",          p:["chest_mid"], s:["delts_front"], req:["pec_deck"], sets:3, r:12, w:30, gif:gif("Butterfly"), level:"beginner", category:"isolation" },
  push_up:      { n:"Push-Up",               p:["chest_mid"], s:["delts_front","triceps_lateral","abs_upper"], req:["bw"], sets:3, r:15, gif:gif("Pushups"), level:"beginner", category:"compound" },
  dip_chest:    { n:"Chest Dip",             p:["chest_lower"], s:["triceps_lateral","delts_front"], req:["dipbar"], sets:3, r:10, gif:gif("Dips_-_Chest_Version"), level:"intermediate", category:"compound" },
  chest_press_m:{ n:"Machine Chest Press",   p:["chest_mid"], s:["delts_front","triceps_lateral"], req:["chest_m"], sets:3, r:10, w:40, gif:gif("Hammer_Grip_Incline_DB_Press"), level:"beginner", category:"compound" },

  // ───── Back ─────
  deadlift:     { n:"Barbell Deadlift",      p:["lower_back","glutes","hamstrings_bf"], s:["traps_mid","lats","forearms"], req:["bb"], sets:4, r:5, w:80, gif:gif("Barbell_Deadlift"), level:"advanced", category:"compound" },
  pullup:       { n:"Pull-Up",               p:["lats"], s:["biceps_long","biceps_short","rhomboids","rear_delts"], req:["pullup"], sets:4, r:8, gif:gif("Pullups"), level:"intermediate", category:"compound" },
  chinup:       { n:"Chin-Up",               p:["lats","biceps_short"], s:["biceps_long","brachialis","rhomboids"], req:["pullup"], sets:4, r:8, gif:gif("Chin-Up"), level:"intermediate", category:"compound" },
  lat_pulldown: { n:"Lat Pulldown",          p:["lats"], s:["biceps_long","rhomboids","rear_delts"], req:["pulldown"], sets:4, r:10, w:50, gif:gif("Wide-Grip_Lat_Pulldown"), level:"beginner", category:"compound" },
  row_bb:       { n:"Bent-Over Barbell Row", p:["lats","rhomboids"], s:["traps_mid","biceps_long","rear_delts"], req:["bb"], sets:4, r:8, w:50, gif:gif("Bent_Over_Barbell_Row"), level:"intermediate", category:"compound" },
  row_db:       { n:"One-Arm DB Row",        p:["lats","rhomboids"], s:["traps_mid","biceps_long","rear_delts"], req:["db","bench_flat"], sets:4, r:10, w:25, gif:gif("One-Arm_Dumbbell_Row"), level:"beginner", category:"compound" },
  row_cable:    { n:"Seated Cable Row",      p:["rhomboids","lats"], s:["traps_mid","biceps_long","rear_delts"], req:["row_cable","cable"], sets:4, r:10, w:50, gif:gif("Seated_Cable_Rows"), level:"beginner", category:"compound" },
  row_tbar:     { n:"T-Bar Row",             p:["rhomboids","lats"], s:["traps_mid","biceps_long"], req:["bb","plate"], sets:4, r:8, w:40, gif:gif("T-Bar_Row_with_Handle"), level:"intermediate", category:"compound" },
  shrug_bb:     { n:"Barbell Shrug",         p:["traps_upper"], s:["forearms"], req:["bb"], sets:3, r:12, w:60, gif:gif("Barbell_Shrug"), level:"beginner", category:"isolation" },
  shrug_db:     { n:"Dumbbell Shrug",        p:["traps_upper"], s:["forearms"], req:["db"], sets:3, r:12, w:25, gif:gif("Dumbbell_Shrug"), level:"beginner", category:"isolation" },
  face_pull:    { n:"Face Pull",             p:["rear_delts","traps_mid"], s:["rhomboids"], req:["cable"], sets:3, r:15, w:20, gif:gif("Face_Pull"), level:"beginner", category:"isolation" },
  pullover:     { n:"Dumbbell Pullover",     p:["lats","chest_upper"], s:["triceps_long"], req:["db","bench_flat"], sets:3, r:12, w:20, gif:gif("Dumbbell_Pullover"), level:"intermediate", category:"isolation" },
  back_ext:     { n:"Back Extension",        p:["lower_back","glutes"], s:["hamstrings_bf"], req:["back_ext"], sets:3, r:12, gif:gif("Hyperextensions_With_No_Hyperextension_Bench"), level:"beginner", category:"isolation" },

  // ───── Shoulders ─────
  ohp:          { n:"Overhead Press",        p:["delts_front"], s:["delts_side","triceps_lateral","triceps_medial"], req:["bb"], sets:4, r:6, w:40, gif:gif("Standing_Military_Press"), level:"intermediate", category:"compound" },
  ohp_db:       { n:"Seated DB Press",       p:["delts_front"], s:["delts_side","triceps_lateral"], req:["db","bench_flat"], sets:4, r:10, w:18, gif:gif("Seated_Dumbbell_Press"), level:"beginner", category:"compound" },
  arnold:       { n:"Arnold Press",           p:["delts_front","delts_side"], s:["triceps_lateral"], req:["db"], sets:3, r:10, w:14, gif:gif("Arnold_Dumbbell_Press"), level:"intermediate", category:"compound" },
  shoulder_m:   { n:"Machine Shoulder Press",p:["delts_front"], s:["delts_side","triceps_lateral"], req:["shoulder_m"], sets:3, r:10, w:30, gif:gif("Machine_Shoulder_(Military)_Press"), level:"beginner", category:"compound" },
  lat_raise:    { n:"Lateral Raise",         p:["delts_side"], s:["traps_upper"], req:["db"], sets:3, r:15, w:8, gif:gif("Side_Lateral_Raise"), level:"beginner", category:"isolation" },
  lat_raise_c:  { n:"Cable Lateral Raise",   p:["delts_side"], s:[], req:["cable"], sets:3, r:15, w:10, gif:gif("Side_Lateral_Raise"), level:"beginner", category:"isolation" },
  front_raise:  { n:"Front Raise",           p:["delts_front"], s:["chest_upper"], req:["db"], sets:3, r:12, w:8, gif:gif("Front_Dumbbell_Raise"), level:"beginner", category:"isolation" },
  rear_fly:     { n:"Reverse Fly",           p:["rear_delts"], s:["rhomboids","traps_mid"], req:["db"], sets:3, r:15, w:8, gif:gif("Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench"), level:"beginner", category:"isolation" },
  upright_row:  { n:"Upright Row",           p:["delts_side","traps_upper"], s:["biceps_long"], req:["bb"], sets:3, r:12, w:30, gif:gif("Upright_Barbell_Row"), level:"intermediate", category:"compound" },

  // ───── Biceps ─────
  curl_bb:      { n:"Barbell Curl",          p:["biceps_long","biceps_short"], s:["brachialis","forearms"], req:["bb","ez"], sets:3, r:10, w:25, gif:gif("Barbell_Curl"), level:"beginner", category:"isolation" },
  curl_db:      { n:"Dumbbell Curl",         p:["biceps_long","biceps_short"], s:["brachialis","forearms"], req:["db"], sets:3, r:12, w:12, gif:gif("Dumbbell_Bicep_Curl"), level:"beginner", category:"isolation" },
  curl_ham:     { n:"Hammer Curl",           p:["brachialis","forearms"], s:["biceps_long"], req:["db"], sets:3, r:12, w:12, gif:gif("Hammer_Curls"), level:"beginner", category:"isolation" },
  curl_inc:     { n:"Incline DB Curl",       p:["biceps_long"], s:["biceps_short","brachialis"], req:["db","bench_inc"], sets:3, r:12, w:10, gif:gif("Dumbbell_Alternate_Bicep_Curl"), level:"intermediate", category:"isolation" },
  curl_pre:     { n:"Preacher Curl",         p:["biceps_short"], s:["brachialis","forearms"], req:["ez","bench_flat"], sets:3, r:10, w:20, gif:gif("EZ-Bar_Curl"), level:"intermediate", category:"isolation" },
  curl_cable:   { n:"Cable Curl",            p:["biceps_long","biceps_short"], s:["brachialis"], req:["cable"], sets:3, r:12, w:20, gif:gif("Standing_Biceps_Cable_Curl"), level:"beginner", category:"isolation" },
  curl_conc:    { n:"Concentration Curl",    p:["biceps_short"], s:["brachialis"], req:["db","bench_flat"], sets:3, r:12, w:10, gif:gif("Concentration_Curls"), level:"beginner", category:"isolation" },

  // ───── Triceps ─────
  dip_tri:      { n:"Triceps Dip",           p:["triceps_long","triceps_lateral","triceps_medial"], s:["chest_lower","delts_front"], req:["dipbar"], sets:3, r:10, gif:gif("Dips_-_Triceps_Version"), level:"intermediate", category:"compound" },
  bench_close:  { n:"Close-Grip Bench",      p:["triceps_lateral","triceps_medial"], s:["chest_mid","delts_front"], req:["bb","bench_flat"], sets:4, r:8, w:45, gif:gif("Bench_Press_-_Powerlifting"), level:"intermediate", category:"compound" },
  push_diamond: { n:"Diamond Push-Up",       p:["triceps_lateral","triceps_medial"], s:["chest_mid","delts_front"], req:["bw"], sets:3, r:12, gif:gif("Pushups_Close_Triceps_Position"), level:"intermediate", category:"compound" },
  push_down:    { n:"Tricep Pushdown",       p:["triceps_lateral","triceps_medial"], s:[], req:["cable"], sets:3, r:12, w:25, gif:gif("Triceps_Pushdown"), level:"beginner", category:"isolation" },
  push_rope:    { n:"Rope Pushdown",         p:["triceps_lateral","triceps_long"], s:[], req:["cable"], sets:3, r:12, w:20, gif:gif("Triceps_Pushdown_-_Rope_Attachment"), level:"beginner", category:"isolation" },
  ext_oh:       { n:"Overhead Tri Extension",p:["triceps_long"], s:["triceps_medial"], req:["db"], sets:3, r:12, w:12, gif:gif("Standing_Dumbbell_Triceps_Extension"), level:"intermediate", category:"isolation" },
  ext_skull:    { n:"Skull Crusher",         p:["triceps_long","triceps_lateral"], s:["triceps_medial"], req:["ez","bench_flat"], sets:3, r:10, w:20, gif:gif("EZ-Bar_Skullcrusher"), level:"intermediate", category:"isolation" },
  kickback:     { n:"Tricep Kickback",       p:["triceps_lateral"], s:[], req:["db"], sets:3, r:12, w:6, gif:gif("Tricep_Dumbbell_Kickback"), level:"beginner", category:"isolation" },

  // ───── Quads / Legs (push) ─────
  squat:        { n:"Barbell Back Squat",    p:["quads_rf","quads_vl","quads_vm","glutes"], s:["hamstrings_bf","lower_back","abs_upper"], req:["bb","rack"], sets:4, r:8, w:80, gif:gif("Barbell_Squat"), level:"intermediate", category:"compound" },
  squat_front:  { n:"Front Squat",           p:["quads_rf","quads_vl","quads_vm"], s:["glutes","abs_upper"], req:["bb","rack"], sets:4, r:6, w:60, gif:gif("Clean_from_Blocks"), level:"advanced", category:"compound" },
  squat_goblet: { n:"Goblet Squat",          p:["quads_rf","quads_vl","glutes"], s:["abs_upper","forearms"], req:["db","kb"], sets:3, r:12, w:20, gif:gif("Dumbbell_Squat"), level:"beginner", category:"compound" },
  bulgarian:    { n:"Bulgarian Split Squat", p:["quads_vl","quads_vm","glutes"], s:["hamstrings_bf","adductors"], req:["db","bench_flat"], sets:3, r:10, w:14, gif:gif("Dumbbell_Bench_Squat"), level:"intermediate", category:"compound" },
  lunge:        { n:"Walking Lunge",         p:["quads_vl","glutes"], s:["hamstrings_bf","adductors"], req:["db"], sets:3, r:12, w:12, gif:gif("Dumbbell_Lunges"), level:"beginner", category:"compound" },
  leg_press:    { n:"Leg Press",             p:["quads_rf","quads_vl","quads_vm","glutes"], s:["hamstrings_bf","adductors"], req:["leg_press"], sets:4, r:10, w:120, gif:gif("Leg_Press"), level:"beginner", category:"compound" },
  hack_squat:   { n:"Hack Squat",            p:["quads_vl","quads_vm","quads_rf"], s:["glutes","hamstrings_bf"], req:["hack"], sets:4, r:10, w:80, gif:gif("Hack_Squat"), level:"intermediate", category:"compound" },
  leg_ext:      { n:"Leg Extension",         p:["quads_rf","quads_vl","quads_vm"], s:[], req:["leg_ext"], sets:3, r:12, w:35, gif:gif("Leg_Extensions"), level:"beginner", category:"isolation" },
  step_up:      { n:"Step-Up",               p:["quads_vl","glutes"], s:["hamstrings_bf"], req:["db","box"], sets:3, r:10, w:10, gif:gif("Dumbbell_Step_Ups"), level:"beginner", category:"compound" },

  // ───── Hamstrings / Posterior ─────
  rdl:          { n:"Romanian Deadlift",     p:["hamstrings_bf","hamstrings_sm","glutes"], s:["lower_back","forearms"], req:["bb"], sets:4, r:8, w:60, gif:gif("Romanian_Deadlift"), level:"intermediate", category:"compound" },
  rdl_db:       { n:"DB Romanian Deadlift",  p:["hamstrings_bf","hamstrings_sm","glutes"], s:["lower_back"], req:["db"], sets:4, r:10, w:18, gif:gif("Dumbbell_Romanian_Deadlift"), level:"beginner", category:"compound" },
  good_morning: { n:"Good Morning",          p:["hamstrings_bf","glutes","lower_back"], s:[], req:["bb","rack"], sets:3, r:10, w:30, gif:gif("Good_Morning"), level:"intermediate", category:"compound" },
  leg_curl:     { n:"Lying Leg Curl",        p:["hamstrings_bf","hamstrings_sm"], s:[], req:["leg_curl"], sets:3, r:12, w:25, gif:gif("Lying_Leg_Curls"), level:"beginner", category:"isolation" },
  leg_curl_seat:{ n:"Seated Leg Curl",       p:["hamstrings_bf","hamstrings_sm"], s:[], req:["leg_curl"], sets:3, r:12, w:30, gif:gif("Seated_Leg_Curl"), level:"beginner", category:"isolation" },
  hip_thrust:   { n:"Hip Thrust",            p:["glutes"], s:["hamstrings_bf"], req:["bb","bench_flat"], sets:3, r:10, w:50, gif:gif("Hip_Thrust"), level:"intermediate", category:"compound" },
  glute_bridge: { n:"Glute Bridge",          p:["glutes"], s:["hamstrings_bf"], req:["bw"], sets:3, r:15, gif:gif("Butt_Lift_Bridge"), level:"beginner", category:"isolation" },
  cable_kick:   { n:"Cable Glute Kickback",  p:["glutes"], s:["hamstrings_bf"], req:["cable"], sets:3, r:12, w:10, gif:gif("Glute_Kickback"), level:"beginner", category:"isolation" },

  // ───── Calves ─────
  calf_stand:   { n:"Standing Calf Raise",   p:["calves_gastroc"], s:["calves_soleus"], req:["calf_m"], sets:4, r:15, w:40, gif:gif("Standing_Barbell_Calf_Raise"), level:"beginner", category:"isolation" },
  calf_seated:  { n:"Seated Calf Raise",     p:["calves_soleus"], s:["calves_gastroc"], req:["calf_m"], sets:4, r:15, w:25, gif:gif("Seated_Calf_Raise"), level:"beginner", category:"isolation" },
  calf_db:      { n:"DB Calf Raise",         p:["calves_gastroc"], s:["calves_soleus"], req:["db"], sets:3, r:20, w:14, gif:gif("Dumbbell_Seated_One-Leg_Calf_Raise"), level:"beginner", category:"isolation" },

  // ───── Core ─────
  plank:        { n:"Plank",                 p:["abs_upper","abs_lower"], s:["obliques","delts_front"], req:["bw","mat"], sets:3, r:60, gif:gif("Plank"), level:"beginner", category:"isolation" },
  crunch:       { n:"Crunch",                p:["abs_upper"], s:[], req:["bw","mat"], sets:3, r:20, gif:gif("Crunches"), level:"beginner", category:"isolation" },
  leg_raise:    { n:"Hanging Leg Raise",     p:["abs_lower"], s:["abs_upper","obliques"], req:["pullup"], sets:3, r:12, gif:gif("Hanging_Leg_Raise"), level:"intermediate", category:"isolation" },
  ab_wheel:     { n:"Ab Rollout",            p:["abs_upper","abs_lower"], s:["lats"], req:["bw"], sets:3, r:10, gif:gif("Roll_Out"), level:"advanced", category:"isolation" },
  rus_twist:    { n:"Russian Twist",         p:["obliques"], s:["abs_upper"], req:["bw","plate","med_ball"], sets:3, r:20, gif:gif("Seated_Russian_Twist_with_Weight"), level:"beginner", category:"isolation" },
  side_plank:   { n:"Side Plank",            p:["obliques"], s:["abs_upper","glutes"], req:["bw","mat"], sets:3, r:45, gif:gif("Side_Bridge"), level:"beginner", category:"isolation" },
  cable_crunch: { n:"Cable Crunch",          p:["abs_upper"], s:["obliques"], req:["cable"], sets:3, r:15, w:25, gif:gif("Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists"), level:"intermediate", category:"isolation" },

  // ───── Forearms ─────
  wrist_curl:   { n:"Wrist Curl",            p:["forearms"], s:[], req:["bb","db"], sets:3, r:15, w:10, gif:gif("Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench"), level:"beginner", category:"isolation" },
  rev_wrist:    { n:"Reverse Wrist Curl",    p:["forearms"], s:[], req:["bb","db"], sets:3, r:15, w:8, gif:gif("Palms-Down_Dumbbell_Wrist_Curl"), level:"beginner", category:"isolation" },
  farmer:       { n:"Farmer's Carry",        p:["forearms","traps_upper"], s:["abs_upper","glutes"], req:["db","kb"], sets:3, r:30, w:25, gif:gif("Farmers_Walk"), level:"intermediate", category:"compound" },

  // ───── Bodyweight / Functional ─────
  burpee:       { n:"Burpee",                p:["chest_mid","quads_rf","abs_upper"], s:["delts_front","triceps_lateral"], req:["bw"], sets:3, r:15, gif:gif("Burpee"), level:"intermediate", category:"compound" },
  mountain:     { n:"Mountain Climber",      p:["abs_upper","abs_lower"], s:["delts_front","quads_rf"], req:["bw","mat"], sets:3, r:30, gif:gif("Mountain_Climbers"), level:"beginner", category:"compound" },
  jump_squat:   { n:"Jump Squat",            p:["quads_vl","quads_vm","glutes"], s:["calves_gastroc"], req:["bw"], sets:3, r:12, gif:gif("Bodyweight_Squat"), level:"intermediate", category:"compound" },
  box_jump:     { n:"Box Jump",              p:["quads_vl","glutes","calves_gastroc"], s:["hamstrings_bf"], req:["box"], sets:4, r:8, gif:gif("Box_Jump_Multiple_Response"), level:"intermediate", category:"compound" },
  kb_swing:     { n:"Kettlebell Swing",      p:["glutes","hamstrings_bf"], s:["lower_back","delts_front","forearms"], req:["kb"], sets:3, r:20, w:16, gif:gif("Kettlebell_One-Legged_Deadlift"), level:"intermediate", category:"compound" },
  ring_row:     { n:"Ring Row",              p:["lats","rhomboids"], s:["biceps_long","rear_delts"], req:["rings","trx"], sets:3, r:12, gif:gif("Suspended_Row"), level:"beginner", category:"compound" },
  trx_press:    { n:"TRX Chest Press",       p:["chest_mid"], s:["delts_front","triceps_lateral"], req:["trx"], sets:3, r:12, gif:gif("Pushups"), level:"intermediate", category:"compound" },

  // ───── Cardio ─────
  treadmill:    { n:"Treadmill Run",         p:["quads_rf","calves_gastroc"], s:["glutes","hamstrings_bf"], req:["treadmill"], sets:1, r:20, gif:gif("Cable_Hip_Adduction"), level:"beginner", category:"cardio" },
  bike:         { n:"Stationary Bike",       p:["quads_rf","quads_vl"], s:["calves_gastroc","glutes"], req:["bike"], sets:1, r:20, gif:gif("Stationary_Bike_Run_v__2"), level:"beginner", category:"cardio" },
  rower:        { n:"Rowing Machine",        p:["lats","rhomboids","quads_rf"], s:["biceps_long","glutes"], req:["rower"], sets:1, r:15, gif:gif("Rowing_Stationary"), level:"beginner", category:"cardio" },
}

// ──────────────────────────── Built-in routines ────────────────────────────
export const ROUTINES: Routine[] = [
  {
    id: "sl",
    name: "Shoulder + Leg",
    tags: ["Shoulders", "Legs", "Glutes"],
    daysPerWeek: 1,
    exerciseIds: ["ohp", "lat_raise", "rear_fly", "squat", "rdl", "leg_press", "calf_stand"],
  },
  {
    id: "ct",
    name: "Chest + Tricep",
    tags: ["Chest", "Triceps"],
    daysPerWeek: 1,
    exerciseIds: ["bench", "bench_inc", "db_fly", "dip_tri", "ext_skull", "push_down"],
  },
  {
    id: "bb",
    name: "Back + Bicep",
    tags: ["Back", "Biceps"],
    daysPerWeek: 1,
    exerciseIds: ["deadlift", "pullup", "row_bb", "lat_pulldown", "curl_bb", "curl_ham"],
  },
]

// Priority order used when filtering by routine for a gym (most desired first).
export const ROUTINE_PRIORITY: Record<string, string[]> = {
  sl: [
    "ohp","ohp_db","arnold","shoulder_m","lat_raise","lat_raise_c","front_raise","rear_fly","upright_row","face_pull",
    "squat","squat_goblet","bulgarian","lunge","leg_press","hack_squat","leg_ext","rdl","rdl_db","leg_curl","hip_thrust","calf_stand","calf_seated","calf_db",
  ],
  ct: [
    "bench","bench_inc","bench_dec","db_bench","db_inc","db_fly","cable_fly","pec_deck","push_up","dip_chest","chest_press_m",
    "dip_tri","bench_close","push_diamond","push_down","push_rope","ext_oh","ext_skull","kickback",
  ],
  bb: [
    "deadlift","pullup","chinup","lat_pulldown","row_bb","row_db","row_cable","row_tbar","shrug_bb","shrug_db","face_pull","pullover","back_ext",
    "curl_bb","curl_db","curl_ham","curl_inc","curl_pre","curl_cable","curl_conc",
  ],
}

// Default sample data shown for first-time users (cleared on first real workout).
export const SAMPLE_HISTORY: HistoryEntry[] = [
  { id: "sample1", routine: "Chest + Tricep", routineId: "ct", date: new Date(Date.now() - 2*86400000).toISOString(), dur: 3600, vol: 4200, prsCount: 1, exs: ["Bench Press","Incline DB Press","Cable Fly"], sample: true },
  { id: "sample2", routine: "Back + Bicep",   routineId: "bb", date: new Date(Date.now() - 4*86400000).toISOString(), dur: 3300, vol: 3900, prsCount: 0, exs: ["Pull-Up","Bent-Over Row","DB Curl"], sample: true },
  { id: "sample3", routine: "Shoulder + Leg", routineId: "sl", date: new Date(Date.now() - 6*86400000).toISOString(), dur: 3900, vol: 5100, prsCount: 1, exs: ["Squat","OHP","Leg Press"], sample: true },
]
export const SAMPLE_PRS: Record<string, PR> = {
  bench:    { n:"Barbell Bench Press", w:80,  r:5, date:"Apr 18", e1rm:93,  sample:true },
  squat:    { n:"Barbell Back Squat",  w:100, r:5, date:"Apr 16", e1rm:117, sample:true },
  deadlift: { n:"Barbell Deadlift",    w:120, r:5, date:"Apr 14", e1rm:140, sample:true },
}
