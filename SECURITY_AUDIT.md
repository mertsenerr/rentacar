# Moviqar.com — Security Audit

> Generated: 2026-05-07
> Stack: .NET 9 Web API + Angular 19 + MongoDB Atlas
> Hosting: Render (backend) + Cloudflare Pages (frontend)
> Status: **Faz 0 + 1.1 tamamlandı.** Faz 1.2+ pending.

---

## 1. Solution Layout

```
rentacar-main/
├── backend/                              .NET 9 Web API (single project)
│   ├── Program.cs                        Entry point + DI + middleware
│   ├── CorporateElite.API.csproj
│   ├── Configuration/                    JwtSettings, MongoDbSettings, MongoDbContext
│   ├── Controllers/Controllers.cs        ALL controllers in one file (301 lines)
│   ├── Models/
│   │   ├── DTOs/DTOs.cs                  ALL DTOs in one file (57 lines)
│   │   └── Entities/Entities.cs          ALL entities in one file (238 lines)
│   ├── Repositories/
│   │   ├── Interfaces/IRepositories.cs
│   │   └── Implementations/Repositories.cs (245 lines)
│   ├── Services/
│   │   ├── Interfaces/IServices.cs + IEmailService.cs
│   │   └── Implementations/Services.cs (620 lines) + EmailService.cs
│   ├── Properties/launchSettings.json
│   ├── appsettings.json                  blanked secrets, committed
│   ├── appsettings.Development.json      LOCAL secrets, gitignored
│   └── appsettings.Development.example.json (template)
├── frontend/                             Angular 19 SPA
│   ├── src/app/                          features/, core/, shared/
│   ├── src/environments/                 environment.ts + environment.prod.ts
│   ├── package.json                      Angular 19.2.x
│   └── angular.json
├── DEPLOYMENT.md                         Render + Cloudflare deploy notes
├── DEV.md                                Local dev quickstart
├── Dockerfile                            Backend container
├── .gitignore
└── .gitattributes
```

> **Yapısal not:** Backend tarafında Controllers / DTOs / Entities / Services / Repositories sınıflarının her biri **tek mega-dosya** içinde. Bu refactoring ihtiyacı gibi görünüyor ama kod organizasyonu güvenlik scope'u dışında — denetimde dosya yapısına dokunulmayacak.

---

## 2. Backend Dependencies (NuGet)

| Paket | Versiyon | Notlar |
| --- | --- | --- |
| MongoDB.Driver | 2.23.1 | Stable, current major (2.x), 3.x bekleniyor |
| Microsoft.AspNetCore.Authentication.JwtBearer | 9.0.0 | .NET 9 ile aligned |
| Resend | 0.2.2 | 0.x — pre-release sürüm sayılır, takip et |
| Swashbuckle.AspNetCore | 6.5.0 | Swagger; **production'da kapatılmalı** (FAZ 5) |
| BCrypt.Net-Next | 4.0.3 | Aktif fork, current |

### Vulnerable transitive packages

```
> Snappier  1.0.0  HIGH  https://github.com/advisories/GHSA-pggp-6c3x-2xmx
```

Snappier MongoDB.Driver tarafından transitively pull edilen Snappy compression kütüphanesi. Düzeltme **Faz 7.2** (Dependency Update) kapsamında — MongoDB.Driver güncel versiyonu Snappier'ı upgrade etmiş olabilir, buna o adımda bakacağız.

---

## 3. Frontend Dependencies (npm)

**Direct:** Angular 19.2.x (animations, common, compiler, core, forms, platform-browser, router), rxjs ~7.8, tslib ^2.6, zone.js ~0.15

**Dev:** @angular/cli 19.2.x, @angular-devkit/build-angular 19.2.x, jasmine/karma test stack, typescript ~5.5

### npm audit summary

```
6 high severity vulnerabilities

@angular-devkit/build-angular  high  via copy-webpack-plugin
@angular/cli                   high  via pacote
copy-webpack-plugin            high  via serialize-javascript
pacote                         high  via tar
serialize-javascript           high
tar                            high  (multiple CVEs: path traversal, symlink poisoning)

fix available via `npm audit fix --force` (BREAKING — would upgrade @angular/cli to 21.2.10)
```

> **Not:** Hepsi **devDependency**. Yani üretim browser bundle'ına gitmiyor; sadece local/CI build sürecinde tar/pacote arbitrary-file-write zafiyetleri tetiklenebilir. Production runtime risk **düşük**, supply-chain risk **var**. **Faz 7.2**'de manuel review ile çözülecek (major bump 19→21 breaking change içerebilir).

---

## 4. Auth/Security-Relevant Files

| Dosya | İçerik | İlgili Faz |
| --- | --- | --- |
| `backend/Program.cs` | DI, JWT config, CORS, middleware pipeline | Faz 2.2, 4.1, 4.2 |
| `backend/Configuration/JwtSettings.cs` | JWT settings POCO | Faz 2.2 |
| `backend/Configuration/MongoDbSettings.cs` + `MongoDbContext.cs` | Mongo bağlantısı | Faz 1.1, 3.3 |
| `backend/Controllers/Controllers.cs` | Tüm controller'lar | Faz 3.1 |
| `backend/Services/Implementations/Services.cs` | AuthService (login, register, JWT gen, password reset) | Faz 2.1, 2.2, 2.4 |
| `backend/Services/Implementations/EmailService.cs` | Email sending (Resend) | Faz 5.1 |
| `backend/Models/DTOs/DTOs.cs` | Tüm DTO'lar | Faz 3.2 |
| `backend/Models/Entities/Entities.cs` | User entity (Role, PasswordHash, ResetToken) | Faz 2.4, 3.2 |
| `frontend/src/app/features/auth/login/login.component.ts` | Login + Google OAuth init | Faz 6.1 |
| `frontend/src/app/features/auth/register/register.component.ts` | Register + Google OAuth init | Faz 6.1 |
| `frontend/src/app/core/services/auth.service.ts` | Token storage, HTTP interceptor wiring | Faz 6.1 |
| `frontend/src/app/core/interceptors/auth.interceptor.ts` | Authorization header injection | Faz 6.1 |
| `frontend/src/app/core/guards/auth.guard.ts` + `admin.guard.ts` | Route protection | Faz 3.1, 6.1 |

---

## 5. Endpoint Inventory (preliminary)

`Controllers.cs` taraması:

| Controller | Endpoint | Auth | Notes |
| --- | --- | --- | --- |
| Health | `GET /` | — | Public health check |
| Vehicles | `GET /api/vehicles` | — | Public list |
| Vehicles | `GET /api/vehicles/{id}` | — | Public detail |
| Vehicles | `GET /api/vehicles/availability` | — | Public |
| Vehicles | `GET /api/vehicles/featured` | — | Public |
| Vehicles | `GET /api/vehicles/{id}/reviews` | — | Public |
| Vehicles | `POST /api/vehicles/{id}/reviews` | `[Authorize]` | |
| Auth | `POST /api/auth/login` | — | **No rate limit** |
| Auth | `POST /api/auth/register` | — | **No rate limit** |
| Auth | `POST /api/auth/google-login` | — | |
| Auth | `GET /api/auth/me` | `[Authorize]` | |
| Auth | `PUT /api/auth/profile` | `[Authorize]` | |
| Auth | `PUT /api/auth/change-password` | `[Authorize]` | |
| Auth | `PUT /api/auth/preferences` | `[Authorize]` | |
| Auth | `POST /api/auth/forgot-password` | — | **No rate limit** |
| Auth | `POST /api/auth/reset-password` | — | |
| Bookings | `GET/POST/...` (5 endpoints) | `[Authorize]` controller-level | Ownership check?? — **Faz 3.1** |
| Locations | `GET /api/locations` | — | Public |
| Admin | 8 endpoints (user mgmt, vehicle CRUD, stats) | `[Authorize(Roles="admin")]` | Role gating active |

---

## 6. Configuration Hygiene

### Committed appsettings.json (good — values blanked)

```json
{
  "MongoDbSettings": { "ConnectionString": "", "DatabaseName": "rentacar" },
  "JwtSettings":     { "Secret": "", "Issuer": "...", "Audience": "...", "ExpirationInMinutes": 60 },
  "Resend":          { "ApiToken": "", "FromEmail": "...", "FromName": "..." },
  "Frontend":        { "BaseUrl": "https://moviqar.com" },
  "Cors":            { "AllowedOrigins": [4 entries], "AllowedOriginPatterns": [".rentacar-1qk.pages.dev"] }
}
```

`Program.cs:44-45` boş JWT secret'ta fail-fast guard var — **iyi**. Mongo connection string boş için aynı guard yok — **eklenecek (Faz 1.2)**.

### .gitignore

`appsettings.Development.json`, `appsettings.Production.json`, `secrets.json`, `*.env`, `*.key`, `*.pem` excluded. **Yeterli**.

### Git history secret tarama

```
$ git log --all -p -- backend/appsettings.json | grep -iE "Secret|Password|Key|Token|ConnectionString"
+    "ConnectionString": "",
+    "Secret": "",
+    "ApiToken": "",
```

Geçmişte hiç commit'lenmiş gerçek secret **yok**. Repo temiz.

`environment.prod.ts` history'sinde `googleClientId` görünüyor ama bu **public veri** (OAuth client ID by design frontend'de durur, Authorized Origins ile korunur).

---

## 7. Kritik İlk Bulgular (Pre-detail tarama)

Bu ön-bakış sırasında belirgin şekilde dikkatimi çeken konular — detaylı incelemeleri ilgili fazlarda yapılacak:

| # | Bulgu | Önem | İlgili Faz |
| --- | --- | --- | --- |
| 1 | **Swagger UI production'da açık** (`Program.cs:115-120` koşulsuz `UseSwagger`) | HIGH | Faz 5.1 |
| 2 | **Hiçbir endpoint'te rate limit yok** (login, register, forgot-password) | HIGH | Faz 2.3 |
| 3 | **Password reset token = `Guid.NewGuid()`** (`Services.cs:374`); RFC4122 v4 cryptographically random ama hash'lenmeden DB'de plaintext saklanıyor | HIGH | Faz 2.4 |
| 4 | **Refresh token = `Guid.NewGuid()`** (`Services.cs:289`); DB'ye kaydedilmiyor, rotasyon yok, blacklist yok — yani **kullanılmayan/sahte** bir refresh token | CRITICAL | Faz 2.2 |
| 5 | **JWT lifetime 60 dakika** + refresh token mekanizması olmadığı için access token expire olunca user'a tekrar login zorunlu (UX problem değil ama belirleyici eksik) | MEDIUM | Faz 2.2 |
| 6 | **`UseHttpsRedirection` sadece non-Development'ta** açık (`Program.cs:122-125`); HSTS yok, CSP yok | HIGH | Faz 4.2 |
| 7 | **`AllowAnyHeader` + `AllowAnyMethod`** CORS'ta (`Program.cs:81-82`) | LOW (origin whitelist sıkı) | Faz 4.1 |
| 8 | **Snappier transitive HIGH CVE** | MEDIUM | Faz 7.2 |
| 9 | **`UpdateProfileRequest` DTO** sadece güvenli alanlar içeriyor (`DTOs.cs:51`) — Role/IsVerified yok ✓; ama controller body bind'i ham entity yerine bu DTO'yu kullandığını **Faz 3.1**'de doğrulayacağız | INFO | Faz 3.1 |
| 10 | **Email enumeration** — login/register/forgot-password response'larından kullanıcı varlığı tespit edilebilir mi? Henüz incelenmedi | TBD | Faz 2.4 |
| 11 | **Bookings ownership check** — `[Authorize]` var ama userId'ye bağlı filtre var mı kontrolünü Faz 3.1'de yapacağız | TBD | Faz 3.1 |
| 12 | **NoSQL Injection riski** — `Repositories.cs` Builders/LINQ kullanıyor mu yoksa raw `BsonDocument.Parse` mı? Faz 3.3'te detay | TBD | Faz 3.3 |
| 13 | **Frontend token storage** — `auth.service.ts` localStorage mı? Faz 6.1'de detay | TBD | Faz 6.1 |
| 14 | **devDeps tar/pacote zafiyetleri** — runtime etkisi yok, supply-chain risk | LOW | Faz 7.2 |

---

## 8. Faz 0 Sonuç

- ✓ Envanter çıkartıldı, kritik dosyalar lokalize edildi.
- ✓ Vulnerable package taraması yapıldı (1 backend transitive HIGH + 6 frontend devDep HIGH).
- ✓ Hardcoded secret yok, git history temiz.
- ✓ 14 ön-bulgu listelendi, fazlara mapping yapıldı.

---

## 9. Faz 1.1 — Secret Sızıntı Taraması

### 9.1 Pattern-based scan

Backend ve frontend'de aşağıdaki pattern'lar tarandı; **hiçbir hardcoded secret bulunmadı**:

| Pattern | Backend | Frontend | Sonuç |
| --- | --- | --- | --- |
| `(api[_-]?key\|secret\|password\|token\|bearer)\s*[=:]\s*"[^"]{8,}"` | 0 hit | 0 hit | ✓ |
| `[A-Za-z0-9+/]{40,}={0,2}` (base64 40+) | 0 hit | 0 hit | ✓ |
| `eyJ...\....\....` (JWT format) | 0 hit | 0 hit | ✓ |
| `sk_live_`, `sk_test_`, `re_live_`, Stripe/Resend keys | 0 hit | 0 hit | ✓ |
| `GOCSPX-` (Google client_secret) | 0 hit | 0 hit | ✓ |
| `AKIA[A-Z0-9]{16}` (AWS) | 0 hit | 0 hit | ✓ |
| `ghp_`, `github_pat_` | 0 hit | 0 hit | ✓ |
| `xoxb-`, `xoxp-` (Slack) | 0 hit | 0 hit | ✓ |
| `mongodb(\+srv)?://` (connection string) | sadece `appsettings.Development.example.json` (localhost example) + DEV.md/README.md (doc örnekler) | — | ✓ |

### 9.2 appsettings.json (committed) — değer kontrolü

```json
{
  "MongoDbSettings": { "ConnectionString": "", "DatabaseName": "rentacar" },
  "JwtSettings":     { "Secret": "", "Issuer": "...", "Audience": "...", "ExpirationInMinutes": 60 },
  "Resend":          { "ApiToken": "", "FromEmail": "...", "FromName": "..." }
}
```

Tüm hassas alanlar boş string. Render env vars üzerinden override ediliyor. ✓

### 9.3 environment.ts / environment.prod.ts

```ts
// environment.ts (development)
{ apiUrl: 'http://localhost:5000/api', googleClientId: '968843541128-29...' }

// environment.prod.ts (production)
{ apiUrl: 'https://rentacar-303y.onrender.com/api', googleClientId: '968843541128-29...' }
```

`apiUrl` ve `googleClientId` **public** veriler (OAuth client ID by design frontend'de durur, Authorized JavaScript Origins ile korunur — bkz. mevcut Google Cloud Console konfigürasyonu). ✓

### 9.4 Tracked files audit

```
$ git ls-files | grep -iE "package-lock|secret|\.env|appsettings\.(Development|Production)\.json$"
(empty)
```

`appsettings.Development.json`, `package-lock.json`, `.env*`, `secrets.json` **hiçbiri tracked değil**. .gitignore çalışıyor. ✓

### 9.5 Git history scan

```
$ git log --all -p | grep -iE "^\+.*(secret|password|token|api_key)\s*[=:]" | filter
```

Filtrelenen sonuçlar: SECURITY_AUDIT.md kendi içeriği (false positive), kod içindeki variable isimleri (`var token = ...`), Angular framework DI token referansları. **Gerçek secret yok.** ✓

### 9.6 Bulgular

| # | Bulgu | Önem | Aksiyon (Faz) |
| --- | --- | --- | --- |
| 15 | Google OAuth Client ID 4 dosyada hardcoded (`environment.ts`, `environment.prod.ts`, `login.component.ts:331,364`, `register.component.ts:353`). environment.ts'te tanımlı ama componentlerde tekrar duplicate. | LOW (public veri) — kod kalitesi | Faz 1.2 (refactor: componentler `environment.googleClientId` kullansın) |
| 16 | `Mongo connection string` boş ise Program.cs'de fail-fast guard yok (sadece JWT secret için var). | MEDIUM | Faz 1.2 |
| 17 | `Resend ApiToken` boş ise mail gönderme silently fail eder mi? Email service incelenecek. | LOW | Faz 1.2 |
| 18 | `appsettings.json` sensitive field'lar boş string — fail-fast var ama placeholder yorum/uyarı yok. Yeni bir geliştirici dosyaya gerçek değer yazıp commit'leyebilir. | INFO | Faz 1.2 |

### 9.7 Faz 1.1 Sonuç

- ✓ **Kritik leak yok.** Hardcoded secret veya commit'lenmiş hassas değer bulunamadı.
- ✓ Git history temiz.
- ✓ .gitignore yeterli kapsama sahip.
- ✓ Tracked file listesi temiz.
- ⏭ Sonraki adım: **Faz 1.2 — Environment Variable Migration** (kod değişikliği gerektirir; Mongo fail-fast guard, googleClientId refactor, env var dokümentasyonu).
