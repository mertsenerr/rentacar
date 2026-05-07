# Deployment

## Backend (Render)

`appsettings.json` is checked into the repo with non-sensitive defaults.
Sensitive values are blank and **must** be supplied via environment variables on Render.

.NET binds env vars to nested config keys with `__` (double underscore).

### Required env vars

| Key | Notes |
| --- | --- |
| `MongoDbSettings__ConnectionString` | MongoDB Atlas SRV URI |
| `MongoDbSettings__DatabaseName`     | e.g. `rentacar` |
| `JwtSettings__Secret`               | HMAC signing key (long random string) |
| `JwtSettings__Issuer`               | e.g. `CorporateElite.API` |
| `JwtSettings__Audience`             | e.g. `CorporateElite.Client` |
| `JwtSettings__ExpirationInMinutes`  | e.g. `60` |
| `Resend__ApiToken`                  | Resend API key (`re_...`) |

### Optional production overrides

| Key | Default in `appsettings.json` | Override when |
| --- | --- | --- |
| `Frontend__BaseUrl`                          | `https://moviqar.com`            | Custom domain not yet live → set to `https://rentacar-1qk.pages.dev` |
| `Resend__FromEmail`                          | `onboarding@resend.dev`          | After verifying `moviqar.com` in Resend → `noreply@moviqar.com` |
| `Resend__FromName`                           | `Moviqar`                        | Brand display name change |
| `Cors__AllowedOrigins__0`, `__1`, ...        | localhost + pages.dev + moviqar  | New domain or remove origins |
| `Cors__AllowedOriginPatterns__0`, ...        | `.rentacar-1qk.pages.dev`        | Different Cloudflare project name |

CORS uses `SetIsOriginAllowed`: a request origin is allowed if it matches an entry in
`AllowedOrigins` exactly, or its host ends with any entry in `AllowedOriginPatterns`
(used for Cloudflare preview deployments like `abc123.rentacar-1qk.pages.dev`).

## Frontend (Cloudflare Pages)

Connected to GitHub `main`, builds on every push.

| Setting | Value |
| --- | --- |
| Build command          | `npm run build` |
| Build output directory | `dist/rentacar/browser` |
| Root directory         | `frontend` |
| Env var: `NODE_VERSION` | `20` |

`environment.prod.ts` points to `https://rentacar-303y.onrender.com/api` — change here
if the backend host changes.
