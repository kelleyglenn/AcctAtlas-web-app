# AcctAtlas Web App

Next.js web application for AccountabilityAtlas. Provides an interactive map interface for discovering and browsing constitutional audit videos, with features for user authentication, video submission, and content moderation.

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **Docker Desktop** (for running backend services)
- **Mapbox Account** (for map functionality)

## Clone and Build

```bash
git clone <repo-url>
cd AcctAtlas-web-app
npm install
```

## Local Development

### Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

Get a Mapbox access token at https://account.mapbox.com/access-tokens/

### Start backend services

From the top-level AccountabilityAtlas directory:

```bash
docker-compose --profile backend up -d
```

### Run the development server

```bash
npm run dev
```

The application starts on **http://localhost:3000**.

### Run tests

```bash
npm test
```

### Code formatting

```bash
# Check formatting
npm run format:check

# Auto-fix formatting
npm run format
```

### Linting

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix
```

## Docker Image

Build a production Docker image:

```bash
docker build -t acctatlas-web-app .
```

Or run via the top-level docker-compose:

```bash
# From AccountabilityAtlas root
docker-compose --profile frontend up -d
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes (login, register)
│   ├── map/                # Interactive map page
│   ├── videos/[id]/        # Video detail page
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Base UI components (Button, Chip, Toast)
│   ├── map/                # Map components (MapView, VideoMarker, etc.)
│   └── auth/               # Auth components (LoginForm, etc.)
├── hooks/                  # Custom React hooks
│   ├── useVideoSearch.ts   # Video search with TanStack Query
│   ├── useLocationClusters.ts
│   └── useResponsive.ts
├── lib/
│   ├── api/                # API client and endpoint functions
│   └── utils/              # General utilities
├── providers/              # React Context providers
│   ├── AuthProvider.tsx    # Authentication state
│   ├── QueryProvider.tsx   # TanStack Query client
│   └── MapProvider.tsx     # Map viewport and filter state
├── config/                 # Configuration
│   └── mapbox.ts           # Mapbox settings
└── types/                  # TypeScript type definitions
```

## Key npm Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start development server                 |
| `npm run build`        | Build for production                     |
| `npm start`            | Start production server                  |
| `npm test`             | Run tests                                |
| `npm run test:watch`   | Run tests in watch mode                  |
| `npm run lint`         | Check for lint errors                    |
| `npm run lint:fix`     | Auto-fix lint errors                     |
| `npm run format`       | Auto-fix formatting                      |
| `npm run format:check` | Check formatting                         |
| `npm run check`        | Full quality gate (format + lint + test) |

## Documentation

- [Technical Overview](docs/technical.md) - Architecture, API integration, design decisions
