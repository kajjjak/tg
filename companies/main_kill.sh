#!/usr/bin/env bash
kill -9 `cat $1/PID` || echo "No PID"
