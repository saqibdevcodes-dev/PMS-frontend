"""Generate app icons from the code-native Estate mark. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
root=Path(__file__).resolve().parents[1]
canvas=Image.new('RGB',(1024,1024),'#3563e9')
draw=ImageDraw.Draw(canvas)
points=[(256,752),(256,352),(512,208),(768,352),(768,752),(592,752),(592,528),(432,528),(432,752),(256,752)]
draw.line(points,fill='white',width=56,joint='curve')
draw.line([(432,384),(592,384)],fill='white',width=48)
canvas.resize((256,256),Image.Resampling.LANCZOS).save(root/'public/icon.png')
canvas.save(root/'public/icon.ico',sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
ios=root/'ios/App/App/Assets.xcassets/AppIcon.appiconset'
if ios.exists():
 canvas.save(ios/'AppIcon-512@2x.png')
for density,size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
 folder=root/f'android/app/src/main/res/mipmap-{density}'
 if folder.exists():
  for name in ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png']:
   canvas.resize((size,size),Image.Resampling.LANCZOS).save(folder/name)
