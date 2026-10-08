// Numeric catalog keys are permanent identifiers; never recycle them.
export const muscleCatalog = [
  ["chest", "Dada", "Chest"],
  ["back", "Punggung", "Back"],
  ["shoulders", "Bahu", "Shoulders"],
  ["biceps", "Biseps", "Biceps"],
  ["triceps", "Triseps", "Triceps"],
  ["quads", "Paha depan", "Quadriceps"],
  ["hamstrings", "Paha belakang", "Hamstrings"],
  ["glutes", "Pantat", "Glutes"],
  ["calves", "Betis", "Calves"],
  ["abs", "Perut", "Abs"],
] as const
export type MuscleId = (typeof muscleCatalog)[number][0]
export const equipmentNames = {
  barbell: ["Barbell", "Barbell"],
  dumbbell: ["Dumbbell", "Dumbbell"],
  machine: ["Mesin", "Machine"],
  cable: ["Kabel", "Cable"],
  bodyweight: ["Berat badan", "Bodyweight"],
  band: ["Resistance band", "Resistance band"],
  kettlebell: ["Kettlebell", "Kettlebell"],
  smith: ["Smith machine", "Smith machine"],
  other: ["Alat lainnya", "Other equipment"],
} as const
export type Equipment = keyof typeof equipmentNames

// key | display name | equipment | primary muscle | secondary muscles
// The first eight names and IDs preserve the original catalog and workout history.
const data = `
1|Bench Press|barbell|chest|triceps,shoulders
2|Squat|barbell|quads|glutes
3|Lat Pulldown|cable|back|biceps
4|Shoulder Press|dumbbell|shoulders|triceps
5|Bicep Curl|dumbbell|biceps|
6|Romanian Deadlift|barbell|hamstrings|glutes,back
7|Plank|bodyweight|abs|
8|Calf Raise|bodyweight|calves|
100|Incline Barbell Bench Press|barbell|chest|triceps,shoulders
101|Decline Barbell Bench Press|barbell|chest|triceps
102|Dumbbell Bench Press|dumbbell|chest|triceps,shoulders
103|Incline Dumbbell Press|dumbbell|chest|triceps,shoulders
104|Decline Dumbbell Press|dumbbell|chest|triceps
105|Dumbbell Floor Press|dumbbell|chest|triceps
106|Barbell Floor Press|barbell|chest|triceps
107|Single-Arm Dumbbell Bench Press|dumbbell|chest|triceps,abs
108|Dumbbell Squeeze Press|dumbbell|chest|triceps
109|Machine Chest Press|machine|chest|triceps,shoulders
110|Incline Machine Chest Press|machine|chest|triceps
111|Smith Machine Bench Press|smith|chest|triceps
112|Smith Machine Incline Press|smith|chest|triceps,shoulders
113|Dumbbell Fly|dumbbell|chest|
114|Incline Dumbbell Fly|dumbbell|chest|
115|Cable Chest Fly|cable|chest|shoulders
116|Low-to-High Cable Fly|cable|chest|shoulders
117|High-to-Low Cable Fly|cable|chest|
118|Pec Deck Fly|machine|chest|
119|Push-Up|bodyweight|chest|triceps,shoulders
120|Incline Push-Up|bodyweight|chest|triceps
121|Decline Push-Up|bodyweight|chest|triceps,shoulders
122|Knee Push-Up|bodyweight|chest|triceps
123|Chest Dip|bodyweight|chest|triceps,shoulders
200|Pull-Up|bodyweight|back|biceps
201|Chin-Up|bodyweight|back|biceps
202|Neutral-Grip Pull-Up|bodyweight|back|biceps
203|Assisted Pull-Up|machine|back|biceps
204|Band-Assisted Pull-Up|band|back|biceps
205|Wide-Grip Lat Pulldown|cable|back|biceps
206|Close-Grip Lat Pulldown|cable|back|biceps
207|Reverse-Grip Lat Pulldown|cable|back|biceps
208|Single-Arm Lat Pulldown|cable|back|biceps
209|Straight-Arm Cable Pulldown|cable|back|
210|Barbell Bent-Over Row|barbell|back|biceps
211|Pendlay Row|barbell|back|biceps
212|Underhand Barbell Row|barbell|back|biceps
213|T-Bar Row|machine|back|biceps
214|One-Arm Dumbbell Row|dumbbell|back|biceps
215|Chest-Supported Dumbbell Row|dumbbell|back|biceps
216|Seated Cable Row|cable|back|biceps
217|Wide-Grip Seated Cable Row|cable|back|shoulders,biceps
218|Single-Arm Cable Row|cable|back|biceps
219|Machine Row|machine|back|biceps
220|Inverted Row|bodyweight|back|biceps
221|Resistance Band Row|band|back|biceps
222|Machine Pullover|machine|back|
223|Back Extension|other|back|glutes,hamstrings
300|Barbell Overhead Press|barbell|shoulders|triceps
301|Seated Dumbbell Shoulder Press|dumbbell|shoulders|triceps
302|Arnold Press|dumbbell|shoulders|triceps
303|Machine Shoulder Press|machine|shoulders|triceps
304|Smith Machine Shoulder Press|smith|shoulders|triceps
305|Single-Arm Landmine Press|barbell|shoulders|triceps,chest
306|Single-Arm Kettlebell Press|kettlebell|shoulders|triceps
307|Dumbbell Lateral Raise|dumbbell|shoulders|
308|Cable Lateral Raise|cable|shoulders|
309|Machine Lateral Raise|machine|shoulders|
310|Lean-Away Cable Lateral Raise|cable|shoulders|
311|Dumbbell Front Raise|dumbbell|shoulders|
312|Cable Front Raise|cable|shoulders|
313|Dumbbell Rear Delt Fly|dumbbell|shoulders|back
314|Reverse Pec Deck|machine|shoulders|back
315|Cable Rear Delt Fly|cable|shoulders|back
316|Face Pull|cable|shoulders|back
317|Band Pull-Apart|band|shoulders|back
318|Pike Push-Up|bodyweight|shoulders|triceps
319|Dumbbell Shrug|dumbbell|back|shoulders
400|Barbell Curl|barbell|biceps|
401|EZ-Bar Curl|barbell|biceps|
402|Alternating Dumbbell Curl|dumbbell|biceps|
403|Hammer Curl|dumbbell|biceps|
404|Cross-Body Hammer Curl|dumbbell|biceps|
405|Incline Dumbbell Curl|dumbbell|biceps|
406|Concentration Curl|dumbbell|biceps|
407|EZ-Bar Preacher Curl|barbell|biceps|
408|Dumbbell Preacher Curl|dumbbell|biceps|
409|Machine Preacher Curl|machine|biceps|
410|Cable Curl|cable|biceps|
411|Rope Cable Hammer Curl|cable|biceps|
412|High Cable Curl|cable|biceps|
413|Bayesian Cable Curl|cable|biceps|
414|Spider Curl|dumbbell|biceps|
415|Reverse EZ-Bar Curl|barbell|biceps|
416|Zottman Curl|dumbbell|biceps|
417|Resistance Band Curl|band|biceps|
500|Rope Triceps Pushdown|cable|triceps|
501|Straight-Bar Triceps Pushdown|cable|triceps|
502|V-Bar Triceps Pushdown|cable|triceps|
503|Reverse-Grip Triceps Pushdown|cable|triceps|
504|Single-Arm Cable Pushdown|cable|triceps|
505|Overhead Cable Triceps Extension|cable|triceps|
506|Overhead Dumbbell Triceps Extension|dumbbell|triceps|
507|Single-Arm Overhead Triceps Extension|dumbbell|triceps|
508|EZ-Bar Skull Crusher|barbell|triceps|
509|Dumbbell Skull Crusher|dumbbell|triceps|
510|Dumbbell Triceps Kickback|dumbbell|triceps|
511|Cable Triceps Kickback|cable|triceps|
512|Close-Grip Bench Press|barbell|triceps|chest,shoulders
513|Diamond Push-Up|bodyweight|triceps|chest
514|Triceps Dip|bodyweight|triceps|chest,shoulders
515|Assisted Triceps Dip|machine|triceps|chest
516|Machine Triceps Extension|machine|triceps|
517|Resistance Band Triceps Pushdown|band|triceps|
600|Front Squat|barbell|quads|glutes
601|Goblet Squat|kettlebell|quads|glutes
602|Dumbbell Goblet Squat|dumbbell|quads|glutes
603|Bodyweight Squat|bodyweight|quads|glutes
604|Smith Machine Squat|smith|quads|glutes
605|Hack Squat|machine|quads|glutes
606|Leg Press|machine|quads|glutes
607|Single-Leg Press|machine|quads|glutes
608|Leg Extension|machine|quads|
609|Single-Leg Extension|machine|quads|
610|Bulgarian Split Squat|dumbbell|quads|glutes
611|Bodyweight Split Squat|bodyweight|quads|glutes
612|Dumbbell Split Squat|dumbbell|quads|glutes
613|Walking Lunge|dumbbell|quads|glutes
614|Reverse Lunge|dumbbell|quads|glutes
615|Forward Lunge|bodyweight|quads|glutes
616|Lateral Lunge|bodyweight|quads|glutes
617|Dumbbell Step-Up|dumbbell|quads|glutes
618|Bodyweight Step-Up|bodyweight|quads|glutes
619|Heel-Elevated Goblet Squat|dumbbell|quads|glutes
620|Landmine Squat|barbell|quads|glutes
621|Box Squat|barbell|quads|glutes
700|Dumbbell Romanian Deadlift|dumbbell|hamstrings|glutes,back
701|Single-Leg Romanian Deadlift|dumbbell|hamstrings|glutes,abs
702|B-Stance Romanian Deadlift|dumbbell|hamstrings|glutes
703|Smith Machine Romanian Deadlift|smith|hamstrings|glutes
704|Kettlebell Romanian Deadlift|kettlebell|hamstrings|glutes
705|Barbell Good Morning|barbell|hamstrings|glutes,back
706|Seated Leg Curl|machine|hamstrings|calves
707|Lying Leg Curl|machine|hamstrings|calves
708|Standing Leg Curl|machine|hamstrings|
709|Single-Leg Seated Curl|machine|hamstrings|calves
710|Nordic Hamstring Curl|bodyweight|hamstrings|
711|Slider Leg Curl|other|hamstrings|glutes
712|Stability Ball Leg Curl|other|hamstrings|glutes
713|Resistance Band Leg Curl|band|hamstrings|
800|Barbell Hip Thrust|barbell|glutes|hamstrings
801|Dumbbell Hip Thrust|dumbbell|glutes|hamstrings
802|Smith Machine Hip Thrust|smith|glutes|hamstrings
803|Machine Hip Thrust|machine|glutes|hamstrings
804|Glute Bridge|bodyweight|glutes|hamstrings
805|Single-Leg Glute Bridge|bodyweight|glutes|hamstrings
806|Barbell Glute Bridge|barbell|glutes|hamstrings
807|Cable Glute Kickback|cable|glutes|
808|Machine Glute Kickback|machine|glutes|
809|Donkey Kick|bodyweight|glutes|
810|Fire Hydrant|bodyweight|glutes|
811|Seated Hip Abduction|machine|glutes|
812|Standing Cable Hip Abduction|cable|glutes|
813|Banded Lateral Walk|band|glutes|
814|Clamshell|band|glutes|
815|Cable Pull-Through|cable|glutes|hamstrings
816|Sumo Deadlift|barbell|glutes|quads,hamstrings,back
817|Conventional Deadlift|barbell|glutes|hamstrings,quads,back
900|Standing Machine Calf Raise|machine|calves|
901|Seated Calf Raise|machine|calves|
902|Leg Press Calf Raise|machine|calves|
903|Smith Machine Calf Raise|smith|calves|
904|Dumbbell Calf Raise|dumbbell|calves|
905|Single-Leg Calf Raise|bodyweight|calves|
906|Single-Leg Dumbbell Calf Raise|dumbbell|calves|
907|Seated Dumbbell Calf Raise|dumbbell|calves|
908|Donkey Calf Raise|machine|calves|
909|Resistance Band Calf Raise|band|calves|
1000|Crunch|bodyweight|abs|
1001|Reverse Crunch|bodyweight|abs|
1002|Bicycle Crunch|bodyweight|abs|
1003|Cable Crunch|cable|abs|
1004|Machine Ab Crunch|machine|abs|
1005|Hanging Knee Raise|bodyweight|abs|
1006|Hanging Leg Raise|bodyweight|abs|
1007|Captain's Chair Knee Raise|other|abs|
1008|Lying Leg Raise|bodyweight|abs|
1009|Dead Bug|bodyweight|abs|
1010|Bird Dog|bodyweight|abs|back,glutes
1011|Russian Twist|bodyweight|abs|
1012|Cable Wood Chop|cable|abs|
1013|Pallof Press|cable|abs|
1014|Band Pallof Press|band|abs|
1015|Ab Wheel Rollout|other|abs|shoulders
1016|Stability Ball Rollout|other|abs|
1017|Mountain Climber|bodyweight|abs|shoulders
1018|Plank Shoulder Tap|bodyweight|abs|shoulders
1019|Plank Walk-Up|bodyweight|abs|triceps,shoulders
`

export const exerciseCatalog = data
  .trim()
  .split("\n")
  .map((line) => {
    const [key, name, equipmentCode, primaryCode, secondaryCodes] =
      line.split("|")
    const equipment = equipmentCode as Equipment
    const primary = primaryCode as MuscleId
    const secondary = (
      secondaryCodes ? secondaryCodes.split(",") : []
    ) as MuscleId[]
    const muscle = muscleCatalog.find(([id]) => id === primary)
    if (
      !muscle ||
      !equipmentNames[equipment] ||
      !/^\d+$/.test(key) ||
      secondary.some((id) => !muscleCatalog.some((m) => m[0] === id))
    )
      throw new Error(`Invalid catalog row: ${name}`)
    return {
      id: "00000000-0000-4000-8000-" + key.padStart(12, "0"),
      name,
      equipment,
      primary,
      secondary,
      description: `${name}: latihan dengan ${equipmentNames[
        equipment
      ][0].toLowerCase()} yang berfokus pada ${muscle[1].toLowerCase()}.`,
      description_en: `${name}: a ${equipmentNames[
        equipment
      ][1].toLowerCase()} exercise focusing on ${muscle[2].toLowerCase()}.`,
    }
  })
