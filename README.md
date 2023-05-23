# Riivolution ISO Patcher

### An ISO patcher for Riivolution mods.

## How to use

### Pre-requisites

The following softwares needs to be installed prior to running the software: 

* [Wiimm's ISO Tools (WIT)](https://wit.wiimm.de)
* [Node.js & NPM](https://nodejs.org/)

### Patching your game

Open up a new terminal session, ```cd``` to this folder, move your ```.wbfs``` game file to the folder named ```GAME_IMAGE_FILE```, then move the SD card files for the mod to ```SD_FILES```, and run ```npm i && npm run patch``` to start the process.

The program will ask you to choose between different versions of the mod, which patches to apply, and some other confirmations.

## Common Errors

### Error 001 (Dolphin)

Error 001 can be fixed within the emulator itself by going to ```Config > Advanced``` and checking on ```Enable Emulated Memory Size Override```, followed by increasing ```MEM2``` to ```128MB``` ([Source](https://wiibrew.org/wiki/Error_001)).