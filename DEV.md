# Local Development

İki tarafı paralel çalıştırma rehberi. Production (Render + Cloudflare Pages) etkilenmez —
local-only dosyalar `.gitignore` ile exclude edilmiş.

## İlk kurulum (yalnızca bir kez)

1. **MongoDB**
   - Local: MongoDB Community Server kur, default port `27017`'de çalıştır.
   - Veya Atlas'taki dev cluster'ını kullan (aşağıda override).

2. **Backend secrets**
   - `backend/appsettings.Development.json` zaten oluşturuldu (gitignored). JWT secret üretildi,
     Mongo `mongodb://localhost:27017` + `rentacar_dev` DB ayarlandı.
   - Atlas kullanmak istersen `MongoDbSettings.ConnectionString`'i değiştir.
   - Email testi yapacaksan `Resend.ApiToken`'a kendi key'ini koy; yoksa boş bırak.

3. **Frontend dependencies**
   ```powershell
   cd frontend
   npm install
   ```

## Günlük akış

İki ayrı PowerShell penceresi:

**Pencere 1 — Backend** (`http://localhost:5000`):
```powershell
cd backend
dotnet run
```

**Pencere 2 — Frontend** (`http://localhost:4200`):
```powershell
cd frontend
npm start
```

Frontend `environment.ts` üzerinden `http://localhost:5000/api`'a bağlanır. Kod değiştir →
Angular HMR ile sayfa anında refresh olur, .NET dosya değişikliğinde otomatik yeniden
build için `dotnet watch run` kullanabilirsin.

## Production'a geçiş

Hiçbir şey yapma — `git push origin main`:
- **Cloudflare Pages** frontend'i `environment.prod.ts` ile build eder
  (`apiUrl: https://rentacar-303y.onrender.com/api`).
- **Render** backend'i `Production` modda başlatır; `appsettings.Development.json` yüklenmez,
  Render'daki environment variable'lardan secret'ları okur (bkz. `DEPLOYMENT.md`).

## Troubleshooting

| Hata | Sebep | Çözüm |
| --- | --- | --- |
| `JWT Secret cannot be null or empty!` | `appsettings.Development.json` yok veya secret boş | Dosyayı oluştur (yukarı bak) |
| `MongoDB connection refused` | Local Mongo çalışmıyor | `net start MongoDB` veya Atlas connection string'e geç |
| Frontend `CORS error` | Backend `:5000`'de değil | `launchSettings.json`'da `applicationUrl` doğru mu kontrol et |
| `dotnet run` portu kullanıyor | Önceki proses canlı | `Get-Process -Name backend | Stop-Process` |
