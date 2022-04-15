import cv2 as cv
import numpy as np
import sys
import os

avatars = ["axolotl", "cat", "gary_alien", "gary_snowman",
           "jellyfish", "snake", "blob", "gary_egg", "gary_wine",
           "ninja"]
iconpath = "../images/shapes/"
smallsizes = [40, 60, 58, 87, 80]
sizes = [120, 180, 1024]

def generate(path, name):
    im = cv.imread(path, cv.IMREAD_UNCHANGED)
    old_size = im.shape[:2] # old_size is in (height, width) format
    im[np.where((im==[255,255,255,0]).all(axis=2))] = [0, 0, 0, 255]

    ratio = 1.15
    new_size = tuple([int(x*ratio) for x in old_size])

# new_size should be in (width, height) format

    im = cv.resize(im, (new_size[1], new_size[0]))

    delta_w = 200
    delta_h = 200
    top, bottom = delta_h//2, delta_h-(delta_h//2)
    left, right = delta_w//2, delta_w-(delta_w//2)

    img = cv.copyMakeBorder(im, top, bottom, left, right, cv.BORDER_CONSTANT,
    value=[0, 0, 0, 255])

    for size in sizes:
        save = cv.resize(img, (size, size), cv.INTER_MAX)
        cv.imwrite(name + "@" + str(int(size/60)) + "x.png", save)

    for size in smallsizes:
        save = cv.resize(img, (size, size), cv.INTER_MAX)
        cv.imwrite(name + str(size) + ".png", save)

for avatar in avatars:
    path = iconpath + avatar + "/" + avatar + "1.png"
    generate(path, avatar)

for path in sys.argv[1:]:
    generate(path, "default")
