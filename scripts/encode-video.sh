#!/usr/bin/env bash
# Encodes a master clip for the web: 1280px wide, H.264, no audio, fast start.
#   scripts/encode-video.sh media-source/video/my-clip.mp4
set -euo pipefail
in="$1"
name="$(basename "${in%.*}")"
mkdir -p public/media/video
ffmpeg -y -i "$in" -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 27 \
  -pix_fmt yuv420p -an -movflags +faststart "public/media/video/${name}.mp4"
