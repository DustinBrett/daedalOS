# 📚 Taqyudin's Portfolio - Code Structure Documentation

## 🌟 Overview

This is a web-based desktop environment portfolio built with Next.js, TypeScript, and React. It simulates a complete Windows-like operating system in the browser with file management, applications, and customizable desktop environment.

## 🏗️ Project Structure

```
📁 WindowsOnYourWeb/
├── 📁 .github/workflows/           # GitHub Actions CI/CD
├── 📁 .husky/                      # Git hooks (pre-commit, etc.)
├── 📁 .next/                       # Next.js build output
├── 📁 components/                  # React components
│   ├── 📁 apps/                    # Application components
│   ├── 📁 pages/                   # Page-level components
│   └── 📁 system/                  # System UI components
├── 📁 contexts/                    # React Context providers
├── 📁 e2e/                        # End-to-end tests (Playwright)
├── 📁 hooks/                       # Custom React hooks
├── 📁 pages/                       # Next.js pages
├── 📁 public/                      # Static files & virtual file system
├── 📁 scripts/                     # Build and utility scripts
├── 📁 styles/                      # Global styles and themes
├── 📁 utils/                       # Utility functions and constants
├── 📁 node_modules/                # Dependencies
├── 📄 package.json                 # Project configuration
├── 📄 README.md                    # Project README
└── 📄 DOCUMENTATION.md             # This file
```

## 🎯 Core Directories Explained

### 📁 `components/`

Contains all React components organized by functionality:

#### `components/apps/`

Individual applications that can run in windows:

- **Browser/** - Web browser with bookmarks, history
- **FileExplorer/** - File manager with navigation, search
- **MonacoEditor/** - Code editor with syntax highlighting
- **Terminal/** - Command-line interface with file system access
- **PDF/** - PDF viewer with controls
- **Photos/** - Image viewer with zoom/pan
- **Paint/** - Image editor (MS Paint clone)
- **VideoPlayer/** - Video player with controls
- **And 20+ more applications**

#### `components/system/`

Core system UI components:

- **Desktop/** - Desktop background and wallpaper system
- **Taskbar/** - Bottom taskbar with start menu, clock, search
- **StartMenu/** - Application launcher and navigation
- **Window/** - Window management (resize, drag, minimize)
- **Files/** - File system abstraction and file operations
- **Dialogs/** - System dialogs (Properties, Run, etc.)

### 📁 `contexts/`

React Context providers for global state:

- **fileSystem/** - Virtual file system management
- **process/** - Running processes and window management
- **session/** - User session, settings, wallpaper
- **menu/** - Context menus and menu state

### 📁 `public/`

Static assets and virtual file system:

#### `public/Users/Public/`

Virtual user directory structure:

- **Desktop/** - Desktop shortcuts and folders
- **Documents/** - User documents
- **Pictures/** - Images and wallpapers
- **Start Menu/** - Application shortcuts
- **Music/**, **Videos/** - Media folders

#### `public/Program Files/`

Installed applications and their assets:

- **Browser/** - Browser engine files
- **MonacoEditor/** - Code editor assets
- **EmulatorJs/** - Game emulation cores
- **Webamp/** - Winamp music player
- **And many more applications**

#### `public/System/`

System files and resources:

- **Icons/** - Application and file type icons (16x16 to 144x144)
- **Wallpapers/** - Dynamic wallpaper engines
- **Libraries/** - WebAssembly modules and libraries

### 📁 `utils/`

Utility functions and constants:

- **constants.ts** - Global configuration and constants
- **functions.ts** - Helper functions
- **imageDecoder.ts** - Image format support

### 📁 `scripts/`

Build and development scripts:

- **fs2json.js** - Converts file system to JSON
- **preloadIcons.js** - Generates icon cache
- **rssBuilder.js** - Creates RSS feed
- **searchIndex.js** - Builds search index

## 🔧 Key Technologies

### Frontend Framework

- **Next.js 15** - React framework with SSR/SSG
- **React 19** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript

### Styling

- **Styled Components** - CSS-in-JS styling
- **Motion (Framer Motion)** - Animations and transitions

### File System

- **BrowserFS** - Virtual file system in browser
- **IndexedDB** - Persistent storage

### Applications & Features

- **Monaco Editor** - VS Code editor engine
- **Xterm.js** - Terminal emulator
- **PDF.js** - PDF rendering
- **Video.js** - Video playback
- **WebAssembly** - High-performance applications

## 🎨 Customization Guide

### 🖼️ Changing Wallpaper

1. Add image to `public/Users/Public/Pictures/`
2. Update `utils/constants.ts`:
   ```typescript
   export const DEFAULT_WALLPAPER = "/Users/Public/Pictures/your-wallpaper.jpg";
   ```
3. **IMPORTANT**: Update `public/session.json` to override browser cache:
   ```json
   {
     "wallpaperImage": "/Users/Public/Pictures/your-wallpaper.jpg",
     "wallpaperFit": "fill"
   }
   ```
4. **Clear browser localStorage**: Open DevTools → Application → Local Storage → Clear All
5. Or right-click desktop → Properties → Select your wallpaper from list

**Note**: Browser localStorage often overrides constants.ts, so session.json + clear cache is most reliable method.

### 🎯 Adding Desktop Items

1. **Folders**: Create directory in `public/Users/Public/Desktop/`
2. **Files**: Place files directly in Desktop folder
3. **Shortcuts**: Create `.url` files:
   ```ini
   [InternetShortcut]
   BaseURL=https://example.com
   IconFile=/System/Icons/chromium.webp
   ```

### 🚀 Adding Start Menu Items

Create `.url` files in `public/Users/Public/Start Menu/`:

```ini
[InternetShortcut]
BaseURL=/path/to/app
IconFile=/System/Icons/app.webp
```

### 🎨 Customizing Logo/Branding

1. **Start Button**: Edit `components/system/Taskbar/StartButton/StartButtonIcon.tsx`
2. **Favicon**: Replace `public/favicon.ico`
3. **Site Info**: Update `utils/constants.ts` PACKAGE_DATA

### 🖱️ Adding New Applications

1. Create component in `components/apps/YourApp/`
2. Add to `contexts/process/directory.ts`
3. Add icon to `public/System/Icons/`
4. Create start menu shortcut

## 🔄 Development Workflow

### 📦 Installation

```bash
yarn install
```

### 🛠️ Development

```bash
yarn build:prebuild    # Build file system and assets
yarn dev               # Start development server
```

### 🚀 Production Build

```bash
yarn build             # Build for production
yarn serve             # Serve production build
```

### 🧪 Testing

```bash
yarn test              # Unit tests
yarn e2e               # End-to-end tests
yarn lint              # Code linting
yarn prettier          # Code formatting
```

## 📱 File System Structure

The virtual file system mimics Windows structure:

```
/
├── Program Files/           # Installed applications
├── System/                  # System files and libraries
├── Users/Public/           # User directory
│   ├── Desktop/            # Desktop items
│   ├── Documents/          # User documents
│   ├── Pictures/           # Images and wallpapers
│   ├── Music/              # Audio files
│   ├── Videos/             # Video files
│   └── Start Menu/         # Application shortcuts
└── [Root Files]            # System files (sitemap, robots, etc.)
```

## 🎯 Key Features

### 🖥️ Desktop Environment

- Resizable, draggable windows
- Taskbar with start menu, search, clock
- Context menus and keyboard shortcuts
- File explorer with multiple view modes
- Wallpaper system with dynamic backgrounds

### 💾 File System

- Virtual file system with persistent storage
- Drag & drop file operations
- ZIP/archive support
- File type associations
- Search functionality

### 🎮 Applications

- **25+ Built-in Apps**: Browser, code editor, games, media players
- **Emulation**: DOS games, console ROMs
- **Development Tools**: Terminal, code editor, git support
- **Media**: Photo viewer, video player, music player
- **Productivity**: PDF viewer, text editor, paint program

### 🎨 Customization

- Multiple themes and wallpapers
- Customizable desktop layout
- Personalized start menu
- Custom application icons

## 🐛 Common Issues & Solutions

### Build Errors

- **Icon preload issues**: Check `desktop.ini` files for correct syntax
- **Line ending problems**: Ensure Unix line endings (LF) for scripts
- **Missing dependencies**: Run `yarn install`

### Runtime Issues

- **Wallpaper not changing**: Clear browser localStorage
- **Apps not loading**: Check file paths in directory.ts
- **Performance issues**: Reduce animation settings

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Run linting: `yarn lint && yarn prettier`
5. Commit: `git commit -m "Add new feature"`
6. Push and create pull request

## 📄 License

MIT License - See LICENSE file for details.

---

**Portfolio Customized for Taqyudin**

- 🎨 White T logo design
- 🖼️ Windows XP Bliss wallpaper
- 📧 Contact: ikbaltaqyudin@gmail.com
- 🌐 Website: https://taqyudin.com
