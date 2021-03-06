import os
import scipy.io.wavfile as wav
from pydub import AudioSegment
import os
import csv

result = {}

def read_CSV_file(path):
    '''
    function reads CSV file on path
    and return the list with values from CSV

    parameters
    ----------
    path:string - path to CSV file

    returns
    ----------
    list - list with csv values
    '''
    with open(path, 'r') as f:
        reader = csv.reader(f)
        values = list(reader)
    return values

if __name__ == "__main__":

    numsamples = 1000

    for file in os.listdir("../data/mp3s"):
        if file.endswith(".mp3"):
            fname = '../data/mp3s/' + file

            sound = AudioSegment.from_mp3(fname)
            sound.export("temp.wav", format="wav")

            data = wav.read("temp.wav")

            print(file)
            a = data[1][:,0].tolist() if data[1][1].size == 2 else data[1].tolist()
            result[file] = {}
            step = int(len(a) / numsamples)
            result[file]['sinusoide'] = [[min(a[i * step : (i+1) * step]), max(a[i * step : (i+1) * step])]
                for i in range(0, numsamples)]

    song_data = read_CSV_file('../data/template_pesmi_muzikologi.csv')
    for i in range(2, len(song_data)):
        for j in range(1, len(song_data[i])):
            value = song_data[i][j]
            key = song_data[0][j]
            result[song_data[i][0]][key] = int(value) if j in [2, 3, 4, 5] else value 

    for key in result:
        k = int(key[:-4])
        print(k)
        if int(k) < 400: # 100 - 400 film
            result[key]["song_name"] = "movie" + str("%03d" %(int(k) - 100))
        elif int(k) < 500: # etno 400 - 500
            result[key]["song_name"] = "etno" + str("%03d" %(int(k) - 400))
        elif int(k) < 600: # 500 - 600 jamendo
            result[key]["song_name"] = "popular" + str("%03d" %(int(k) - 500))
        else: # 600 - 700 icmc
            result[key]["song_name"] = "electroacoustic" + str("%03d" %(int(k) - 600))

    import json
    with open('songs.json', 'w') as fp:
        json.dump(result, fp)