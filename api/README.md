# VersoView API - Requirements

## Production Requirements:
- poppler-utils (Pdf SSE Upload - create edition)

## Local Development Requirements:

### For PDF Processing (Required for Edition Creation):

The PDF processing service requires one of the following:

#### Option 1: Poppler (Recommended - Best Quality)
Install Poppler utilities which provide the `pdftocairo` command:

**Windows:**
1. Download Poppler for Windows from: https://github.com/oschwartz10612/poppler-windows/releases/
2. Extract and add the `bin` folder to your system PATH
3. Or use Chocolatey: `choco install poppler`

**macOS:**
```bash
brew install poppler
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install poppler-utils
```

**Linux (CentOS/RHEL):**
```bash
sudo yum install poppler-utils
```

#### Option 2: Canvas Native Dependencies (Fallback)
If Poppler is not available, the system will use pdfjs-dist + canvas. Canvas requires native dependencies:

**Windows:**
1. Install Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++" workload
2. Install Python 2.7 or 3.x
3. Run: `npm install canvas` (may take several minutes to compile)

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install canvas
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas
```

### Verify Installation:

After installing dependencies, restart your server. The system will log detected capabilities:
```
PDF Processing Capabilities: { poppler: true, pdfjs: true, canvas: true }
```

If you see `poppler: false` and `canvas: false`, you'll get placeholder images. Check the console logs for the conversion strategy being used.

### Troubleshooting:

- **White placeholder images**: Install Poppler or Canvas dependencies (see above)
- **Canvas installation fails**: Ensure build tools are installed (Visual Studio on Windows, Xcode Command Line Tools on macOS)
- **Poppler not found**: Verify `pdftocairo` is in your PATH by running `pdftocairo -v` in terminal