# Riivolution ISO Patcher

### An ISO patcher for Riivolution mods.

## How to use

### Downloading the software

To download this software, go to the [releases](https://github.com/JiningLiu/RiivolutionISOPatcher/releases) page and download the latest version.

If you want a pure terminal experience, just do ```git clone``` on the repo and ```cd``` into it.

### Pre-requisites

The following softwares needs to be installed prior to running the software: 

* [Wiimm's ISO Tools (WIT)](https://wit.wiimm.de)
* [Node.js & NPM](https://nodejs.org/)

### Patching your game

Open up a new terminal session, ```cd``` into the folder containing the patcher, move your ```.wbfs``` game file to the folder named ```GAME_IMAGE_FILE```, then move the SD card files for the mod to ```SD_FILES```, and run ```npm i && npm run patch``` to start the process.

The program will ask you to choose between different versions of the mod, which patches to apply, and some other confirmations.

## Common Errors

### **Error 001**

Error 001 happens when the Wii console is detecting a DVD-R disc instead of a Wii disc ([Source](https://wiibrew.org/wiki/Error_001)). This can happen on both the Wii console and Dolphin emulator.

### Wii Console

Error 001 can be fixed by patching the ```main.dol``` file of the game with [Generic Wii Patcher (GWP)](https://gbatemp.net/download/generic-wii-patcher.37573/). Watch [this video](https://youtu.be/tdFOb2YSPBE) for instructions on how to fix this error.

Mac user? Use the free VM app [UTM](https://mac.getutm.app) to create a Windows virtural machine and run GWP from there.

### Dolphin

Error 001 can be fixed within the emulator itself by going to ```Config > Advanced``` and checking on ```Enable Emulated Memory Size Override```, followed by increasing ```MEM2``` to ```128MB```.