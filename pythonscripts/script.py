from imageai.Detection import ObjectDetection
import numpy as np
import os, sys
import cv2
from contextlib import contextmanager
from pixelmaker import PixelMapper
import config as cfg
import math
print("test print")
def dot(v,w):
    x,y = v
    X,Y = w
    return x*X + y*Y

def length(v):
    x,y = v
    return math.sqrt(x*x + y*y)

def vector(b,e):
    x,y = b
    X,Y = e
    return (X-x, Y-y)

def unit(v):
    x,y = v
    mag = length(v)
    return (x/mag, y/mag)

def distance(p0,p1):
    return length(vector(p0,p1))

def scale(v,sc):
    x,y = v
    return (x * sc, y * sc)

def add(v,w):
    x,y = v
    X,Y = w
    return (x+X, y+Y)

def pnt2line(pnt, start, end):
    line_vec = vector(start, end)
    pnt_vec = vector(start, pnt)
    line_len = length(line_vec)
    line_unitvec = unit(line_vec)
    pnt_vec_scaled = scale(pnt_vec, 1.0/line_len)
    t = dot(line_unitvec, pnt_vec_scaled)
    if t < 0.0:
        t = 0.0
    elif t > 1.0:
        t = 1.0
    nearest = scale(line_vec, t)
    dist = distance(nearest, pnt_vec)
    return (dist)

def pixelToCoor(dic):
    pm = PixelMapper(quad_coords["pixel"], quad_coords["lonlat"])
    coordic = {}
    for k,v in dic.items():
        coords = []
        for pix in v:
            coords.append(pm.pixel_to_lonlat(pix).tolist()[0])
        coordic[k] = coords
    return coordic

def objselect(dic, crd1, crd2):
    dicto = dic.copy()
    for key in dicto.keys():
        for i, coord in enumerate(dicto[key]):
            if pnt2line(coord, crd1, crd2)* 90000 > 4.0:
                print(coord)
                dicto[key].pop(i)
    return dicto


execution_path = os.getcwd()
detector = ObjectDetection()
detector.setModelTypeAsRetinaNet()
detector.setModelPath( os.path.join(execution_path ,"pythonscripts" ,"resnet50_coco_best_v2.0.1.h5"))
detector.loadModel()
detections = detector.detectObjectsFromImage(input_image=os.path.join(execution_path ,"volume", cfg.PIC_URL_UPPER), output_image_path=os.path.join(execution_path, "volume","classified-road.jpg"))



objectList = {'car':[], 'truck':[]}
objectTypes = ['car', 'truck']
for eachObject in detections:
    name = eachObject['name']
    if name in objectTypes:
        objectList[name].append([int((eachObject['box_points'][2:][0] + eachObject['box_points'][:2][0])/2), int((eachObject['box_points'][2:][1] + eachObject['box_points'][:2][1])/2)])

quad_coords = cfg.QUAD_COORDS_UPPER
pm = PixelMapper(quad_coords["pixel"], quad_coords["lonlat"])

convcoords = pixelToCoor(objectList)

new_coords = objselect(convcoords, cfg.BAY_ZONE_UPPER[0], cfg.BAY_ZONE_UPPER[1])

print("{\"",objectTypes[0], "\":", len(new_coords[objectTypes[0]]), ",\"", objectTypes[1],"\":", len(new_coords[objectTypes[1]]), "}")
