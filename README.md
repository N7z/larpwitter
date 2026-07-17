# Larpwitter

<img width="88" height="18" alt="image" src="https://github.com/user-attachments/assets/7b3a7346-bff3-4809-ba11-38998df8018d" />

A Twitter-style microblogging app built with Laravel 12, React 19, and Inertia.js.

Users can publish short posts (up to 500 characters), reply, repost, like, follow other users, and browse hashtags. The home feed mixes posts from followed users with recommendations. Admins get a panel for managing users and moderating posts.

## Features

- Posts with replies, reposts, and likes
- Follow system with a recommendation-driven feed
- Hashtags with dedicated tag pages
- Notifications (polling-based, tuned to keep database load low)
- Profiles with avatar, display name, and bio
- Verified badges, granted through the admin panel
- Admin panel: dashboard, user management (verification, admin toggle, password reset, deletion), and post moderation
- Login and registration with rate limiting, plus password reset
- `robots.txt` and `sitemap.xml` for search engines

## Tech stack

- **Backend:** Laravel 12 (PHP 8.2+), Laravel Octane
- **Frontend:** React 19 with Inertia.js, built with Vite
- **Storage:** S3-compatible object storage via Flysystem
- **Dev tooling:** Pint (code style), Pail (log tailing), Sail, Nightwatch

## Installation

Requirements: PHP 8.2+, Composer, Node.js with npm.

```bash
git clone https://github.com/N7z/larpwitter.git
cd larpwitter
composer run setup
```

The `setup` script installs PHP and JS dependencies, copies `.env.example` to `.env`, generates the application key, runs migrations, and builds the frontend assets. Review `.env` afterwards to configure your database and S3 credentials.

## Development

```bash
composer run dev
```

This runs the web server, queue worker, log tailing, and Vite dev server together in a single terminal.

To check code style before committing:

```bash
vendor/bin/pint
```

## License

MIT
