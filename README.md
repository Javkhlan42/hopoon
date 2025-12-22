# HopOn

Ride-sharing platform monorepo built with Nx, NestJS, and Next.js.

## 🚀 Quick Start (Running on New Device)

### Prerequisites

- Node.js 18+ and npm
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Bagee1/hope-on.git
cd hop-on
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The `.env` files are already configured with Neon database credentials. All services will connect to the cloud database automatically.

**Services:**
- Auth Service (Port 3001)
- API Gateway (Port 3000)
- Ride Service (Port 3003)
- Booking Service (Port 3004)
- Payment Service (Port 3005)
- Chat Service (Port 3006)
- Notification Service (Port 3007)

### 4. Start All Services

**Windows:**
```powershell
.\start-all-services.ps1
```

**Linux/Mac:**
```bash
# Start each service manually in separate terminals:
cd apps/services/auth-service && npm run dev
cd apps/services/api-gateway && npm run dev
cd apps/services/ride-service && npm run dev
cd apps/services/booking-service && npm run dev
cd apps/services/payment-service && npm run dev
cd apps/services/chat-service && npm run dev
cd apps/services/notification-service && npm run dev
```

### 5. Test the Services

```powershell
# Check if services are running
curl http://localhost:3001/auth/me

# Register a new user
$body = @{phone='+97699999999';email='test@example.com';password='password123';name='Test User'} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/auth/register -Method POST -Body $body -ContentType 'application/json'

# Login
$body = @{phone='+97699999999';password='password123'} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method POST -Body $body -ContentType 'application/json'
```

## 📚 Architecture

This is a microservices architecture with:
- **Frontend:** Next.js app (`apps/hop-on`)
- **Backend Services:** 7 NestJS microservices
- **Database:** Neon PostgreSQL (Cloud)
- **Shared Packages:** TypeScript types, utilities, UI components

## 🔧 Development

### Run Individual Service

```bash
cd apps/services/auth-service
npm run dev
```

### Database Management

```bash
# Reseed database with test data
cd infra/db
node neon-reseed.js
```

## 📖 Documentation

- [Architecture Overview](doc/Architecture_Overview.md)
- [Backend Services](doc/BACKEND_SERVICES.md)
- [API Documentation](doc/API_Documentation.md)
- [Database Setup](infra/db/README.md)

---

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Built with [Nx workspace](https://nx.dev) ✨

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run the dev server for your app, use:

```sh
npx nx dev hop-on
```

To create a production bundle:

```sh
npx nx build hop-on
```

To see all available targets to run for a project, run:

```sh
npx nx show project hop-on
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
