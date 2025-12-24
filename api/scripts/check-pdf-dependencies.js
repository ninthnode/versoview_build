#!/usr/bin/env node

/**
 * Check PDF Processing Dependencies
 * Run this script to verify if all required dependencies are available
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking PDF Processing Dependencies...\n');

const checks = {
  poppler: false,
  pdfjs: false,
  canvas: false
};

// Check Poppler
console.log('1. Checking Poppler (pdftocairo)...');
const popplerCheck = spawn('pdftocairo', ['-v']);
popplerCheck.on('close', (code) => {
  checks.poppler = (code === 0 || code === 99);
  if (checks.poppler) {
    console.log('   ✅ Poppler is installed\n');
  } else {
    console.log('   ❌ Poppler is NOT installed\n');
    console.log('   📥 Install:');
    console.log('      Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases/');
    console.log('      macOS: brew install poppler');
    console.log('      Linux: sudo apt-get install poppler-utils\n');
  }
  checkPdfjs();
});

popplerCheck.on('error', () => {
  checks.poppler = false;
  console.log('   ❌ Poppler is NOT installed (command not found)\n');
  console.log('   📥 Install:');
  console.log('      Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases/');
  console.log('      macOS: brew install poppler');
  console.log('      Linux: sudo apt-get install poppler-utils\n');
  checkPdfjs();
});

// Check pdfjs-dist
function checkPdfjs() {
  console.log('2. Checking pdfjs-dist...');
  try {
    require('pdfjs-dist');
    checks.pdfjs = true;
    console.log('   ✅ pdfjs-dist is installed\n');
  } catch (e) {
    checks.pdfjs = false;
    console.log('   ❌ pdfjs-dist is NOT installed\n');
    console.log('   📥 Install: npm install pdfjs-dist\n');
  }
  checkCanvas();
}

// Check Canvas
function checkCanvas() {
  console.log('3. Checking Canvas...');
  try {
    require('canvas');
    checks.canvas = true;
    console.log('   ✅ Canvas is installed\n');
  } catch (e) {
    checks.canvas = false;
    console.log('   ❌ Canvas is NOT installed or native dependencies missing\n');
    console.log('   📥 Install:');
    console.log('      Windows: Install Visual Studio Build Tools, then: npm install canvas');
    console.log('      macOS: brew install pkg-config cairo pango libpng jpeg giflib librsvg && npm install canvas');
    console.log('      Linux: sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && npm install canvas\n');
  }
  printSummary();
}

// Print summary
function printSummary() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const hasPoppler = checks.poppler;
  const hasPdfjsCanvas = checks.pdfjs && checks.canvas;
  const hasAnyMethod = hasPoppler || hasPdfjsCanvas;
  
  if (hasPoppler) {
    console.log('✅ PDF Processing: READY (using Poppler - best quality)');
  } else if (hasPdfjsCanvas) {
    console.log('✅ PDF Processing: READY (using pdfjs+canvas - fallback method)');
  } else {
    console.log('❌ PDF Processing: NOT READY');
    console.log('   ⚠️  You will see placeholder images instead of actual PDF pages');
    console.log('   📖 See README.md for installation instructions\n');
  }
  
  console.log('\n📋 Capabilities:');
  console.log(`   Poppler: ${checks.poppler ? '✅' : '❌'}`);
  console.log(`   pdfjs-dist: ${checks.pdfjs ? '✅' : '❌'}`);
  console.log(`   Canvas: ${checks.canvas ? '✅' : '❌'}`);
  console.log('\n');
}

