#!/usr/bin/env node

/**
 * Generate PWA icons from SVG source
 * Requires: npm install -g sharp-cli
 * Or use ImageMagick: brew install imagemagick
 */

import { promises as fs } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

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

async function checkDependencies() {
  // Check for ImageMagick
  try {
    await execAsync("which convert");
    console.log("✓ ImageMagick found");
    return "imagemagick";
  } catch {
    console.log("✗ ImageMagick not found");
  }

  // Check for sharp-cli
  try {
    await execAsync("which sharp");
    console.log("✓ sharp-cli found");
    return "sharp";
  } catch {
    console.log("✗ sharp-cli not found");
  }

  throw new Error(
    "No image conversion tool found. Please install one:\n" +
      "  - ImageMagick: brew install imagemagick\n" +
      "  - sharp-cli: npm install -g sharp-cli",
  );
}

async function generateWithImageMagick(svgPath, outputPath, size) {
  const command = `convert -background none -resize ${size}x${size} "${svgPath}" "${outputPath}"`;
  await execAsync(command);
}

async function generateWithSharp(svgPath, outputPath, size) {
  const command = `sharp -i "${svgPath}" -o "${outputPath}" resize ${size} ${size}`;
  await execAsync(command);
}

async function generateIcons() {
  console.log("\n🎨 Generating PWA Icons\n");

  // Check source SVG exists
  try {
    await fs.access(SOURCE_SVG);
  } catch {
    throw new Error(`Source SVG not found: ${SOURCE_SVG}`);
  }

  // Check dependencies
  const tool = await checkDependencies();

  // Generate each icon size
  for (const icon of ICON_SIZES) {
    const outputPath = path.join(STATIC_DIR, icon.name);

    try {
      if (tool === "imagemagick") {
        await generateWithImageMagick(SOURCE_SVG, outputPath, icon.size);
      } else if (tool === "sharp") {
        await generateWithSharp(SOURCE_SVG, outputPath, icon.size);
      }

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
