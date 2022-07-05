MKDIR "..\max"

MKDIR "..\144x144"
MKDIR "..\96x96"
MKDIR "..\48x48"
MKDIR "..\32x32"
MKDIR "..\16x16"

FOR %%X in (*.ico) DO (
    C:\ImageMagick\magick.exe "%%X[0]" -background none -compress lossless -resize 144x144 -strip -quality 100 "..\144x144\%%~nX.png"
    C:\ImageMagick\magick.exe "%%X[0]" -background none -compress lossless -resize 96x96 -strip -quality 100 "..\96x96\%%~nX.png"
    C:\ImageMagick\magick.exe "%%X[2]" -background none -compress lossless -strip -quality 100 "..\48x48\%%~nX.png"
    C:\ImageMagick\magick.exe "%%X[4]" -background none -compress lossless -strip -quality 100 "..\32x32\%%~nX.png"
    C:\ImageMagick\magick.exe "%%X[7]" -background none -compress lossless -strip -quality 100 "..\16x16\%%~nX.png"

    C:\ImageMagick\magick.exe "%%X[0]" -background none -compress lossless -strip -quality 100 "..\max\%%~nX.png"

    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -resize 144 144 -mt -lossless -v "..\max\%%~nX.png" -o "..\144x144\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -resize 96 96 -mt -lossless -v "..\max\%%~nX.png" -o "..\96x96\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -mt -lossless -v "..\48x48\%%~nX.png" -o "..\48x48\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -mt -lossless -v "..\32x32\%%~nX.png" -o "..\32x32\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -mt -lossless -v "..\16x16\%%~nX.png" -o "..\16x16\%%~nX.webp"
)

FOR /D %%X in (*) DO (
    IF NOT EXIST "%%X\144x144.png" (
        C:\ImageMagick\magick.exe "%%X\max.png" -compress lossless -resize 48x48 -strip -quality 100 "..\144x144\%%~nX.png"
    ) ELSE (
        COPY "%%X\144x144.png" "..\144x144\%%~nX.png"
    )

    IF NOT EXIST "%%X\96x96.png" (
        C:\ImageMagick\magick.exe "%%X\max.png" -compress lossless -resize 48x48 -strip -quality 100 "..\96x96\%%~nX.png"
    ) ELSE (
        COPY "%%X\96x96.png" "..\96x96\%%~nX.png"
    )

    IF NOT EXIST "%%X\48x48.png" (
        C:\ImageMagick\magick.exe "%%X\max.png" -compress lossless -resize 48x48 -strip -quality 100 "..\48x48\%%~nX.png"
    ) ELSE (
        COPY "%%X\48x48.png" "..\48x48\%%~nX.png"
    )

    IF NOT EXIST "%%X\32x32.png" (
        C:\ImageMagick\magick.exe "%%X\max.png" -compress lossless -resize 32x32 -strip -quality 100 "..\32x32\%%~nX.png"
    ) ELSE (
        COPY "%%X\32x32.png" "..\32x32\%%~nX.png"
    )

    IF NOT EXIST "%%X\16x16.png" (
        C:\ImageMagick\magick.exe "%%X\max.png" -compress lossless -resize 16x16 -strip -quality 100 "..\16x16\%%~nX.png"
    ) ELSE (
        COPY "%%X\16x16.png" "..\16x16\%%~nX.png"
    )

    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -resize 144 144 -mt -lossless -v "%%X\144x144.png" -o "..\144x144\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -resize 96 96 -mt -lossless -v "%%X\96x96.png" -o "..\96x96\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -mt -lossless -v "..\48x48\%%~nX.png" -o "..\48x48\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -mt -lossless -v "..\32x32\%%~nX.png" -o "..\32x32\%%~nX.webp"
    cwebp -q 100 -z 9 -m 6 -sharp_yuv -pass 10 -mt -lossless -v "..\16x16\%%~nX.png" -o "..\16x16\%%~nX.webp"
)

RMDIR /S /Q "..\max"
