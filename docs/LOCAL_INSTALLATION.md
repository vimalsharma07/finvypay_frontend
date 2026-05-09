# FinvyPay Frontend - Installation Guide

## Prerequisites

- Node.js 22.1.0 (LTS)
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone git@github.com:Keyur19041991/finvypay_frontend.git
   cd finvypay_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Troubleshooting

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Port 3000 already in use?**
```bash
PORT=3001 npm run dev
```

**Build errors?**
- Check `.env` is configured (copy from `.env.example` if missing)
- Verify Node.js version: `node --version` (should be v22.1.0)
- Clear Next.js cache: `rm -rf .next`
