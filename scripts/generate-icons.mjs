#!/usr/bin/env node

/**
 * Generate PWA icons from SVG source using sharp
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, "..");
const STATIC_DIR = path.join(PROJECT_ROOT, "static");
const SOURCE_SVG = path.join(STATIC_DIR, "icon.svg");

// Icon sizes to generate
const ICON_SIZES = [
  { size: 192, name: "icon-192.png", purpose: "any maskable" },
  { size: 512, name: "icon-512.png", purpose: "any maskable" },
  { size: 180, name: "apple-touch-icon.png", purpose: "iOS" },
  { size: 96, name: "icon-96.png", purpose: "badge" },
  { size: 96, name: "icon-daily-96.png", purpose: "shortcut" },
  { size: 96, name: "icon-urgent-96.png", purpose: "shortcut" },
  { size: 96, name: "icon-people-96.png", purpose: "shortcut" },
  { size: 96, name: "icon-voice-96.png", purpose: "shortcut" },
  { size: 32, name: "favicon-32.png", purpose: "favicon" },
  { size: 16, name: "favicon-16.png", purpose: "favicon" },
];

async function generateIcons() {
  console.log("\n🎨 Generating PWA Icons\n");

  // Check source SVG exists
  try {
    await fs.access(SOURCE_SVG);
  } catch {
    throw new Error(`Source SVG not found: ${SOURCE_SVG}`);
  }

  // Read SVG content
  const svgBuffer = await fs.readFile(SOURCE_SVG);

  // Generate each icon size
  for (const icon of ICON_SIZES) {
    const outputPath = path.join(STATIC_DIR, icon.name);

    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);

      console.log(
        `✓ Generated ${icon.name} (${icon.size}x${icon.size}) - ${icon.purpose}`,
      );
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.name}:`, error.message);
    }
  }

  console.log("\n✅ Icon generation complete!\n");
}

// Run the script
generateIcons().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
