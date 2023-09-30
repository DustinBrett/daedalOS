@echo off
setlocal enabledelayedexpansion

:: Create the necessary directories
for %%d in (144x144 96x96 48x48 32x32 16x16) do (
    if not exist "%%d" mkdir "%%d"
)

:: Copying all images to each folder
for %%i in (*.png) do (
    for %%d in (144x144 96x96 48x48 32x32 16x16) do (
        copy "%%i" "%%d"
    )
)

:: Convert images inside each folder to their corresponding sizes using ImageMagick
for %%d in (96x96 48x48 32x32 16x16) do (
    for %%i in ("%%d\*.png") do (
        magick "%%i" -resize %%d "%%i"
    )
)

:: Convert all .png images inside each folder to .webp using cwebp
for %%d in (144x144 96x96 48x48 32x32 16x16) do (
    for %%i in ("%%d\*.png") do (
        cwebp "%%i" -o "%%~dpni.webp"
    )
)

endlocal
