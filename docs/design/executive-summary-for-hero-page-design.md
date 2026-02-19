# AccountabilityAtlas — Executive Summary for Landing Page Design

## What Is AccountabilityAtlas?

AccountabilityAtlas is a web application for discovering and sharing geo-located videos of constitutional rights audits across the United States. "Auditing" is a growing citizen movement where people exercise their rights (filming in public, entering government buildings, interacting with police) and record the encounters on video to document how authorities respond.

The platform lets anyone browse an interactive map to find audit videos by location, and lets registered users contribute videos by linking YouTube URLs, tagging them with relevant constitutional amendments and participant types, and pinning them to the map where the encounter happened.

### The Problem It Solves

Thousands of audit videos exist on YouTube but they're scattered across hundreds of channels with no geographic context. If you want to know "what encounters have happened near me?" or "which states have the most 4th Amendment violations?", there's no way to find out. AccountabilityAtlas organizes this content geographically and by constitutional category, making patterns visible that are invisible when videos live only on YouTube.

### Target Users

- **Casual browsers**: People curious about auditing culture or what's happening in their area
- **Auditors**: People who film encounters and want to share their work with geographic context
- **Researchers/journalists**: People studying patterns in how authorities respond to constitutionally-protected activity
- **Civil rights advocates**: People tracking accountability trends across jurisdictions

## Core Concepts

### Amendments

Videos are tagged with the constitutional amendments being exercised or tested in the encounter:

| Amendment         | Common Audit Scenarios                                             |
| ----------------- | ------------------------------------------------------------------ |
| **1st Amendment** | Filming in public, entering government buildings, recording police |
| **2nd Amendment** | Open carry audits, gun shop encounters                             |
| **4th Amendment** | Unlawful search/seizure, traffic stops, ID demands                 |
| **5th Amendment** | Right to remain silent, refusal to identify                        |

### Participant Types

Each video is tagged with who was involved in the encounter:

- **Police** — Law enforcement officers
- **Government** — Government employees, officials, postal workers
- **Business** — Private business owners, employees
- **Citizen** — Bystanders, other members of the public
- **Security** — Private security guards, bouncers

### Trust Tiers

Users progress through trust levels: **New** → **Basic** → **Trusted** → **Verified** → **Moderator**. Trusted users' video submissions are auto-approved; others go through moderation.

### Video Lifecycle

A submitted video goes through: **Pending** (awaiting moderation) → **Approved** (visible on map) → or **Rejected** (with reason). Only approved videos appear on the public map.

## Application Routes and How They Connect

```
                    ┌──────────────┐
                    │   Home (/)   │
                    │  Landing pg  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Login   │ │   Map    │ │ Register │
        │ /login   │ │  /map    │ │/register │
        └────┬─────┘ └────┬─────┘ └──────────┘
             │            │
             │       ┌────┴────┐
             │       ▼         ▼
             │ ┌──────────┐ ┌──────────────┐
             │ │  Video   │ │ Video Submit │
             │ │  Detail  │ │ /videos/new  │
             │ │/videos/id│ └──────────────┘
             │ └────┬─────┘
             │      │
             │      ▼
             │ ┌──────────────┐    ┌──────────┐
             │ │Public Profile│    │ Profile  │
             │ │ /users/[id]  │    │ /profile │
             │ └──────────────┘    └──────────┘
             │
             └──── (redirects back after login)
```

### Route Details

| Route              | URL            | Purpose                                                                     | Requires Login? |
| ------------------ | -------------- | --------------------------------------------------------------------------- | --------------- |
| **Home**           | `/`            | Landing page — the page being redesigned                                    | No              |
| **Map**            | `/map`         | Interactive map with video markers, filters, and video list sidebar         | No              |
| **Video Detail**   | `/videos/[id]` | YouTube embed, metadata, location mini-map, submitter link                  | No              |
| **Video Submit**   | `/videos/new`  | Multi-step form: YouTube URL → metadata/tags → location picker → submit     | Yes             |
| **Login**          | `/login`       | Email/password sign-in                                                      | No              |
| **Register**       | `/register`    | Email, display name, password registration                                  | No              |
| **My Profile**     | `/profile`     | Edit display name, avatar, social links, privacy settings; view submissions | Yes             |
| **Public Profile** | `/users/[id]`  | Read-only view of another user's profile                                    | No              |

### How Routes Connect

- **Home** is the entry point, linking to **Map** (primary CTA), **Login**, and **Register**
- **Map** is the core experience — users browse videos geographically, click markers to see info cards, and click through to **Video Detail**
- **Video Detail** shows the full video with metadata; links to the **Map** (fly to location) and the submitter's **Public Profile**
- **Video Submit** (authenticated only) walks through a multi-step form and redirects to the new **Video Detail** on success
- **NavBar** (persistent on all pages) always shows "Explore Map"; authenticated users also see "Submit Video" and their profile link

### The Map Page (Primary Experience)

The map page is the heart of the application:

- **Desktop layout**: Mapbox GL map on the right (~70% width), scrollable video list sidebar on the left (~350px)
- **Mobile layout**: Full-screen map with a draggable bottom sheet containing the video list
- **Clusters**: At low zoom levels, nearby videos cluster into numbered markers; clicking a cluster zooms in
- **Individual markers**: At higher zoom, each video shows as a pin; clicking shows an info card popup
- **Filters**: Amendment type chips, participant type chips, date range — filter both the map markers and the video list
- **Location search**: Geocoding search bar to fly to any address or city
- **Video list**: Updates dynamically based on map viewport bounds and active filters
- **URL sharing**: Map state (lat/lng/zoom) is encoded in URL query params for sharing specific views

## The Current Home Page

The current home page (`/`) is a minimal placeholder — a single centered card with no visual design:

**For unauthenticated visitors:**

- Title: "AccountabilityAtlas"
- Subtitle: "Geo-located video curation for constitutional rights audits"
- Three buttons stacked vertically: "Explore Map", "Sign In", "Create Account"

**For authenticated users:**

- Title: "AccountabilityAtlas"
- Welcome message: "Welcome, {displayName}!"
- Three buttons stacked vertically: "Explore Map", "View Profile", "Sign Out"

There is no hero imagery, no explanation of the platform's purpose, no preview of the map experience, no sample content, and no visual storytelling. It's a functional routing page, not a landing page.

## Technical Context for the Designer

- **Framework**: Next.js 14 (React) with Tailwind CSS for styling
- **UI components**: Custom Card, Button components using Tailwind utility classes
- **Map library**: Mapbox GL JS (not Google Maps)
- **Video source**: All videos are YouTube embeds (the platform does not host video)
- **Responsive**: The app supports both desktop and mobile layouts
- **Color scheme**: Currently using default Tailwind grays/blues, no established brand palette
- **The NavBar is persistent**: Any landing page design should account for the existing top navigation bar (logo + "Explore Map" + auth buttons)

## What We're Looking For

A hero/landing page design that:

1. **Communicates the mission** — what AccountabilityAtlas is and why it matters, in seconds
2. **Shows, doesn't just tell** — previews the map experience or sample content so visitors understand what they'll find
3. **Drives action** — clear CTAs to explore the map (primary) and create an account (secondary)
4. **Feels credible** — professional enough for journalists, researchers, and civil rights organizations to take seriously
5. **Works on mobile** — responsive design that doesn't rely solely on wide desktop layouts
