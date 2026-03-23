#!/bin/bash
set -e

TEXTURES_DIR="public/textures/blocks"
VERSION="1.21.4"
MANIFEST_URL="https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
TMP_DIR="/tmp/mc-textures-$$"

# Skip if textures already exist
if [ -d "$TEXTURES_DIR" ] && [ "$(ls -A $TEXTURES_DIR 2>/dev/null | wc -l)" -gt "100" ]; then
  echo "✅ Textures already present ($(ls $TEXTURES_DIR | wc -l | tr -d ' ') files) — skipping download"
  exit 0
fi

echo "🐾 Downloading Minecraft $VERSION textures from Mojang CDN..."
mkdir -p "$TEXTURES_DIR"
mkdir -p "$TMP_DIR"

# Step 1: Get version manifest
echo "📋 Fetching version manifest..."
MANIFEST=$(curl -s "$MANIFEST_URL")

# Step 2: Find 1.21.4 version URL
VERSION_URL=$(echo "$MANIFEST" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for v in data['versions']:
    if v['id'] == '$VERSION':
        print(v['url'])
        break
")

if [ -z "$VERSION_URL" ]; then
  echo "❌ Could not find version $VERSION in manifest"
  exit 1
fi

echo "📦 Fetching version metadata..."
VERSION_META=$(curl -s "$VERSION_URL")

# Step 3: Get client jar URL
CLIENT_URL=$(echo "$VERSION_META" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data['downloads']['client']['url'])
")

if [ -z "$CLIENT_URL" ]; then
  echo "❌ Could not find client jar URL"
  exit 1
fi

echo "⬇️  Downloading client jar (this may take a moment)..."
curl -s -L "$CLIENT_URL" -o "$TMP_DIR/client.jar"

echo "📂 Extracting block textures..."
cd "$TMP_DIR"
unzip -q client.jar "assets/minecraft/textures/block/*" -d extracted/

# Copy only PNG files
cp extracted/assets/minecraft/textures/block/*.png "$OLDPWD/$TEXTURES_DIR/" 2>/dev/null || true

# Cleanup
cd "$OLDPWD"
rm -rf "$TMP_DIR"

COUNT=$(ls "$TEXTURES_DIR" | wc -l | tr -d ' ')
echo "✅ Extracted $COUNT textures to $TEXTURES_DIR"