#!/bin/bash

# if magick is missing run:
# brew update && brew install imagemagick
# after finish put Icons content to /public/System/Icons/

mkdir "Icons"
mkdir "Icons/max"
mkdir "Icons/144x144"
mkdir "Icons/96x96"
mkdir "Icons/48x48"
mkdir "Icons/32x32"
mkdir "Icons/16x16"

for X in *.ico; do
    magick "$X[0]" -background none -compress lossless -scale 144x144 -strip -quality 100 "Icons/144x144/${X%.*}.png"
    magick "$X[0]" -background none -compress lossless -scale 96x96 -strip -quality 100 "Icons/96x96/${X%.*}.png"
    magick "$X[2]" -background none -compress lossless -strip -quality 100 "Icons/48x48/${X%.*}.png"
    magick "$X[4]" -background none -compress lossless -strip -quality 100 "Icons/32x32/${X%.*}.png"
    magick "$X[7]" -background none -compress lossless -strip -quality 100 "Icons/16x16/${X%.*}.png"

    magick "$X[0]" -background none -compress lossless -strip -quality 100 "Icons/max/${X%.*}.png"

    cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize 144 0 -mt -alpha_filter best -v "Icons/max/${X%.*}.png" -o "Icons/144x144/${X%.*}.webp"
    cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize 96 0 -mt -alpha_filter best -v "Icons/max/${X%.*}.png" -o "Icons/96x96/${X%.*}.webp"
    cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/48x48/${X%.*}.png" -o "Icons/48x48/${X%.*}.webp"
    cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/32x32/${X%.*}.png" -o "Icons/32x32/${X%.*}.webp"
    cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/16x16/${X%.*}.png" -o "Icons/16x16/${X%.*}.webp"
done

for X in */; do
    X="${X%/}"
    if [ ! -f "$X/144x144.png" ]; then
        magick "$X/max.png" -compress lossless -scale 144x144 -strip -quality 100 "Icons/144x144/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize 144 0 -mt -alpha_filter best -v "$X/max.png" -o "Icons/144x144/${X##*/}.webp"
    else
        cp "$X/144x144.png" "Icons/144x144/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/144x144/${X##*/}.png" -o "Icons/144x144/${X##*/}.webp"
    fi

    if [ ! -f "$X/96x96.png" ]; then
        magick "$X/max.png" -compress lossless -scale 96x96 -strip -quality 100 "Icons/96x96/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize 96 0 -mt -alpha_filter best -v "$X/max.png" -o "Icons/96x96/${X##*/}.webp"
    else
        cp "$X/96x96.png" "Icons/96x96/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/96x96/${X##*/}.png" -o "Icons/96x96/${X##*/}.webp"
    fi

    if [ ! -f "$X/48x48.png" ]; then
        magick "$X/max.png" -compress lossless -scale 48x48 -strip -quality 100 "Icons/48x48/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize 48 48 -mt -alpha_filter best -v "$X/max.png" -o "Icons/48x48/${X##*/}.webp"
    else
        cp "$X/48x48.png" "Icons/48x48/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/48x48/${X##*/}.png" -o "Icons/48x48/${X##*/}.webp"
    fi

    if [ ! -f "$X/32x32.png" ]; then
        magick "$X/max.png" -compress lossless -scale 32x32 -strip -quality 100 "Icons/32x32/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize 32 32 -mt -alpha_filter best -v "$X/max.png" -o "Icons/32x32/${X##*/}.webp"
    else
        cp "$X/32x32.png" "Icons/32x32/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/32x32/${X##*/}.png" -o "Icons/32x32/${X##*/}.webp"
    fi

    if [ ! -f "$X/16x16.png" ]; then
        magick "$X/max.png" -compress lossless -scale 16x16 -strip -quality 100 "Icons/16x16/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize 16 16 -mt -alpha_filter best -v "$X/max.png" -o "Icons/16x16/${X##*/}.webp"
    else
        cp "$X/16x16.png" "Icons/16x16/${X##*/}.png"
        cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -mt -alpha_filter best -v "Icons/16x16/${X##*/}.png" -o "Icons/16x16/${X##*/}.webp"
    fi
done

rm -r "Icons/max"
