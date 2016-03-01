#!/bin/bash

APPNAME=bitacorapp
PLATFORM=win32
ARCH=x64
ELVERSION=0.34.0

echo "Compiling $APPNAME for platform $PLATFORM $ARCH using Electron $ELVERSION"
echo "Removing previous build"
rm -Rf bitacorapp-win32-x64/
echo "Compiling..."
electron-packager ./ bitacorapp --platform=$PLATFORM --arch=$ARCH --version=$ELVERSION --icon bitmap.ico --overwrite
echo "Entering new directory"

if [ -d bitacorapp-win32-x64 ]; then
    cd bitacorapp-win32-x64
    echo "Moving required programs..."
    mv resources/app/bin ./bin
    mv resources/app/bndb.bat .
    mv resources/app/kill.bat .
    cd bin
    echo "Removing previous images..."
    rm images/*
    cd ../.. # exits bitacorapp
    cp resources/default_note   bitacorapp-win32-x64/resources/default_note
    echo "Compiling backend..."
    cd ../bndb # exits beenotes, enters bndb
    stack build
    cp .stack-work/install/i386-windows/lts-3.7/7.10.2/bin/bndb.exe ../beenotes/bitacorapp-win32-x64/bndb.exe
    echo "Compiling backend killer..."
    cd ../killer # exits bndb
    cp .stack-work/install/i386-windows/lts-3.15/7.10.2/bin/killer.exe ../beenotes/bitacorapp-win32-x64/killer.exe
    echo "Copying screenshot program..."
    cd ../BNScreenShot
    cp BNScreenShot/bin/Debug/BNScreenShot.exe ../beenotes/bitacorapp-win32-x64/bin/bnsc.exe
    echo "Copying syntax highlighter..."
    cd ../highlighting-kate-0.6
    cp .stack-work/install/i386-windows/lts-3.16/7.10.2/bin/highlighting-kate.exe ../beenotes/bitacorapp-win32-x64/bin/highlighting-kate.exe
    cd ../beenotes/bitacorapp-win32-x64
    echo "Clean up..."
    rm resources/app/*sh
    echo "Executing program..."
    ./bitacorapp.exe
fi


