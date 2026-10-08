# Gym Tracking API

Server NestJS + PostgreSQL, terpisah dari aplikasi React Native ../Gym-tracking.
Client adalah user dengan role CLIENT; trainer juga tersimpan dalam users.

## Menjalankan

```powershell
npm install
Copy-Item .env.example .env
# Isi DATABASE_URL sesuai PostgreSQL lokal sebelum menjalankan API.
npm run dev
```

JWT_SECRET harus acak minimal 32 karakter. DATABASE_URL menuju PostgreSQL. PORT default 3000. WEB_ORIGIN hanya untuk akses browser; React Native tidak memakai pembatasan CORS browser. API native menggunakan header Authorization: Bearer TOKEN.

`WEB_ORIGIN` bisa berisi beberapa alamat frontend yang dipisahkan koma, misalnya `http://localhost:8083,http://127.0.0.1:8083`. Isi dengan origin frontend (tanpa path), bukan URL API. Preflight browser ke `/api/auth/register` memakai `OPTIONS` dan akan dijawab 204 untuk origin yang diizinkan. Endpoint signup sebenarnya memakai `POST /api/auth/register`.

Jika memakai ngrok, arahkan tunnel ke port API utama dan atur URL mobile menjadi `https://HOST-NGROK/api`. Pastikan tidak ada server preview lama di port yang sama. Preview sebaiknya dijalankan pada port terpisah, misalnya dengan `$env:PORT=3002; npm run preview`. Restart API setelah mengganti environment.

Gunakan PostgreSQL lokal pada `localhost:5432`. Buat database `gym` melalui pgAdmin atau psql, lalu isi `DATABASE_URL` di `.env` dengan user dan password lokal yang memiliki izin membuat tabel pada database tersebut. Jika `.env` sudah ada, edit file tersebut tanpa menimpanya dengan contoh.

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/gym
```

Karakter khusus pada user/password dalam URL harus di-percent-encode. Schema, migrasi, dan seed dijalankan otomatis saat API mulai; server tidak membuat database PostgreSQL-nya.

Jika nanti PostgreSQL dipindahkan ke Railway, ganti `DATABASE_URL` dengan URL koneksi yang diberikan Railway melalui environment server. Gunakan parameter TLS sesuai konfigurasi koneksi yang diberikan penyedia. Tidak perlu mengubah modul API untuk mengganti lokasi database.

```powershell
npm run build
npm start
npm test
```

Untuk preview tanpa menghubungkan PostgreSQL lokal: npm run preview. Preview memakai PostgreSQL embedded dalam memori, dengan data/akun sementara. PORT bisa diubah; HOST default 127.0.0.1. Jangan gunakan preview untuk production. Jalankan API asli dengan PostgreSQL untuk penyimpanan permanen.

## Struktur source

```text
src/
  main.ts                      # Bootstrap server
  app.module.ts                # Daftar modul aplikasi
  config/configure-app.ts      # CORS, validasi request, shutdown hooks
  common/
    types/auth-user.ts         # Tipe user JWT dan request terautentikasi
    validation.ts             # Validasi UUID dan tanggal bersama
  database/
    database.module.ts
    database.service.ts        # Koneksi PostgreSQL dan inisialisasi
    schema/initial-schema.ts   # Schema awal sebelum migrasi
    migrations/
      002-training-plans.ts    # Perubahan plan, workout, dan set
      index.ts                 # Daftar migrasi berurutan
      migration-runner.ts     # Transaksi, lock, dan pencatatan versi
    seeds/catalog.seed.ts     # Katalog otot dan latihan awal
  modules/
    auth/                     # Register, login, JWT guard, izin akses
    users/                    # Profil user
    clients/                  # Hubungan trainer-client dan persetujuan
    exercises/                # Katalog latihan dan fokus otot
    plans/                    # Jadwal, target set, dan mulai sesi
    workouts/                 # Riwayat, hasil set, dan penyelesaian sesi
    progress/                 # Agregasi progres
    health/                   # Pemeriksaan koneksi database
```

Setiap modul fitur memiliki `*.module.ts`, `*.controller.ts`, dan `*.service.ts`.
Controller menangani route dan input; service menjalankan aturan bisnis dan query.
DTO berada di folder `dto/` pada modul yang menerima input terstruktur.
`AccessService` dipakai bersama agar pemeriksaan akses trainer-client konsisten.

## Schema dan migrasi

Saat startup, server membuat schema awal jika belum ada, menjalankan migrasi yang belum tercatat, lalu mengisi katalog awal secara idempotent.
Versi 2 tetap dipakai untuk kompatibilitas database yang sudah ada; refactor ini tidak membuat ulang data atau mengubah versi migrasi lama.
Untuk perubahan berikutnya, tambahkan file `003-nama-perubahan.ts` dan daftarkan versi serta SQL-nya di `database/migrations/index.ts` sesuai urutan. Jangan mengubah migrasi yang sudah dijalankan.

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

npm test memakai PGlite (mesin PostgreSQL embedded) untuk HTTP NestJS: auth, profil, health, katalog fokus, email duplikat, persetujuan client, isolasi antaruser, transaksi/rollback, data lama, create/update plan, jadwal mingguan, start idempotent, rest 30 detik, hasil nol reps, RIR, failed otomatis, koreksi hasil, agregasi progres, dan pelestarian riwayat saat plan dihapus. Pengujian migrasi juga memastikan kegagalan membatalkan perubahan schema dan pencatatan versi, sehingga migrasi dapat dicoba ulang.

Ini implementasi tahap pengembangan. Sebelum rilis publik, tambahkan pembatasan login, verifikasi email/reset password, alur penghapusan akun, pemantauan dan backup. HTTPS disediakan hosting/reverse proxy; JWT_SECRET dan DATABASE_URL harus melalui environment private.
