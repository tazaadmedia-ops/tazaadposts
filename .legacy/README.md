# Tazaad Post Designer

A simple tool for creating social media news posts. Upload an image, add your text, and download a ready-to-post graphic (1080×1250px).

## Quick Start

1. **Install dependencies** (one-time):
   ```bash
   npm install
   ```

2. **Run the app**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Add background image** – Drag and drop an image onto the upload area, or click to choose a file.
2. **Add text** – Type your news text in the "Post Text" box. This appears at the bottom with a dark overlay for readability.
3. **Highlight phrase** (optional) – Enter a phrase to highlight in yellow (e.g. a key quote).
4. **Download** – Click "Download Post" to save the image as a PNG file.

The post includes the Tazaad logo in the top-left and your text on a semi-transparent black overlay at the bottom, with the image visible behind it.

## Build for Production

```bash
npm run build
npm start
```
