#!/usr/bin/env bash
python main.py > /dev/null 2>&1 & echo $! > $1/PID
