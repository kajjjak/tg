#!/usr/bin/env bash
python $1/main.py > /dev/null 2>&1 & echo $! > $1/PID
