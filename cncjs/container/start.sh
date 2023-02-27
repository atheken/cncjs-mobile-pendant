#!/usr/bin/env bash

trap stop 2

function stop(){
    kill -9 $child
}

## start a socat connection to the grbl sim in the background, then call the normal start.
socat -d -d PTY,raw,link=/dev/ttySIM,echo=0 TCP:grbl-sim:9600 &

child=$!

cncjs > /dev/stdout 2> /dev/stderr