#!/bin/sh -l

echo "========================= Changing directory to $1 ========================="
cd $1
echo "========================= Building APK, it may take 3-4 minutes or more ========================="
( sleep 5 && while [ 1 ]; do sleep 1; echo y; done ) | bubblewrap build --skipPwaValidation --skipSigning
cp ./*.apk ..
cp ./*.aab ..
echo "========================= APK building finished ========================="
