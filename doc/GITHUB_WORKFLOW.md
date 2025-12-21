# GitHub Workflow Guide - Hop-On Project

## Багийн бүтэц

### Backend баг (2 хүн)

**Backend Developer 1** - Authentication & Core Services

- `apps/services/auth-service` - Нэвтрэх, бүртгэл, JWT
- `apps/services/notification-service` - Мэдэгдэл систем
- `apps/services/api-gateway` - API Gateway тохиргоо
- Database schema & migrations (`infra/db/`)

**Backend Developer 2** - Business Logic Services

- `apps/services/ride-service` - Ride логик
- `apps/services/booking-service` - Захиалга
- `apps/services/payment-service` - Төлбөр
- `apps/services/chat-service` - Чат

### Frontend баг (2 хүн)

**Frontend Developer 1** - User Application

- `apps/hop-on` - Үндсэн web application
- Хэрэглэгчийн UI/UX
- Map integration & real-time tracking
- `packages/ui-kit` - UI компонентууд

**Frontend Developer 2** - Admin Panel

- `apps/admin-web` - Админ панел
- Dashboard & analytics
- User management interface
- Reports & statistics

### Shared Responsibilities

- `packages/types` - TypeScript type definitions (хамтран)
- `packages/utils` - Utility functions (хамтран)
- `packages/config` - Configuration (хамтран)

---

## Branch Strategy

```
main (production-ready code)
  ↓
develop (integration branch)
  ↓
feature/<service>/<feature-name>
  ├─ feature/auth-service/add-jwt
  ├─ feature/hop-on/user-dashboard
  ├─ feature/admin-web/analytics-page
  └─ feature/ui-kit/add-modal-component

bugfix/<service>/<bug-description>
  └─ bugfix/ride-service/fix-location-update

hotfix/<critical-issue>
  └─ hotfix/payment-duplicate-charge
```

### Branch Protection Rules

**main branch:**

- ✅ Direct push хориглох
- ✅ Merge өмнө 1+ approval шаардах
- ✅ CI/CD бүх тест pass хийсэн байх
- ✅ Status checks шаардлагатай

**develop branch:**

- ✅ Direct push хориглох
- ✅ Pull request шаардах

---

## Өдөр тутмын workflow

### 1. Өглөө эхлэхдээ

```bash
# Latest код авах
git checkout develop
git pull origin develop

# Шинэ салбар үүсгэх
git checkout -b feature/auth-service/add-oauth

# Dependencies шалгах
npm install
```

### 2. Хөгжүүлэлт хийх

```bash
# Nx affected commands ашиглах
nx affected:lint
nx affected:test
nx affected:build

# Тодорхой service ажиллуулах
nx serve auth-service
nx serve hop-on

# Test ажиллуулах
nx test auth-service
nx e2e hop-on-e2e
```

### 3. Commit хийх

```bash
# Өөрчлөлт шалгах
git status
nx affected:graph

# Staged хийх
git add .

# Commit (conventional commits format)
git commit -m "feat(auth-service): add OAuth2 authentication"

# Push хийх
git push origin feature/auth-service/add-oauth
```

### 4. Pull Request үүсгэх

1. GitHub дээр "Compare & pull request" дарах
2. Template бөглөх (доор үзнэ үү)
3. Reviewers сонгох (багийн 1-2 гишүүн)
4. Labels нэмэх (`backend`/`frontend`, `auth-service`, etc.)
5. "Create pull request" дарах

### 5. Code Review

**Reviewer-ийн үүрэг:**

- ✅ Код чанар шалгах
- ✅ Бизнес логик зөв эсэх
- ✅ Tests бичигдсэн эсэх
- ✅ Бусад service эвдэгдээгүй эсэх
- ✅ Documentation шинэчлэгдсэн эсэх

**Feedback өгөх:**

- Constructive байх
- Тодорхой жишээ өгөх
- Асуулт асууж ойлголцох

### 6. Merge хийх

```bash
# PR approved болсны дараа
# "Squash and merge" эсвэл "Rebase and merge" сонгох
# Branch устгах

# Локал кодоо шинэчлэх
git checkout develop
git pull origin develop
git branch -d feature/auth-service/add-oauth
```

---

## Commit Message Convention

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types:

- `feat` - Шинэ функц
- `fix` - Bug засвар
- `docs` - Documentation өөрчлөлт
- `refactor` - Code refactoring
- `test` - Test нэмэх/засах
- `chore` - Build, dependencies өөрчлөлт
- `perf` - Performance сайжруулалт
- `style` - Code formatting

### Scope (service/app name):

- `auth-service`, `ride-service`, `payment-service`
- `hop-on`, `admin-web`
- `ui-kit`, `types`, `utils`
- `api-gateway`, `database`

### Жишээ:

```bash
feat(auth-service): add JWT token refresh mechanism

- Implement refresh token rotation
- Add token expiration validation
- Update auth middleware

Closes #123

---

fix(hop-on): resolve map marker positioning issue

The markers were not updating correctly when viewport changed.
Added debounce to map update handler.

---

docs(readme): update installation instructions

---

refactor(ui-kit): simplify Button component props

BREAKING CHANGE: `variant` prop renamed to `type`
```

---

## Pull Request Template

PR үүсгэхдээ дараах template ашиглах:

```markdown
## Affected Services/Apps

- [ ] apps/hop-on
- [ ] apps/admin-web
- [ ] services/auth-service
- [ ] services/ride-service
- [ ] services/booking-service
- [ ] services/payment-service
- [ ] services/chat-service
- [ ] services/notification-service
- [ ] packages/ui-kit
- [ ] packages/types
- [ ] packages/utils

## Type of Change

- [ ] 🚀 New feature
- [ ] 🐛 Bug fix
- [ ] 📝 Documentation
- [ ] ♻️ Refactoring
- [ ] ⚡ Performance improvement
- [ ] ✅ Test addition/update
- [ ] 🔧 Configuration change

## Description

<!-- Өөрчлөлтийн тайлбар -->

## Changes Made

-
-
-

## Related Issues

Closes #
Related to #

## Testing

- [ ] Unit tests pass (`nx affected:test`)
- [ ] E2E tests pass (`nx affected:e2e`)
- [ ] Manual testing completed
- [ ] Edge cases tested

## Testing Instructions

<!-- Reviewer-үүд хэрхэн test хийх талаар -->

1.
2.
3.

## Screenshots (UI changes only)

<!-- Before/After screenshots -->

## Breaking Changes

- [ ] No breaking changes
- [ ] Has breaking changes (see below)

<!-- If breaking changes, explain migration path -->

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

---

## Nx Monorepo Commands

### Affected Commands

```bash
# Өөрчлөгдсөн projectүүдийг харах
nx affected:graph

# Өөрчлөлтөд нөлөөлөгдсөн projectүүдийг lint
nx affected:lint

# Өөрчлөлтөд нөлөөлөгдсөн projectүүдийг test
nx affected:test

# Өөрчлөлтөд нөлөөлөгдсөн projectүүдийг build
nx affected:build

# Тодорхой base-аас хойш affected
nx affected:test --base=main
nx affected:build --base=develop --head=HEAD
```

### Service-specific Commands

```bash
# Service ажиллуулах
nx serve hop-on
nx serve admin-web
nx serve api-gateway
nx serve auth-service

# Build хийх
nx build hop-on --prod
nx build admin-web --configuration=production

# Test ажиллуулах
nx test auth-service
nx test ui-kit --watch

# E2E test
nx e2e hop-on-e2e

# Lint хийх
nx lint hop-on
nx lint auth-service

# Бүх projectүүдийг graph-аар харах
nx graph
```

### Dependency Graph

```bash
# Projectүүдийн харилцан хамаарал харах
nx graph

# Тодорхой project-ийн dependencies
nx graph --focus=auth-service

# Affected graph харах
nx affected:graph
```

---

## GitHub Issues & Project Management

### Issue Labels

**Type:**

- `bug` - Алдаа, асуудал
- `feature` - Шинэ функц
- `enhancement` - Сайжруулалт
- `docs` - Documentation
- `question` - Асуулт

**Priority:**

- `priority: critical` - Яаралтай
- `priority: high` - Өндөр
- `priority: medium` - Дунд
- `priority: low` - Бага

**Area:**

- `backend` / `frontend`
- `auth-service`, `ride-service`, etc.
- `hop-on`, `admin-web`
- `ui-kit`, `types`, `utils`
- `database`, `infra`, `devops`

**Status:**

- `status: blocked` - Blocked
- `status: needs-review` - Review хүлээж байна
- `status: in-progress` - Ажиллаж байна

### Project Board

```
📋 Backlog
  ↓
📝 Todo (Sprint ready)
  ↓
🏗️ In Progress (WIP limit: 2 per person)
  ↓
👀 Review/QA
  ↓
✅ Done
```

### Issue Template

```markdown
**Issue Type:** Bug / Feature / Enhancement

**Affected Service:**
apps/services/auth-service

**Description:**

<!-- Асуудлын тодорхой тайлбар -->

**Steps to Reproduce:** (bugs only)

1.
2.
3.

**Expected Behavior:**

**Actual Behavior:**

**Possible Solution:**

**Additional Context:**

- Screenshots
- Error logs
- Related issues
```

---

## Code Review Best Practices

### Review хийхдээ анхаарах зүйлс

**Code Quality:**

- ✅ Clean, readable code эсэх
- ✅ Naming conventions дагасан эсэх
- ✅ DRY principle (Don't Repeat Yourself)
- ✅ SOLID principles
- ✅ Error handling зөв хийгдсэн эсэх

**Testing:**

- ✅ Unit tests байгаа эсэх
- ✅ Edge cases тест хийгдсэн эсэх
- ✅ Coverage хангалттай эсэх

**Security:**

- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Authentication/Authorization зөв эсэх
- ✅ Sensitive data handling

**Performance:**

- ✅ N+1 queries байхгүй эсэх
- ✅ Unnecessary re-renders байхгүй эсэх
- ✅ Memory leaks байхгүй эсэх
- ✅ Database indexes зөв ашигласан эсэх

**Monorepo specific:**

- ✅ Зөвхөн хэрэгтэй dependency нэмсэн эсэх
- ✅ Circular dependencies үүсээгүй эсэх
- ✅ Shared packages зөв ашигласан эсэх
- ✅ `nx affected` командууд зөв ажиллаж байгаа эсэх

### Review comment жишээ

❌ Муу:

```
Энэ муу байна.
```

✅ Сайн:

```
Энд `useMemo` ашиглавал дээр байх. Компонент render бүрт
шинээр object үүсч байна. Жишээ:

const memoizedValue = useMemo(() => ({
  lat: location.lat,
  lng: location.lng
}), [location.lat, location.lng]);
```

---

## Shared Packages ажиллах дүрэм

### packages/types

**Өөрчлөх өмнө:**

1. Багт мэдэгдэх (Breaking change эсэх)
2. Бүх хэрэглэгдэж байгаа газруудыг шалгах
3. Migration guide бичих (хэрэв breaking)

```bash
# Types хаана ашиглагдаж байгааг шалгах
nx graph --focus=types
```

### packages/ui-kit

**Компонент нэмэх:**

1. Storybook story нэмэх
2. Unit tests бичих
3. Documentation update
4. Export хийх (`index.ts`)

**Breaking change:**

- Major version bump
- CHANGELOG update
- Migration guide

### packages/utils

**Function нэмэх:**

1. JSDoc comments
2. Unit tests (100% coverage)
3. TypeScript types
4. Export хийх

---

## Merge Conflicts шийдвэрлэх

```bash
# develop-ийн сүүлийн өөрчлөлтүүдийг татах
git checkout develop
git pull origin develop

# Өөрийн branch руу merge хийх
git checkout feature/your-branch
git merge develop

# Conflicts шийдвэрлэх (VS Code editor дээр)
# ...

# Conflict шийдсэний дараа
git add .
git commit -m "merge: resolve conflicts with develop"
git push origin feature/your-branch
```

**Conflicts-аас зайлсхийх:**

- Өдөр бүр develop-тэй sync хий
- Жижиг, богино PR үүсгэ
- Багтайгаа ярилц

---

## CI/CD Pipeline (GitHub Actions)

### Automatic Checks

PR үүсгэх бүрт:

- ✅ Linting
- ✅ Type checking
- ✅ Unit tests
- ✅ Build verification
- ✅ E2E tests (critical paths)

### Workflow файлууд

```
.github/
  workflows/
    ci.yml          # PR checks
    deploy-dev.yml  # develop branch deploy
    deploy-prod.yml # main branch deploy
```

---

## Tips & Best Practices

### Daily Standup (15 минут)

**Format:**

- 🎯 Өчигдөр хийсэн зүйл
- 📅 Өнөөдөр хийх зүйл
- 🚧 Саад бэрхшээл

### Communication

**Хурдан асуулт:**

- Slack/Discord ашигла
- @mention хүнийг шууд дуудах

**Том өөрчлөлт:**

- GitHub Discussion үүсгэх
- RFC (Request for Comments) бич
- Багаар уулзаж ярилцах

### Code Ownership

**CODEOWNERS файл** (.github/CODEOWNERS):

```
# Backend services
/apps/services/auth-service/ @backend-dev-1
/apps/services/ride-service/ @backend-dev-2

# Frontend apps
/apps/hop-on/ @frontend-dev-1
/apps/admin-web/ @frontend-dev-2

# Shared packages (require both teams)
/packages/types/ @backend-dev-1 @backend-dev-2 @frontend-dev-1
/packages/ui-kit/ @frontend-dev-1 @frontend-dev-2
```

### Emergency Hotfix

```bash
# main branch-аас салбар үүсгэх
git checkout main
git pull origin main
git checkout -b hotfix/critical-payment-bug

# Засвар хийх
# ...

# Хурдан test
npm test

# Push & PR үүсгэх
git push origin hotfix/critical-payment-bug

# main руу шууд merge (fast review)
# develop руу бас merge хийх
```

---

## Resources

- [Nx Documentation](https://nx.dev)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- Project Architecture: `doc/Architecture_Overview.md`
- Database Schema: `doc/Database_Schema.sql`
- API Documentation: `doc/API_Documentation.md`

---

## Асуулт байвал

- 💬 Slack/Discord channel
- 📧 Team lead-тэй холбогдох
- 📖 Documentation шалгах
- 🤝 Багийн гишүүнээс асуух

**Remember:** Асуух нь дутуу биш! Багаар ажиллаж байгаа учир бие биедээ тусалцгаая. 🚀
