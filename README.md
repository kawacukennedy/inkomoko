# Inkomoko - The Living Archive

A digital platform for preserving and sharing Rwanda's oral histories. Inkomoko connects elders who carry traditional knowledge with youth who seek to learn from their heritage.

![Inkomoko](https://img.shields.io/badge/version-1.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)

## About

Inkomoko (meaning "the hearth" in Kinyarwanda) is a living archive that:

- **Preserves oral traditions** - Elders record stories, songs, proverbs, and cultural practices
- **Connects generations** - Youth discover and learn from their cultural heritage
- **Strengthens families** - Shared family archives keep memories alive across generations
- **Celebrates culture** - A community space for Rwanda's rich storytelling tradition

## Features

### For Elders
- Record and upload oral histories with audio support
- Manage personal story library
- Track engagement (plays, gratitude, comments)
- Family management and member approval
- Analytics dashboard

### For Youth
- Browse public library of stories
- Search and filter by region, category, era
- Bookmark favorite stories
- Show gratitude to storytellers
- Join family archives
- Follow favorite elders

### Core Functionality
- JWT-based authentication
- Role-based access (elder/youth)
- Family spaces with invite codes
- Story categories: story, tradition, song, proverb, culture
- Region-based filtering
- Trending and featured stories
- Offline PWA support

## Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT with bcrypt
- **API**: RESTful JSON API
- **Deployment**: Render

### Frontend
- **Type**: Progressive Web App (PWA)
- **Styling**: Custom CSS with design system
- **API Client**: Vanilla JavaScript
- **Deployment**: Vercel

### Database
- **Provider**: Supabase (PostgreSQL)
- **Migrations**: SQL schema files

## Project Structure

```
inkomoko/
├── backend/                 # Express.js API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API route handlers
│   │   ├── auth.js         # Login, signup
│   │   ├── users.js        # User management
│   │   ├── stories.js      # Story CRUD
│   │   ├── families.js     # Family management
│   │   └── library.js      # Public library
│   ├── server.js           # Express app entry
│   └── package.json
│
├── frontend/               # PWA frontend
│   ├── index.html          # Welcome page
│   ├── auth.html           # Login/signup
│   ├── onboarding.html     # Profile setup
│   ├── library.html        # Public library
│   ├── explore.html        # Search/explore
│   ├── story.html          # Story detail
│   ├── elder-dashboard.html
│   ├── youth-dashboard.html
│   ├── record.html         # Record story (elder)
│   ├── family.html         # Family space
│   ├── family-manager.html # Manage family
│   ├── settings.html       # User settings
│   ├── elder-profile.html  # Public elder profiles
│   ├── js/                 # JavaScript utilities
│   │   ├── api.js          # API client
│   │   ├── app.js          # App logic
│   │   └── components.js   # UI components
│   ├── css/                # Stylesheets
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
│
├── database/               # Database schema
│   ├── 001_schema.sql      # Table definitions
│   └── 002_seed.sql        # Sample data
│
└── design/                 # UI mockups
    ├── 1._landing_page_public_1/
    ├── 2._sign_up_log_in/
    └── ...                 # All page designs
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Supabase)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/kawacukennedy/inkomoko.git
   cd inkomoko
   ```

2. **Setup database**
   ```bash
   # Create PostgreSQL database
   psql -U postgres -c "CREATE DATABASE inkomoko;"
   
   # Run schema
   psql -U postgres -d inkomoko -f database/001_schema.sql
   
   # (Optional) Seed data
   psql -U postgres -d inkomoko -f database/002_seed.sql
   ```

3. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database URL
   ```

4. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Start the server**
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

6. **Serve frontend**
   ```bash
   # Option 1: Use any static server
   npx serve frontend
   
   # Option 2: Backend serves frontend automatically
   # Visit http://localhost:3000
   ```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/settings` | Get user settings |
| PUT | `/api/users/settings` | Update settings |
| GET | `/api/users/:id` | Get public profile |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories` | List stories |
| GET | `/api/stories/trending` | Trending stories |
| GET | `/api/stories/feed` | Family feed |
| POST | `/api/stories` | Create story |
| GET | `/api/stories/:id` | Get story |
| PUT | `/api/stories/:id` | Update story |
| DELETE | `/api/stories/:id` | Delete story |
| POST | `/api/stories/:id/gratitude` | Toggle gratitude |
| POST | `/api/stories/:id/bookmark` | Toggle bookmark |
| POST | `/api/stories/:id/play` | Record play |
| POST | `/api/stories/:id/comments` | Add comment |

### Families
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/families/my` | Get my families |
| POST | `/api/families` | Create family |
| POST | `/api/families/join` | Join by code |
| GET | `/api/families/:id/members` | Get members |

### Library
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/library/featured` | Featured story |
| GET | `/api/library/stats` | Library statistics |
| GET | `/api/library/archive` | Story archive |
| GET | `/api/library/categories` | Category list |
| GET | `/api/library/near-me` | Stories by region |

## Demo Accounts

After running seed data:

| Role | Email | Password |
|------|-------|----------|
| Elder | `gakwaya@inkomoko.rw` | `inkomoko123` |
| Elder | `karekezi@inkomoko.rw` | `inkomoko123` |
| Youth | `keza@inkomoko.rw` | `inkomoko123` |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

### Quick Deploy

1. **Supabase** - Create project, run schema SQL
2. **Render** - Deploy backend with database URL
3. **Vercel** - Deploy frontend with API URL

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/inkomoko
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
PORT=3000
```

### Frontend
```
API_URL=https://your-render-app.onrender.com/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contact

For questions or contributions, please open an issue on GitHub.

---

*Inkomoko - Preserving Rwanda's oral traditions for future generations.*