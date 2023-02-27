import argparse
import subprocess
import time
import math

from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
# from moviepy.video.fx import volumex, resize, mirrorx
from moviepy.editor import *

START_OFFSET = 60 * 2 # skip first two min
CLIP_LENGTH = 20 # 20 sec clips

FINAL_HEIGHT = 1920
FINAL_WIDTH = 1080

FINAL_RENDER_PRESET = 'veryfast'

n = 0

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('-t', '--target', help='Target video file')
parser.add_argument('-b', '--b-roll', help='B-Roll video clip')
parser.add_argument('-c', '--threads', help='Specify threads to use')

opts = parser.parse_args()

if opts.target is None:
      parser.print_help()
      exit(1)

print("Loading clips...")

source = VideoFileClip(opts.target)
# bottom_clip = VideoFileClip(opts.b_roll).resize(height=FINAL_HEIGHT / 2, width=FINAL_WIDTH / 2)

print("Calculating chunks...")

vid_len_secs = math.floor(source.duration)
timestamps = [x + START_OFFSET for x in range(START_OFFSET, vid_len_secs - START_OFFSET, CLIP_LENGTH)]
chunked = [timestamps[i * 2:(i + 1) * 2] for i in range((len(timestamps) + 1) // 2 )]

print("Slicing source...")

for chunk in chunked:
    if len(chunk) != 2: continue

    [ start_time, end_time ] = chunk
    ffmpeg_extract_subclip(opts.target, start_time, end_time, targetname = f'clip-{n}.mp4')
    n = n + 1

print(f"Sliced {n} subclips")

print("Rendering...")
for i in range(n):
     subprocess.run(['ffmpeg', '-i', f'clip-{i}.mp4', '-i', 'stock/gta5-driving.mp4', '-ss', '0', '-to', '00:00:20', '-filter_complex', '[0:v]pad=iw:ih*2[int]; [int]hflip[int_flipped]; [int_flipped][1:v]overlay=y=H/2.0[vid]', '-map', "['vid']", '-map', '0:a', '-c:v', 'libx264', '-c:a', 'copy', '-crf', '23', '-threads', '8', f'stacked-{i}.mp4'])
     print(f"Finished stacked-{i}.mp4")


# print("Rendering...")

# for clip in clips:
#   n += 1
#   top_clip = clip.resize(height = FINAL_HEIGHT / 2, width=FINAL_WIDTH / 2).fx(vfx.mirror_x)

#   stacked = clips_array([[top_clip], [bottom_clip]])
#   final = stacked.write_videofile(f'stacked-{str(n)}.mp4', threads = 8, fps = 24)