# Gym Tracking API

Server NestJS + PostgreSQL, terpisah dari aplikasi React Native ../Gym-tracking.
Client adalah user dengan role CLIENT; trainer juga tersimpan dalam users.

## Menjalankan

```powershell
npm install
docker compose up -d
Copy-Item .env.example .env
npm run dev
```

JWT_SECRET harus acak minimal 32 karakter. DATABASE_URL menuju PostgreSQL. PORT default 3000. WEB_ORIGIN hanya untuk akses browser; React Native tidak memakai pembatasan CORS browser. API native menggunakan header Authorization: Bearer TOKEN.

```powershell
npm run build
npm start
npm test
```

Untuk preview tanpa Docker: npm run preview. Preview memakai PostgreSQL embedded dalam memori, dengan data/akun sementara. PORT bisa diubah; HOST default 127.0.0.1. Jangan gunakan preview untuk production. Jalankan API asli dengan PostgreSQL untuk penyimpanan permanen.

## Data dan migrasi

Tabel awal: users, trainer_clients, muscles, exercises, exercise_muscles, workouts, workout_exercises, workout_sets.
Tabel baru: plans, plan_exercises, schema_migrations.

Migrasi versi 2 dijalankan transaksional sekali saat startup dan mempertahankan data lama:
- plans: pemilik, pencatat, nama, fokus, tanggal awal, hari pengulangan mingguan.
- plan_exercises: urutan, target set/reps/berat/RIR, default rest, rest_seconds_by_set.
- workouts: plan_id, status IN_PROGRESS/COMPLETED, fokus yang disalin saat mulai.
- workout_sets: reps aktual (NULL berarti belum dicatat), target_reps, target_rir, rir aktual, rest_seconds, completed_at.
- failed adalah kolom generated: reps aktual < target_reps. Nilai NULL sebelum set dicatat. RIR disimpan terpisah.
- Set lama diberi target sama dengan reps lama karena target sebelumnya tidak pernah disimpan.
- Rest divalidasi dalam kelipatan 30 detik, dari 0 sampai 3600.
- Data target/rest disalin ke sesi saat dimulai; mengubah plan tidak mengubah target sesi lama.
- Menghapus plan mempertahankan riwayat workout.
- Plan yang sama hanya menghasilkan satu workout untuk satu tanggal; start berulang mengembalikan ID yang sama.

Backup database production sebelum menjalankan perubahan migrasi.

## Endpoint /api

| Metode | Path | Fungsi |
| --- | --- | --- |
| POST | /auth/register, /auth/login | Auth |
| GET | /me | Profil |
| GET | /health | Koneksi DB |
| GET | /exercises | Katalog latihan dan otot |
| GET | /focuses | Daftar fokus dan kelompok otot |
| GET / POST | /clients | Client aktif / buat permintaan |
| GET | /trainer-requests | Trainer yang meminta akses |
| POST | /trainer-requests/:id/accept | Setujui trainer |
| DELETE | /trainer-requests/:id | Cabut/tolak akses |
| GET | /plans?userId=UUID&date=YYYY-MM-DD | Plan milik user; date memfilter Gym Daily |
| POST | /plans | Buat plan |
| PUT / DELETE | /plans/:id | Ubah/hapus plan |
| POST | /plans/:id/start | Mulai atau lanjutkan sesi pada date |
| GET | /workouts?userId=UUID | 100 sesi terbaru |
| GET | /workouts/:id | Detail sesi dan set |
| PATCH | /workout-sets/:id | Catat/koreksi hasil reps, kg, RIR dan rest |
| POST | /workouts/:id/complete | Selesaikan sesi setelah semua set dicatat |
| GET | /progress?userId=UUID&exerciseId=UUID | 365 tanggal latihan terbaru, ascending |
| POST / DELETE | /workouts, /workouts/:id | Catatan manual lama / hapus sesi |

Trainer memerlukan hubungan ACTIVE yang disetujui client sebelum membaca atau menulis data client. Permintaan trainer disimpan dalam aplikasi; server tidak mengirim email.

Contoh membuat plan:

```json
{
  "userId": "UUID-CLIENT",
  "name": "Bench Press Day",
  "focus": "chest",
  "date": "2026-10-07",
  "weekdays": [1, 3, 5],
  "exercises": [{
    "exerciseId": "UUID-LATIHAN",
    "sets": 4,
    "targetReps": 12,
    "targetWeight": 40,
    "targetRir": 2,
    "restSeconds": 180,
    "restSecondsBySet": [30, 90, 180, 180]
  }]
}
```

weekdays memakai 0=Minggu sampai 6=Sabtu; kosong berarti plan sekali pada date. Fokus: shoulders, chest, abs, thighs, glutes, upper-body, lower-body, custom.
Start: {"date":"2026-10-07"}. PATCH set: {"reps":6,"weight":40,"rir":0,"restSeconds":30}.

## Verifikasi

npm test memakai PGlite (mesin PostgreSQL embedded) untuk HTTP NestJS: auth, email duplikat, persetujuan client, isolasi antaruser, transaksi/rollback, data lama, jadwal mingguan, start idempotent, rest 30 detik, hasil nol reps, RIR, failed otomatis, koreksi hasil, agregasi progres, dan pelestarian riwayat saat plan dihapus.

Ini implementasi tahap pengembangan. Sebelum rilis publik, tambahkan pembatasan login, verifikasi email/reset password, alur penghapusan akun, pemantauan dan backup. HTTPS disediakan hosting/reverse proxy; JWT_SECRET dan DATABASE_URL harus melalui environment private.
