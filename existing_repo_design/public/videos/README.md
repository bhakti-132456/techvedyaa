# Video Assets

This directory contains the video assets for the TechVedyaa website.

## Production Files

*   `video_automation_hero_n8n.mp4`: The primary hero video for the Automation page.
    *   **Source**: `source_n8n_workflow.mp4` (Original n8n workflow recording)
    *   **Poster**: `/public/images/poster_automation_hero.webp`
*   `video_ai_ads_hero.mp4`: The hero video for the AI Ads page.
    *   **Source**: `video_ai_ads_hero.mp4`
    *   **Poster**: `/public/images/poster_ai_ads_hero.webp`

## Notes

*   `ffmpeg` was not available during the initial setup, so these files are currently copies of the source files.
*   To optimize them for production (reduce size, generate WebM), install `ffmpeg` and run `npm run optimize:videos`.
