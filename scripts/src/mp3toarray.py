import os
import scipy.io.wavfile as wav
from pydub import AudioSegment
import os

result = {}

for file in os.listdir("../data/mp3s"):
    if file.endswith(".mp3"):
        fname = '../data/mp3s/' + file

        sound = AudioSegment.from_mp3(fname)
        sound.export("temp.wav", format="wav")

        data = wav.read("temp.wav")

        print file
        a = data[1][:,0].tolist() if data[1][1].size == 2 else data[1].tolist()
        result[file] = a[0::len(a)/1000]
        print len(result[file])

import json
with open('songs.json', 'w') as fp:
    json.dump(result, fp, indent=4)