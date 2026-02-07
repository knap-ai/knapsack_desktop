---
name: FFmpeg
description: Convert, process, and manipulate audio and video files.
metadata: {"clawdbot":{"emoji":"🎬","homepage":"https://ffmpeg.org","requires":{"bins":["ffmpeg"]},"install":[{"id":"brew","kind":"brew","formula":"ffmpeg","bins":["ffmpeg","ffprobe"]}]}}
---

# FFmpeg

Use `ffmpeg` to convert, trim, merge, and process media files.

## When to activate

- User asks to convert video or audio formats
- User wants to extract audio, trim clips, or merge files
- User needs to resize, compress, or transcode media
- User asks to generate thumbnails or GIFs from video

## Common operations

| Task | Command |
|------|---------|
| Convert format | `ffmpeg -i input.mp4 output.mkv` |
| Extract audio | `ffmpeg -i video.mp4 -vn audio.mp3` |
| Trim clip | `ffmpeg -i in.mp4 -ss 00:01:00 -t 30 out.mp4` |
| Resize | `ffmpeg -i in.mp4 -vf scale=1280:720 out.mp4` |
| Make GIF | `ffmpeg -i in.mp4 -vf "fps=10,scale=320:-1" out.gif` |
| Get info | `ffprobe -v quiet -print_format json -show_format input.mp4` |
