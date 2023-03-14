#!/usr/bin/env bash

counter=1

#wait for the grbl-sims to get loaded.
sleep 5;

for i in `getent hosts grbl-sim | awk '{print $1}'`; do
    socat -d -d PTY,raw,link=/dev/ttySIM$counter,echo=0 TCP:$i:9600 &
    counter=$((counter+1))
done

cncjs > /dev/stdout 2> /dev/stderr