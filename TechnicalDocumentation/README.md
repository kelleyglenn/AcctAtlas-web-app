# Web Application - Technical Documentation

## Service Overview

The Web Application is a map-first video discovery interface for AccountabilityAtlas. It provides users with an interactive map experience to browse, search, and submit accountability-related video content. The application serves as the primary web client, consuming APIs from backend microservices through the API Gateway.

## Responsibilities

- User authentication UI (login, registration, OAuth flows)
- Interactive map interface for video discovery
- Video browsing with filtering and search
- Video submission forms with location tagging
- User profile management
- Moderation dashboard for moderator/admin users
- Trust tier-aware feature gating

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 |
| Language | TypeScript |
| Server State | TanStack Query (React Query) |
| UI State | React Context |
| Map SDK | Google Maps JavaScript SDK |
| Styling | Tailwind CSS (recommended) |
| Testing | Jest, React Testing Library |
| Linting | ESLint |
| Formatting | Prettier |

## Dependencies

- **API Gateway**: All backend API requests route through the gateway at `/api/v1/*`
- **Google Maps Platform**: Map display, marker clustering, geocoding
- **YouTube Embed**: Video playback via YouTube iframe embeds

## Documentation Index

| Document | Status | Description |
|----------|--------|-------------|
| [component-library.md](component-library.md) | Planned | Shared UI component documentation |
| [state-management.md](state-management.md) | Planned | TanStack Query and Context patterns |
| [api-integration.md](api-integration.md) | Planned | API client and endpoint consumption |
| [authentication-flow.md](authentication-flow.md) | Planned | JWT handling and auth state |
| [map-integration.md](map-integration.md) | Planned | Google Maps SDK integration |
| [routing-structure.md](routing-structure.md) | Planned | Next.js App Router organization |

## Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes (login, register)
│   ├── (main)/             # Main app routes
│   │   ├── map/            # Map view (default)
│   │   ├── videos/         # Video list and detail
│   │   ├── search/         # Search results
│   │   ├── submit/         # Video submission
│   │   └── profile/        # User profile
│   └── (moderator)/        # Moderator-only routes
│       └── moderation/     # Moderation dashboard
├── components/
│   ├── ui/                 # Base UI components
│   ├── map/                # Map-related components
│   ├── video/              # Video display components
│   └── forms/              # Form components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── api/                # API client and endpoints
│   ├── auth/               # Auth utilities
│   └── utils/              # General utilities
├── providers/              # React Context providers
│   ├── AuthProvider.tsx    # Authentication state
│   ├── QueryProvider.tsx   # TanStack Query client
│   └── MapProvider.tsx     # Google Maps context
└── types/                  # TypeScript type definitions
```

## Key Features/Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Redirects to map view |
| `/map` | Public | Interactive map with video markers |
| `/videos` | Public | Paginated video list with filters |
| `/videos/[id]` | Public | Video detail with embedded player |
| `/search` | Public | Full-text search results |
| `/login` | Public | Email/password and OAuth login |
| `/register` | Public | Account registration |
| `/submit` | User | Video submission form |
| `/profile` | User | User profile and settings |
| `/moderation` | Moderator | Moderation queue dashboard |
| `/moderation/[id]` | Moderator | Individual moderation item review |

## API Integration

### Authentication (User Service)

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/v1/auth/register` | POST | Account registration |
| `/api/v1/auth/login` | POST | Email/password login |
| `/api/v1/auth/oauth/{provider}` | POST | OAuth login (Google, Apple) |
| `/api/v1/auth/refresh` | POST | Token refresh |
| `/api/v1/auth/logout` | POST | Session invalidation |
| `/api/v1/users/me` | GET | Current user profile |
| `/api/v1/users/me` | PUT | Update profile |

### Videos (Video Service)

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/v1/videos` | GET | List videos (paginated) |
| `/api/v1/videos/{id}` | GET | Video details |
| `/api/v1/videos` | POST | Submit new video |
| `/api/v1/videos/{id}` | PUT | Update video (owner) |
| `/api/v1/videos/{id}` | DELETE | Delete video (owner/mod) |
| `/api/v1/videos/{id}/locations` | GET | Video locations |
| `/api/v1/videos/{id}/locations` | POST | Add location to video |

### Locations (Location Service)

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/v1/locations` | GET | Locations in bounding box |
| `/api/v1/locations/{id}` | GET | Location details |
| `/api/v1/locations` | POST | Create new location |
| `/api/v1/locations/cluster` | GET | Clustered markers for viewport |
| `/api/v1/locations/geocode` | GET | Address to coordinates |
| `/api/v1/locations/reverse` | GET | Coordinates to address |

### Search (Search Service)

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/v1/search` | GET | Execute search query |
| `/api/v1/search/suggest` | GET | Autocomplete suggestions |
| `/api/v1/search/facets` | GET | Available facet values |

### Moderation (Moderation Service)

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/v1/moderation/queue` | GET | Pending moderation items |
| `/api/v1/moderation/queue/{id}` | GET | Item details |
| `/api/v1/moderation/queue/{id}/approve` | POST | Approve content |
| `/api/v1/moderation/queue/{id}/reject` | POST | Reject with reason |
| `/api/v1/moderation/reports` | GET | Abuse reports |
| `/api/v1/moderation/reports` | POST | Submit abuse report |

## Key Design Decisions

### ADR-WEB-001: Next.js over Create React App

**Decision**: Use Next.js with App Router

**Rationale**:
- Server-side rendering (SSR) for SEO on public video pages
- File-based routing reduces boilerplate
- Built-in API routes for BFF pattern if needed
- Static generation (SSG) for content pages
- Excellent TypeScript support

### ADR-WEB-002: TanStack Query for Server State

**Decision**: Use TanStack Query (React Query) for API data

**Rationale**:
- Automatic caching and background refetching
- Built-in loading and error states
- Optimistic updates for better UX
- Query invalidation for data consistency
- DevTools for debugging

### ADR-WEB-003: React Context for UI State

**Decision**: Use React Context for authentication and UI preferences

**Rationale**:
- Lightweight solution for global UI state
- No additional dependencies
- Sufficient for auth state and theme preferences
- Server state handled separately by TanStack Query

### ADR-WEB-004: JWT Token Handling

**Decision**: Store access token in memory, refresh token in httpOnly cookie

**Rationale**:
- Access token in memory prevents XSS token theft
- httpOnly cookie prevents JavaScript access to refresh token
- Automatic token refresh on 401 responses
- Secure against common web vulnerabilities

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API Gateway URL and Google Maps API key

# Run development server
npm run dev

# Application available at http://localhost:3000

# Run tests
npm test

# Run linting (ESLint)
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting (Prettier)
npm run format:check

# Auto-fix formatting
npm run format

# Build for production
npm run build
```

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
```
