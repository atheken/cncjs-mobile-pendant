#!/usr/bin/env bash

for i in `seq 10`; do
    socat -d -d PTY,raw,link=/dev/ttySIM$i,echo=0 TCP:grbl-sim:9600 &
done

cncjs > /dev/stdout 2> /dev/stderr