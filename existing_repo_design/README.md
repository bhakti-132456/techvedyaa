# TechVedyaa Website

This is the official website for TechVedyaa, built with Next.js 14, TypeScript, and Tailwind CSS.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

## Asset Optimization

### Images
To convert all PNG images in `public/images` to WebP:
```bash
npm run optimize:images
```

### Videos
To optimize MP4 videos (including the automation hero video) and generate WebM/Poster files:
```bash
npm run optimize:videos
```
*Note: Requires `ffmpeg` to be installed and available in your system PATH.*

## Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/`: Reusable UI components.
*   `lib/`: Utilities and constants (e.g., design tokens).
*   `public/`: Static assets (images, videos).
*   `scripts/`: Optimization scripts.

## Deployment

This project is ready to be deployed on Vercel or any platform supporting Next.js.
