---
name: ImageMagick
description: Convert, resize, and manipulate images from the command line.
metadata: {"clawdbot":{"emoji":"🖼️","homepage":"https://imagemagick.org","requires":{"anyBins":["magick","convert"]},"install":[{"id":"brew","kind":"brew","formula":"imagemagick","bins":["magick","convert"]}]}}
---

# ImageMagick

Use ImageMagick to process, convert, and transform images.

## When to activate

- User asks to resize, crop, or convert images
- User wants to add watermarks, borders, or text to images
- User needs to batch-process image files
- User asks to create montages or composite images

## Common operations

| Task | Command |
|------|---------|
| Convert format | `magick input.png output.jpg` |
| Resize | `magick input.png -resize 800x600 output.png` |
| Crop | `magick input.png -crop 200x200+50+50 output.png` |
| Add text | `magick input.png -annotate +10+30 "Hello" output.png` |
| Create montage | `magick montage *.jpg -geometry +2+2 montage.png` |
| Get info | `magick identify -verbose image.png` |
