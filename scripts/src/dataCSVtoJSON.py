import csv
import colorsys

custva_prvi_del = ['strah', 'energicnost', 'jeza', 'sproscenost', 'sreca', 'zalost', 'zivahnost', 'veselje', 'razocaranje', 'nezadovoljstvo']
custva_drugi_del = ['aktivno', 'budno', 'dremavo', 'neaktivno', 'nesrecno', 'nezadovoljno',
                    'razocarano', 'sprosceno', 'srecno', 'utrujeno', 'vedro', 'veselo', 'zadovoljno', 
                    'zaspano', 'zalostno', 'mirno', 'jezno']

pesem_custva_1 = ['jeza', 'razocaranje', 'sproscenost', 'sreca', 'veselje', 'zalost', 'mirnost', 'strah', 'napetost', 'pricakovanje']
pesem_custva_2 = ['veselje', 'sreca', 'zalost', 'otoznost', 'hrepenenje', 'zivahnost', 'presenecenje', 'pricakovanje', 'jeza', 'strah', 'sproscenost', 'mirnost', 'zasanjanost', 'navdihnjenost']

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
    with open(path, 'rb') as f:
        reader = csv.reader(f)
        values = list(reader)
    return values

def color_to_HSV(color_cir, color_ang):
    '''
    fuction change our color value to hsv

    parameters
    ----------
    color_cir:int - first color parameter
    color_ang:int - second color parameter

    returns
    ----------
    hsv:(h, s, v)
    '''
    h = color_ang * 33.0 / 360 if (color_cir != 0 and color_ang < 11) else 0
    s = color_cir * 0.25 if color_ang < 11 else 0
    v = 1 - color_cir * 0.25 if color_ang == 11 else 1
    return (h, s, v)

data = read_CSV_file('../data/original_data_relabeled.csv')
data_transformed = []
curr_idx = -1

for i in range(1, len(data)):
    if data[i][0] == curr_idx:
        continue
    curr_idx = data[i][0]
    row_dict = {}
    for j in range(0, len(data[i])):
        # for gender
        if data[0][j] == 'spol':
            row_dict[data[0][j]] = 'M' if data[i][j] == '1' else 'Z'
        elif data[0][j] == 'starost' or data[0][j] == 'glasbena_sola' or data[0][j] == 'igranje_instrumenta':
            row_dict[data[0][j]] = int(data[i][j])
        # medicine and drugs
        elif data[0][j] == 'droge' or data[0][j] == 'zdravila':
            row_dict[data[0][j]] = 'DA' if data[i][j] == '1' else 'NE'
        elif data[0][j] == 'kraj_bivanja':
            row_dict[data[0][j]] = 'v mestu' if data[i][j] == '1' else 'na podezelju'
        # zvrst
        elif data[0][j] == 'zvrst1' or data[0][j] == 'zvrst2' or data[0][j] == 'zvrst3':
            if 'zvrst' not in row_dict:
                row_dict['zvrst'] = []
            row_dict['zvrst'].append(data[i][j][1:])
        # current mood
        elif data[0][j] == 'razpolozenje_trenutnox' or data[0][j] == 'razpolozenje_trenutnoy':
            if 'razpolozenje_trenutno' not in row_dict:
                row_dict['razpolozenje_trenutno'] = {}
            if data[0][j] == 'razpolozenje_trenutnox': 
                row_dict['razpolozenje_trenutno']['x'] = float(data[i][j])
            if data[0][j] == 'razpolozenje_trenutnoy': 
                row_dict['razpolozenje_trenutno']['y'] = float(data[i][j])
        # color mood
        elif data[0][j] == 'razpolozenje_barva_cir':
            row_dict['razpolozenje_barva'] = colorsys.hsv_to_rgb(*color_to_HSV(int(data[i][j]), int(data[i][j+1])))
        elif data[0][j] == 'razpolozenje_barva_ang':
            continue
        # emotions position by user
        elif data[0][j].startswith('custvo-'):
            if float(data[i][j])  > 1:
                continue
            if 'custva' not in row_dict:
                row_dict['custva'] = []
            custvo_id = data[0][j][7:][:-1]
            custvo_name = custva_prvi_del[int(custvo_id) - 1]
            custvo_axis = data[0][j][-1:]
            custvo_value = - float(data[i][j]) if custvo_axis == 'y' else float(data[i][j]) # solving problems with wrong data
            if not any(d['ime'] == custvo_name for d in row_dict['custva']):
                row_dict['custva'].append({'id': custvo_id, 'ime': custvo_name, custvo_axis: custvo_value})
            else:
                idx = next(index for (index, d) in enumerate(row_dict['custva']) if d["ime"] == custvo_name)
                row_dict['custva'][idx][custvo_axis] = custvo_value
        # colors for emotions
        elif data[0][j].startswith('custvo_barva') and data[0][j].endswith('cir'):
            if 'custva' not in row_dict:
                row_dict['custva'] = []
            custvo_id = int(data[0][j][13:][:-3]) - 14
            custvo_name = custva_prvi_del[int(custvo_id)]
            color = colorsys.hsv_to_rgb(*color_to_HSV(int(data[i][j]), int(data[i][j+1])))
            if not any(d['ime'] == custvo_name for d in row_dict['custva']):
                row_dict['custva'].append({'id': custvo_id, 'ime': custvo_name, 'barva': color})
            else:
                idx = next(index for (index, d) in enumerate(row_dict['custva']) if d["ime"] == custvo_name)
                row_dict['custva'][idx]['barva'] = color
        elif data[0][j].startswith('custvo_barva') and data[0][j].endswith('ang'):
            continue
        elif data[0][j].startswith('custvo_trenutno'):
            if float(data[i][j])  > 1:
                continue
            if 'custva_trenutno' not in row_dict:
                row_dict['custva_trenutno'] = {}
            custvo_idx = int(data[0][j][-2:-1])
            if data[0][j][-4:-3] == 'a':
                custvo_idx += 6 
            if data[0][j][-4:-3] == 'b':
                custvo_idx += 12
            custvo_name = custva_drugi_del[custvo_idx - 1]
            row_dict['custva_trenutno'][custvo_name] = float(data[i][j])
        elif not (data[0][j].startswith('pesem') or data[0][j].startswith('song')):
            row_dict[data[0][j]] = data[i][j]
        # songs extraction
        # go throught all the rows in the questionarie
    for k in range(1, len(data)):
        if data[k][0] == curr_idx:
            song_dict = {}
            for l in range(65, len(data[k])):
                if data[0][l] == 'song':
                    song_dict['pesem_id'] = data[k][l]
                if data[0][l].startswith('pesem_custvo'):
                    if float(data[k][l]) > 1:
                        continue
                    custvo_idx = int(data[0][l][15])
                    custvo_axis = data[0][l][-1]
                    custvo_list = data[0][l][13]
                    custvo_name = pesem_custva_1[custvo_idx] if custvo_list == '0' else pesem_custva_2[custvo_idx]
                    custvo_sort = 'vzbujena_custva' if custvo_list == '0' else 'izrazena_custva'
                    if not custvo_sort in song_dict:
                        song_dict[custvo_sort] = []
                    if not any(d['ime'] == custvo_name for d in song_dict[custvo_sort]):
                        song_dict[custvo_sort].append({'id': custvo_idx, 'ime': custvo_name, custvo_axis: float(data[k][l])})
                    else:
                        idx = next(index for (index, d) in enumerate(song_dict[custvo_sort]) if d['ime'] == custvo_name)
                        song_dict[custvo_sort][idx][custvo_axis] = float(data[k][l])
                if data[0][l] == ('pesem_barva_ir'):
                    color = colorsys.hsv_to_rgb(*color_to_HSV(int(data[k][l]), int(data[k][l+1])))
                    song_dict['barva'] = color
            if 'pesmi' not in row_dict:
                row_dict['pesmi'] = []
            row_dict['pesmi'].append(song_dict)
    data_transformed.append(row_dict)

import json
with open('data.json', 'w') as fp:
    json.dump(data_transformed, fp, indent=4)


