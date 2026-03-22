#!/bin/bash
MC_JAR="$HOME/Library/Application Support/minecraft/versions/1.21.4/1.21.4.jar"
if [ ! -f "$MC_JAR" ]; then
  echo "❌ Minecraft 1.21.4 not found at: $MC_JAR"
  echo "Please install Minecraft 1.21.4 via the Minecraft Launcher first."
  exit 1
fi
echo "🐾 Extracting block textures from Minecraft 1.21.4..."
mkdir -p public/textures/blocks
unzip -o "$MC_JAR" "assets/minecraft/textures/block/*" -d /tmp/mc-extract
cp /tmp/mc-extract/assets/minecraft/textures/block/*.png public/textures/blocks/
echo "✅ Extracted $(ls public/textures/blocks/ | wc -l | tr -d ' ') textures to public/textures/blocks/"
