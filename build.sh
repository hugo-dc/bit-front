#!/bin/bash

APPNAME=bitacorapp
PLATFORM=win32
ARCH=x64
ELVERSION=0.34.0

echo "Compiling $APPNAME for platform $PLATFORM $ARCH using Electron $ELVERSION"
rm -Rf bitacorapp-win32-x64/
electron-packager ./ bitacorapp --platform=$PLATFORM --arch=$ARCH --version=$ELVERSION --overwrite
cd bitacorapp-win32-x64
echo "Moving required programs..."
mv resources/app/bin ./bin
cd bin
rm images/*
rm posts/*
site clean
cd ..
mv resources/app/bndb.bat .
mv resources/app/bndb.exe .
mv resources/app/killer.exe .
mv resources/app/kill.bat .
cd ..
cp resources/database_empty bitacorapp-win32-x64/resources/database
cp resources/default_note   bitacorapp-win32-x64/resources/default_note

cd -
echo "Executing program..."
./bitacorapp.exe


