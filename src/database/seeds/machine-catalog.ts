// Original schematic illustrations, deliberately independent of any manufacturer's model.
function illustration(kind: string) {
  const stack =
    '<rect x="215" y="30" width="40" height="150" rx="6"/><path d="M215 65h40m-40 20h40m-40 20h40m-40 20h40m-40 20h40"/>';
  const shapes: Record<string, string> = {
    seated: `${stack}<path d="M75 200V100m0 65h90v35M65 95h20v65H65zM85 150h65v15H85zM90 80l65-35 35 60M90 80h55"/>`,
    cable: `${stack}<path d="M45 200V30h195M60 40v70l35 35M215 40v70l-35 35M85 145h20m65 0h20"/><circle cx="60" cy="40" r="9"/><circle cx="215" cy="40" r="9"/>`,
    smith:
      '<path d="M55 200V30h200v170M75 35v150m160-150v150M45 90h220M105 160h90m-75 0v40m60-40v40"/><rect x="45" y="75" width="15" height="30"/><rect x="250" y="75" width="15" height="30"/>',
    legpress:
      '<path d="M45 185l65-25 55-100m-110 135h150M65 160l30-40 35 25M110 155l65-105m-20-10l45 20M75 125l15-20"/><circle cx="175" cy="100" r="23"/>',
    lying: `${stack}<path d="M40 140h115l45-30M55 140v60m95-60v60m15-70l35 30"/><rect x="35" y="125" width="125" height="15" rx="5"/><circle cx="200" cy="160" r="12"/>`,
    assisted: `${stack}<path d="M55 200V30h140v170M45 30h160M95 130h65m-45 0v70M55 100h30m110 0h-30"/>`,
    standing: `${stack}<path d="M65 200V40h80v160M55 70h110m-80 10v65m-20 35h100M90 150h50"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 230"><rect width="300" height="230" rx="20" fill="#eef5f1"/><g fill="none" stroke="#245d47" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${
    shapes[kind] || shapes.seated
  }<path d="M25 205h250"/></g></svg>`;
}

type Guide = {
  id: string;
  name: string;
  name_en: string;
  image_url: null;
  image_svg: string;
  instructions: string[];
  instructions_en: string[];
  exerciseIds: string[];
};
function guide(
  id: string,
  name: string,
  name_en: string,
  kind: string,
  keys: number[],
  steps: readonly (readonly [string, string])[],
): Guide {
  return {
    id,
    name,
    name_en,
    image_url: null,
    image_svg: illustration(kind),
    instructions: steps.map((s) => s[0]),
    instructions_en: steps.map((s) => s[1]),
    exerciseIds: keys.map(
      (k) => "00000000-0000-4000-8000-" + String(k).padStart(12, "0"),
    ),
  };
}
const load = [
  "Pilih beban ringan untuk percobaan. Pasang pin atau pengunci pelat sepenuhnya sebelum bergerak.",
  "Start with a light trial load. Fully insert the weight pin or secure the plates before moving.",
] as const;
const finish = [
  "Kembalikan beban secara terkontrol ke posisi awal sebelum melepas pegangan atau turun dari mesin.",
  "Return the load under control to its starting position before releasing the handles or leaving the machine.",
] as const;
export const machineCatalog: Guide[] = [
  guide(
    "chest-press",
    "Mesin chest press",
    "Chest press machine",
    "seated",
    [109, 110],
    [
      load,
      [
        "Atur kursi agar pegangan sesuai tinggi dada untuk variasi flat atau incline. Tempelkan punggung pada bantalan.",
        "Adjust the seat so the handles suit chest height for the flat or incline variation. Keep your back against the pad.",
      ],
      [
        "Pegang gagang, dorong ke depan secara terkontrol, lalu kembali tanpa membanting tumpukan beban.",
        "Grip the handles, press forward with control, then return without slamming the weight stack.",
      ],
      finish,
    ],
  ),
  guide(
    "pec-deck",
    "Mesin pec deck",
    "Pec deck machine",
    "seated",
    [118],
    [
      load,
      [
        "Atur kursi dan posisi lengan mesin agar pegangan setinggi dada. Duduk dengan punggung tersangga.",
        "Set the seat and machine arms so the handles are at chest height. Sit with your back supported.",
      ],
      [
        "Dengan siku sedikit menekuk, rapatkan lengan di depan dada lalu buka kembali secara terkontrol.",
        "With a slight elbow bend, bring the arms together in front of your chest and open them under control.",
      ],
      finish,
    ],
  ),
  guide(
    "reverse-pec-deck",
    "Mesin reverse pec deck",
    "Reverse pec deck machine",
    "seated",
    [314],
    [
      load,
      [
        "Pilih posisi reverse fly pada lengan mesin. Duduk menghadap bantalan dengan dada tersangga dan pegangan setinggi bahu.",
        "Select the reverse fly position on the machine arms. Face the pad with your chest supported and handles at shoulder height.",
      ],
      [
        "Buka kedua lengan ke samping tanpa mengangkat bahu, lalu kembali secara terkontrol.",
        "Open both arms out to the sides without shrugging, then return with control.",
      ],
      finish,
    ],
  ),
  guide(
    "lat-pulldown",
    "Mesin lat pulldown",
    "Lat pulldown station",
    "cable",
    [3, 205, 206, 207, 208],
    [
      load,
      [
        "Pasang handle sesuai variasi. Atur bantalan paha supaya kaki tetap stabil saat duduk.",
        "Attach the handle for the variation. Set the thigh pad to hold your legs steady when seated.",
      ],
      [
        "Tarik handle ke arah dada depan dengan badan stabil. Kembalikan ke atas secara terkontrol.",
        "Pull the handle toward the front of your chest with a stable torso. Return upward under control.",
      ],
      finish,
    ],
  ),
  guide(
    "cable-row",
    "Mesin seated cable row",
    "Seated cable row station",
    "cable",
    [216, 217, 218],
    [
      load,
      [
        "Pasang handle yang sesuai, duduk dengan kaki pada penyangga dan lutut sedikit menekuk.",
        "Attach the appropriate handle and sit with your feet supported and knees slightly bent.",
      ],
      [
        "Tarik handle ke arah badan tanpa mengayunkan punggung. Luruskan lengan kembali secara terkontrol.",
        "Pull the handle toward your torso without swinging your back. Extend the arms again under control.",
      ],
      finish,
    ],
  ),
  guide(
    "functional-cable",
    "Mesin kabel adjustable",
    "Adjustable cable station",
    "cable",
    [
      115, 116, 117, 209, 308, 310, 312, 315, 316, 410, 411, 412, 413, 500, 501,
      502, 503, 504, 505, 511, 807, 812, 815, 1003, 1012, 1013,
    ],
    [
      load,
      [
        "Atur tinggi pulley ketika beban diam. Kunci pengatur tinggi dan kaitkan handle, rope, atau ankle strap sesuai latihan.",
        "Adjust pulley height while the load is stationary. Lock the height adjustment and attach the handle, rope, or ankle strap for the exercise.",
      ],
      [
        "Posisikan tubuh mengikuti variasi latihan. Pastikan kabel tidak menggesek tubuh dan area gerakan bebas.",
        "Position your body for the exercise variation. Keep the cable clear of your body and leave the movement area unobstructed.",
      ],
      [
        "Gerakkan attachment secara terkontrol dan kembali perlahan; jangan melepasnya saat tumpukan beban masih terangkat.",
        "Move the attachment with control and return slowly; do not release it while the weight stack is lifted.",
      ],
      finish,
    ],
  ),
  guide(
    "smith",
    "Smith machine",
    "Smith machine",
    "smith",
    [111, 112, 304, 604, 703, 802, 903],
    [
      load,
      [
        "Atur safety stop sesuai titik bawah gerakan, lalu posisikan bangku atau kaki untuk variasi latihan sebelum membuka kait bar.",
        "Set the safety stops for the bottom of the movement, then position the bench or your feet for the exercise before unhooking the bar.",
      ],
      [
        "Kenali arah putaran kait bar dengan beban ringan. Buka kait hanya setelah posisi tubuh stabil.",
        "Learn the bar hook rotation with a light load. Unhook only once your body position is stable.",
      ],
      [
        "Selesaikan gerakan pada jalur bar, kemudian kaitkan bar kembali dan pastikan terkunci sebelum meninggalkan mesin.",
        "Complete the movement along the bar track, then rehook the bar and confirm it is locked before leaving the machine.",
      ],
    ],
  ),
  guide(
    "assisted-pull-dip",
    "Mesin assisted pull-up / dip",
    "Assisted pull-up / dip machine",
    "assisted",
    [203, 515],
    [
      [
        "Pada mesin counterweight, beban bantuan lebih besar biasanya membuat latihan lebih ringan. Periksa diagram pada mesin untuk memilih bantuan.",
        "On a counterweight machine, more assistance generally makes the movement easier. Check the machine diagram when selecting assistance.",
      ],
      [
        "Naik memakai pijakan dan letakkan lutut atau kaki pada bantalan sesuai desain mesin. Pegang handle pull-up atau dip yang sesuai.",
        "Use the steps to mount and place your knees or feet on the pad as the machine requires. Grip the appropriate pull-up or dip handles.",
      ],
      [
        "Lakukan gerakan terkontrol tanpa memantul pada bantalan. Kembali ke posisi awal dan turun memakai pijakan.",
        "Move with control without bouncing on the pad. Return to the starting position and use the steps to dismount.",
      ],
    ],
  ),
  guide(
    "tbar-row",
    "Mesin T-bar row",
    "T-bar row machine",
    "standing",
    [213],
    [
      load,
      [
        "Atur bantalan dada jika tersedia, posisikan kaki pada platform, lalu pegang handle dengan punggung stabil.",
        "Adjust the chest pad if available, place your feet on the platform and grip the handles with a stable back.",
      ],
      [
        "Tarik handle ke arah badan, lalu turunkan beban terkontrol tanpa mengayun.",
        "Pull the handles toward your torso, then lower the load under control without swinging.",
      ],
      finish,
    ],
  ),
  guide(
    "machine-row",
    "Mesin row",
    "Row machine",
    "seated",
    [219],
    [
      load,
      [
        "Atur kursi dan bantalan dada agar handle mudah dijangkau. Tahan dada pada bantalan jika tersedia.",
        "Adjust the seat and chest pad so you can reach the handles. Keep your chest against the pad if provided.",
      ],
      [
        "Tarik siku ke belakang, lalu kembali secara terkontrol tanpa mengangkat badan dari kursi.",
        "Draw your elbows back, then return under control without lifting your body off the seat.",
      ],
      finish,
    ],
  ),
  guide(
    "pullover",
    "Mesin pullover",
    "Pullover machine",
    "seated",
    [222],
    [
      load,
      [
        "Atur kursi dan bantalan lengan sesuai diagram mesin. Gunakan pedal awal jika mesin memilikinya.",
        "Set the seat and arm pads according to the machine diagram. Use the starting pedal if the machine has one.",
      ],
      [
        "Tarik lengan mesin ke arah badan dengan batang tubuh stabil, lalu kembali perlahan.",
        "Draw the machine arms toward your torso while keeping it stable, then return slowly.",
      ],
      finish,
    ],
  ),
  guide(
    "shoulder-press",
    "Mesin shoulder press",
    "Shoulder press machine",
    "seated",
    [303],
    [
      load,
      [
        "Atur kursi agar handle mulai dekat tinggi bahu. Duduk dengan punggung dan kaki tersangga.",
        "Adjust the seat so the handles start near shoulder height. Sit with your back and feet supported.",
      ],
      [
        "Dorong handle ke atas tanpa mengayun badan, lalu turunkan secara terkontrol.",
        "Press the handles upward without swinging your torso, then lower them under control.",
      ],
      finish,
    ],
  ),
  guide(
    "lateral-raise",
    "Mesin lateral raise",
    "Lateral raise machine",
    "seated",
    [309],
    [
      load,
      [
        "Atur kursi dan bantalan lengan mengikuti diagram mesin. Posisi bahu sejajar dengan poros gerak bila ditandai.",
        "Adjust the seat and arm pads following the machine diagram. Align your shoulders with the movement pivot where marked.",
      ],
      [
        "Angkat lengan ke samping tanpa mengangkat bahu ke telinga, lalu turunkan perlahan.",
        "Raise the arms out to the sides without shrugging toward your ears, then lower slowly.",
      ],
      finish,
    ],
  ),
  guide(
    "preacher-curl",
    "Mesin preacher curl",
    "Preacher curl machine",
    "seated",
    [409],
    [
      load,
      [
        "Atur kursi agar lengan atas tersangga bantalan dan siku sesuai poros mesin. Pegang handle.",
        "Set the seat so your upper arms rest on the pad and elbows align with the machine pivot. Grip the handles.",
      ],
      [
        "Tekuk siku untuk mengangkat handle tanpa mengangkat lengan atas dari bantalan. Kembali perlahan.",
        "Bend your elbows to lift the handles without lifting your upper arms from the pad. Return slowly.",
      ],
      finish,
    ],
  ),
  guide(
    "triceps-extension",
    "Mesin triceps extension",
    "Triceps extension machine",
    "seated",
    [516],
    [
      load,
      [
        "Atur kursi dan penyangga lengan sesuai poros siku pada diagram mesin.",
        "Set the seat and arm supports to match the elbow pivot shown on the machine diagram.",
      ],
      [
        "Luruskan siku dengan lengan atas tetap tersangga, lalu tekuk kembali secara terkontrol.",
        "Extend the elbows with your upper arms supported, then bend them again under control.",
      ],
      finish,
    ],
  ),
  guide(
    "hack-squat",
    "Mesin hack squat",
    "Hack squat machine",
    "legpress",
    [605],
    [
      load,
      [
        "Letakkan punggung dan bahu pada bantalan, kaki pada platform. Atur safety stop dan kenali tuas penguncinya sebelum membuka sled.",
        "Place your back and shoulders against the pads with feet on the platform. Set the safety stops and identify the locking handles before releasing the sled.",
      ],
      [
        "Turunkan sled dengan lutut mengikuti arah kaki dan punggung tetap tersangga, lalu dorong kembali.",
        "Lower the sled with your knees tracking in line with your feet and back supported, then press back up.",
      ],
      [
        "Pasang kembali pengunci sled dan pastikan terkunci sebelum turun.",
        "Re-engage the sled locks and confirm they are secure before dismounting.",
      ],
    ],
  ),
  guide(
    "leg-press",
    "Mesin leg press",
    "Leg press machine",
    "legpress",
    [606, 607, 902],
    [
      load,
      [
        "Atur kursi agar panggul tetap tersangga. Letakkan kaki pada platform dan kenali pengunci serta safety stop bila tersedia.",
        "Adjust the seat so your hips stay supported. Place your feet on the platform and locate any locks and safety stops.",
      ],
      [
        "Untuk press, tekuk lalu luruskan lutut secara terkontrol tanpa mengunci keras. Untuk calf raise, gerakkan pergelangan kaki dengan lutut stabil.",
        "For presses, bend and extend the knees under control without forcefully locking them. For calf raises, move at the ankles with stable knees.",
      ],
      [
        "Kembalikan mesin ke posisi aman dan pasang pengunci bila tersedia sebelum turun.",
        "Return the machine to its safe position and engage any locks before dismounting.",
      ],
    ],
  ),
  guide(
    "leg-extension",
    "Mesin leg extension",
    "Leg extension machine",
    "seated",
    [608, 609],
    [
      load,
      [
        "Atur sandaran agar lutut sejajar poros mesin. Letakkan roller di bagian bawah tulang kering, di atas pergelangan kaki.",
        "Set the backrest so your knees align with the machine pivot. Place the roller on the lower shins, above the ankles.",
      ],
      [
        "Pegang handle, luruskan lutut secara terkontrol, lalu turunkan tanpa membanting beban.",
        "Hold the handles, extend the knees under control, then lower without slamming the load.",
      ],
      finish,
    ],
  ),
  guide(
    "seated-leg-curl",
    "Mesin seated leg curl",
    "Seated leg curl machine",
    "seated",
    [706, 709],
    [
      load,
      [
        "Atur sandaran agar lutut sejajar poros. Posisikan roller bawah di dekat tumit dan bantalan paha agar kaki tidak terangkat.",
        "Set the backrest to align your knees with the pivot. Position the lower roller near the heels and the thigh pad to keep your legs down.",
      ],
      [
        "Tekuk lutut untuk menarik roller ke bawah dan belakang, lalu kembali perlahan.",
        "Bend the knees to draw the roller down and back, then return slowly.",
      ],
      finish,
    ],
  ),
  guide(
    "lying-leg-curl",
    "Mesin lying leg curl",
    "Lying leg curl machine",
    "lying",
    [707],
    [
      load,
      [
        "Berbaring tengkurap dengan lutut sesuai poros mesin. Atur roller pada belakang tungkai bawah, dekat tumit.",
        "Lie face down with your knees aligned to the machine pivot. Set the roller behind the lower legs, near the heels.",
      ],
      [
        "Tekuk lutut tanpa mengangkat panggul dari bantalan, lalu turunkan roller secara terkontrol.",
        "Bend your knees without lifting your hips from the pad, then lower the roller under control.",
      ],
      finish,
    ],
  ),
  guide(
    "standing-leg-curl",
    "Mesin standing leg curl",
    "Standing leg curl machine",
    "standing",
    [708],
    [
      load,
      [
        "Atur roller pada belakang tungkai bawah dan gunakan penyangga tubuh. Sejajarkan lutut kaki yang bekerja dengan poros mesin.",
        "Set the roller behind the lower leg and use the body support. Align the working knee with the machine pivot.",
      ],
      [
        "Tekuk lutut satu kaki tanpa mengayun badan, lalu turunkan perlahan sebelum berganti kaki.",
        "Bend one knee without swinging your torso, then lower slowly before changing legs.",
      ],
      finish,
    ],
  ),
  guide(
    "hip-thrust",
    "Mesin hip thrust",
    "Hip thrust machine",
    "lying",
    [803],
    [
      load,
      [
        "Atur sandaran dan pasang sabuk atau bantalan di lipatan panggul sesuai desain mesin. Letakkan kaki stabil pada platform.",
        "Adjust the back support and position the belt or pad across the hip crease as the machine requires. Set your feet firmly on the platform.",
      ],
      [
        "Dorong panggul ke atas dengan badan stabil tanpa melengkungkan punggung berlebihan. Turunkan perlahan.",
        "Drive your hips upward with a stable torso without excessively arching your back. Lower slowly.",
      ],
      finish,
    ],
  ),
  guide(
    "glute-kickback",
    "Mesin glute kickback",
    "Glute kickback machine",
    "standing",
    [808],
    [
      load,
      [
        "Atur penyangga badan dan pijakan atau bantalan kaki mengikuti diagram mesin. Tahan badan stabil.",
        "Set the body support and footplate or leg pad according to the machine diagram. Keep your torso stable.",
      ],
      [
        "Dorong satu kaki ke belakang tanpa mengayun punggung, lalu kembalikan terkontrol sebelum berganti kaki.",
        "Drive one leg backward without swinging your back, then return with control before switching legs.",
      ],
      finish,
    ],
  ),
  guide(
    "hip-abduction",
    "Mesin hip abduction",
    "Hip abduction machine",
    "seated",
    [811],
    [
      load,
      [
        "Duduk bersandar, atur posisi awal mesin, lalu letakkan bantalan pada sisi luar paha.",
        "Sit against the backrest, set the starting position and place the pads against the outside of your thighs.",
      ],
      [
        "Buka kedua paha secara terkontrol tanpa memantulkan bantalan, lalu rapatkan perlahan.",
        "Open both thighs with control without bouncing the pads, then bring them together slowly.",
      ],
      finish,
    ],
  ),
  guide(
    "standing-calf",
    "Mesin standing calf raise",
    "Standing calf raise machine",
    "standing",
    [900],
    [
      load,
      [
        "Atur bantalan bahu dan letakkan bagian depan telapak kaki pada platform, dengan tumit bebas bergerak.",
        "Adjust the shoulder pads and place the balls of your feet on the platform with heels free to move.",
      ],
      [
        "Angkat tumit, lalu turunkan terkontrol tanpa memantul atau mengubah posisi lutut secara berlebihan.",
        "Raise your heels, then lower with control without bouncing or excessively changing knee position.",
      ],
      finish,
    ],
  ),
  guide(
    "seated-calf",
    "Mesin seated calf raise",
    "Seated calf raise machine",
    "seated",
    [901],
    [
      load,
      [
        "Atur bantalan di atas paha dekat lutut. Letakkan bagian depan telapak kaki pada platform dan kenali tuas pengunci.",
        "Set the pad over your thighs near the knees. Place the balls of your feet on the platform and locate the locking lever.",
      ],
      [
        "Lepaskan pengunci sesuai petunjuk mesin, angkat dan turunkan tumit terkontrol, lalu pasang kembali pengunci sebelum turun.",
        "Release the lock as instructed on the machine, raise and lower your heels under control, then re-engage the lock before dismounting.",
      ],
    ],
  ),
  guide(
    "donkey-calf",
    "Mesin donkey calf raise",
    "Donkey calf raise machine",
    "standing",
    [908],
    [
      load,
      [
        "Atur bantalan pada panggul dan sangga badan dengan handle. Letakkan bagian depan telapak kaki pada platform.",
        "Set the pad over your hips and support your torso using the handles. Place the balls of your feet on the platform.",
      ],
      [
        "Angkat dan turunkan tumit perlahan dengan panggul serta punggung stabil.",
        "Raise and lower your heels slowly while keeping your hips and back stable.",
      ],
      finish,
    ],
  ),
  guide(
    "ab-crunch",
    "Mesin abdominal crunch",
    "Abdominal crunch machine",
    "seated",
    [1004],
    [
      load,
      [
        "Atur kursi dan bantalan sesuai diagram mesin. Tempatkan kaki dan pegang handle yang disediakan.",
        "Set the seat and pads according to the machine diagram. Position your feet and grip the provided handles.",
      ],
      [
        "Tekuk batang tubuh dengan gerakan terkontrol, lalu kembali perlahan tanpa menarik leher.",
        "Flex your torso with control, then return slowly without pulling on your neck.",
      ],
      finish,
    ],
  ),
];
