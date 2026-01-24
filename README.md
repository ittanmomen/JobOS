# JobOS - Job Search Command Center

A comprehensive job search CRM application built with React, TypeScript, and Tailwind CSS. Track opportunities, manage contacts, organize tasks, and monitor your job search progress.

## Features

- **Three Pipeline Systems**: Discovery, Applications, and Networking
- **Kanban Boards**: Drag-and-drop interface for managing opportunities
- **Task Management**: Schedule and track follow-ups
- **Company Database**: Organize target companies
- **Analytics Dashboard**: Monitor weekly progress
- **Supabase Integration**: Optional cloud sync with authentication
- **Demo Mode**: Works offline with localStorage

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

1. **Update `package.json`**: Replace `YOUR-USERNAME` and `jobos-app` with your GitHub username and repository name:
   ```json
   "homepage": "https://YOUR-USERNAME.github.io/your-repo-name"
   ```

2. **Update `vite.config.ts`**: Change the base path to match your repository name:
   ```typescript
   base: '/your-repo-name/',
   ```

3. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/your-repo-name.git
   git push -u origin main
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages"
   - Set source to `gh-pages` branch
   - Save

Your app will be live at `https://YOUR-USERNAME.github.io/your-repo-name`

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Supabase (optional backend)

## Usage

### Demo Mode
Click "Continue as Guest" to use the app with local storage only.

### Cloud Mode
1. Set up a Supabase project
2. Update the Supabase URL and Anon Key in Settings
3. Create an account or sign in
4. Your data will sync across devices

## License

MIT
