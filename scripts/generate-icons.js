#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const publicDir = path.join(__dirname, '../public');

console.log('📱 PWA Icon Generation Instructions');
console.log('=====================================\n');

console.log('To generate proper PWA icons, you have two options:\n');

console.log('Option 1: Use an online tool (Recommended)');
console.log('1. Visit: https://realfavicongenerator.net/');
console.log('2. Upload your favicon.svg file');
console.log('3. Download the generated icons');
console.log('4. Place these files in the /public directory:');
console.log('   - icon-192.png (192x192)');
console.log('   - icon-512.png (512x512)');
console.log('   - icon-192-maskable.png (192x192 with padding)');
console.log('   - icon-512-maskable.png (512x512 with padding)\n');

console.log('Option 2: Use ImageMagick (if installed)');
console.log('Run these commands from the project root:\n');

const commands = [
  'convert public/favicon.svg -resize 192x192 public/icon-192.png',
  'convert public/favicon.svg -resize 512x512 public/icon-512.png',
  'convert public/favicon.svg -resize 192x192 -background "#FFC107" -gravity center -extent 192x192 public/icon-192-maskable.png',
  'convert public/favicon.svg -resize 512x512 -background "#FFC107" -gravity center -extent 512x512 public/icon-512-maskable.png'
];

commands.forEach(cmd => console.log(`  ${cmd}`));

console.log('\n✅ After generating icons, rebuild your app with: npm run build\n');

const iconSizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192-maskable.png', size: 192 },
  { name: 'icon-512-maskable.png', size: 512 }
];

let missingIcons = [];
iconSizes.forEach(icon => {
  const iconPath = path.join(publicDir, icon.name);
  if (!fs.existsSync(iconPath)) {
    missingIcons.push(icon.name);
  }
});

if (missingIcons.length > 0) {
  console.log('⚠️  Missing icons:', missingIcons.join(', '));
  console.log('The app will work but won\'t be installable until icons are generated.\n');
} else {
  console.log('✅ All PWA icons are present!\n');
}
