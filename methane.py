import argparse
import time
import math

from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from moviepy.editor import *

START_OFFSET = 60 * 2 # skip first two min
CLIP_LENGTH = 50 # 50 sec clips

FINAL_HEIGHT = 1920
FINAL_WIDTH = 1080

FINAL_RENDER_PRESET = 'veryfast'

n = 0

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('-t', '--target', help='Target video file')
parser.add_argument('-b', '--b-roll', help='B-Roll video clip')

target = parser.parse_args()
opts = parser.parse_args()

if opts.target is None or opts.b_roll is None:
      parser.print_help()
      exit(1)

vid_len_secs = math.floor(VideoFileClip(opts.target).duration)
timestamps = [x + START_OFFSET for x in range(START_OFFSET, vid_len_secs - START_OFFSET, CLIP_LENGTH)]
chunked = [timestamps[i * 2:(i + 1) * 2] for i in range((len(timestamps) + 1) // 2 )]

for [start_time, end_time] in chunked:
  n += 1

  top_clip = VideoFileClip(opts.target).subclip(start_time, end_time).resize(height = FINAL_HEIGHT / 2, width=FINAL_WIDTH / 2)
  bottom_clip = VideoFileClip(opts.b_roll).resize(height=FINAL_HEIGHT / 2, width=FINAL_WIDTH / 2)

  stacked = clips_array([[top_clip], [bottom_clip]])
  final = stacked.write_videofile(f'stacked-{str(n)}.mkv', codec='libx264', preset='ultrafast')