# WordRoom

> Сөздерді тақырып бойынша енгізіп, ойын режимдері арқылы жатта.

## 🚀 Бір клик деплой

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faqarysxt%2Feng&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20URL%20%D0%BC%D0%B5%D0%BD%20%D0%BA%D1%96%D0%BB%D1%82%D1%82%D0%B5%D1%80&project-name=wordroom&repository-name=wordroom)

Жоғарыдағы түймені басып, 3 env айнымалысын (Supabase URL, anon key, service_role key)
енгізсеңіз — Vercel автоматты деплой жасайды. Алдымен `supabase/schema.sql`-ді
Supabase жобаңызда орындап алыңыз.

WordRoom — тіркелусіз (email/құпиясөзсіз) жұмыс істейтін сөздік үйрену платформасы.
Қолданушы тек аты-жөнін енгізеді, кабинет ашады (немесе код арқылы кіреді), тақырып
құрады, сөздер қосады және «Дайын» дегеннен кейін тақырып бірнеше ойын режимі бар
дайындық бөлмесіне айналады.

## Мүмкіндіктер

- 🔓 Тіркелусіз кіру — тек аты-жөн (localStorage арқылы есте сақталады)
- 🗂️ Кабинеттер — 6 таңбалы бірегей код арқылы бөлісу
- 📚 Тақырыптар мен сөздер (сөз, аударма, мағына, мысал сөйлем)
- 🎮 6 жаттығу режимі:
  1. **Flip Card** — картаны аударып есте сақтау
  2. **Сәйкестендіру** — сөз бен аударманы қосу
  3. **Мағынасын тап** — 4 нұсқадан дұрыс аударманы таңдау
  4. **Аудармасын жаз** — аударманы жазу (регистрге тәуелсіз тексеру)
  5. **Тыңдап жаз** — Web Speech API арқылы тыңдап жазу
  6. **Сөйлем құрастыр** — сөзбен сөйлем құрау (валидациямен)
- 📊 Прогресс жиынтығы (дұрыс/қате)
- 📱 Десктоп пен мобайлға бейімделген, көк-ақ түсті заманауи дизайн

## Технологиялар

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL) — Next.js API routes арқылы
- **Vercel** — деплой

## Жоба құрылымы

```
src/
  app/
    page.tsx                      # Кіру беті (аты-жөн)
    dashboard/page.tsx            # Кабинеттер
    cabinet/[cabinetId]/
      page.tsx                    # Тақырыптар
      topic/[topicId]/
        edit/page.tsx             # Сөз редакторы
        practice/page.tsx         # Дайындық бөлмесі
    api/                          # Барлық дерекқор операциялары (service role)
      users/ cabinets/ topics/ words/ practice-results/
  components/
    ui/                           # Қайта қолданылатын UI (Button, Input, Card, Modal...)
    practice/                     # 6 жаттығу режимі
  lib/
    api.ts                        # Клиент жағындағы fetch көмекшілері
    supabaseServer.ts             # Service role клиенті (тек сервер)
    currentUser.ts                # localStorage көмекшілері
    types.ts utils.ts
supabase/schema.sql               # Дерекқор схемасы
```

## 1. Орнату

```bash
git clone <repo-url>
cd wordroom
npm install
```

## 2. Supabase баптау

1. [supabase.com](https://supabase.com) ішінде жаңа жоба құрыңыз.
2. **SQL Editor** ашып, `supabase/schema.sql` файлының мазмұнын орындаңыз.
3. **Project Settings → API** бөлімінен мыналарды алыңыз:
   - Project URL
   - `anon` public key
   - `service_role` key (құпия!)

### Дерекқор схемасы (SQL)

Толық схема `supabase/schema.sql` ішінде. Қысқаша:

```sql
create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.cabinets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  owner_id uuid references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.cabinet_members (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid references public.cabinets(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cabinet_id, user_id)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid references public.cabinets(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.words (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  word text not null,
  translation text not null,
  meaning text,
  example_sentence text,
  created_at timestamptz not null default now()
);

create table public.practice_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  mode text not null,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  completed_at timestamptz not null default now()
);
```

## 3. Орта айнымалылары (Environment variables)

Жобаның түбінде `.env.local` файлын құрыңыз (`.env.example` үлгісі бойынша):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

| Айнымалы | Сипаттама |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase жоба URL-і (браузерде қолжетімді) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon public key (браузерде қолжетімді) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Құпия.** Тек сервердегі API routes ішінде қолданылады |

> ⚠️ **Қауіпсіздік:** `SUPABASE_SERVICE_ROLE_KEY` ешқашан браузерге жіберілмейді.
> Ол тек `src/lib/supabaseServer.ts` арқылы сервер жағындағы API routes ішінде
> қолданылады. Клиент дерекқорға тек `/api/*` маршруттары арқылы қатынайды.

## 4. Жергілікті іске қосу

```bash
npm run dev
```

Браузерден [http://localhost:3000](http://localhost:3000) ашыңыз.

Басқа командалар:

```bash
npm run build   # өндірістік құрастыру
npm run start   # құрастырылған нұсқаны іске қосу
npm run lint    # ESLint
```

## 5. GitHub-қа жіберу

```bash
git init
git add .
git commit -m "WordRoom: бастапқы нұсқа"
git branch -M main
git remote add origin https://github.com/<username>/wordroom.git
git push -u origin main
```

## 6. Vercel-ге деплой

1. [vercel.com](https://vercel.com) → **Add New → Project**.
2. GitHub репозиторийіңізді импорттаңыз.
3. **Environment Variables** бөліміне 3 айнымалыны қосыңыз:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy** басыңыз. Vercel Next.js-ті автоматты түрде анықтайды.

Әр `git push` кейін Vercel автоматты түрде қайта деплой жасайды.

## API маршруттары

| Метод | Жол | Қызметі |
| --- | --- | --- |
| POST | `/api/users` | Қолданушы құру |
| GET | `/api/cabinets?userId=` | Қолданушы кабинеттері |
| POST | `/api/cabinets` | Кабинет құру |
| GET | `/api/cabinets/[id]` | Бір кабинет |
| POST | `/api/cabinets/join` | Код арқылы кіру |
| GET | `/api/topics?cabinetId=` | Кабинет тақырыптары |
| POST | `/api/topics` | Тақырып құру |
| GET | `/api/topics/[id]` | Бір тақырып |
| POST | `/api/topics/[id]/ready` | Тақырыпты дайын ету |
| GET | `/api/words?topicId=` | Тақырып сөздері |
| POST | `/api/words` | Сөз қосу |
| PUT | `/api/words/[id]` | Сөзді өңдеу |
| DELETE | `/api/words/[id]` | Сөзді жою |
| POST | `/api/practice-results` | Жаттығу нәтижесін сақтау |

## Лицензия

MIT
