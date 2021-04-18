# April 17th, 2021 @ 9 PM PST

## Stream Link: https://youtu.be/Hu1RYVoCbgs

## Introduction

- Episode 15 Recap (https://github.com/DustinBrett/x/commits/redo)

## Maintenance, Housekeeping & Refactoring

- NPM Updates
- Use .eslintignore instead of adding to config
- Specify async & size for v86
- Check for fs, url and container before loading v86
- Clean up buffer urls (v86/images)
- Refactor auto window resizing into a hook
- Get rid of BORDER_OFFSET for v86 until I understand it
- Use setOptions instead of assigning vanta color
- Sub-folders for File Entry & File Manager
- Un-minimze window on re-clicking file entry
- Fallback to image icon when it doesn't load
- Only file drop if there is a file
- Session JSON parse should have default empty object
- Flex center file entry contents and add padding
- Pixelate resized icons
- Adjust padding/margin for taskbar entry
- Foreground status updated in taskbar entry
- Don't change foreground when clicking taskbar entry
- Add default empty object for windowStates
- Check that initial context states are updated/alphabetized
- Don't show common image element until it's loaded
- Increase theme text color alpha to 90%
- Change default vanta color to 0x192b34
- Split up process types to use keyof
- Add Html lang back into `_document`
  - https://nextjs.org/docs/advanced-features/custom-document
- Update v86 libs & kolibri image
- Make sure all imports are organized and build works

## Apps

- JS-DOS
  - https://js-dos.com/v7/build/
- File Explorer

## Next Stream

- Fix the bug where it crashes when you close a window
- Code Mirror v6
- File renaming
- ?
