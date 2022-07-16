#!/bin/bash
## Bash script to generate all icon resolutions needed.
## Tested on Debian using these packages:
# apt install imagemagick webp

## Place the PNG files to use as SOURCE in "System/Icons/*.png"
##
## Example usage:
# ./scripts/createIcons.sh ./public/System/Icons
# ./scripts/createIcons.sh ./publicMinimal/System/Icons
# ./scripts/createIcons.sh ./publicDefault/System/Icons
# ./scripts/createIcons.sh ./publicCustom/System/Icons

TARGET=$1
echo "TARGET: $TARGET"
convert_image () {
  res_short="$1"
  res="${res_short}x${res_short}"
  f="$2"
  mkdir -p "$TARGET/$res"
  f_no_ext="${f%.*}"
  ## Example on how to delete all TARGET files for a specific filename
  ## in order to force regenerating them.
  # if [[ "$f" == "sample.png" ]]; then
  #   rm -f "$TARGET/$res/$f"
  #   rm -f "$TARGET/$res/$f_no_ext.webp"
  # fi
  if [[ ! -f "$TARGET/$res/$f" ]]; then
    echo "Missing $res (png)"
    convert "$TARGET/max/$f" -background none -compress lossless -scale $res -strip -quality 100 "$TARGET/$res/$f"
  fi
  if [[ ! -f "$TARGET/$res/$f_no_ext.webp" ]]; then
    echo "Missing $res (webp)"
    cwebp -lossless -m 6 -z 9 -q 100 -alpha_q 100 -sharp_yuv -resize $res_short 0 -mt -alpha_filter best -v "$TARGET/max/$f" -o "$TARGET/$res/$f_no_ext.webp"
  fi
}

for file in $TARGET/max/*.png
do
    if [[ -f $file ]]; then
        f="$(basename $file)"
        echo "Converting file: $f"
        convert_image 144 "$f"
        convert_image 96 "$f"
        convert_image 48 "$f"
        convert_image 32 "$f"
        convert_image 16 "$f"
    fi
done
