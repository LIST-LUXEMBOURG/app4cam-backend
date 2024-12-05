#!/bin/bash
sudo -u app4cam XDG_RUNTIME_DIR=/run/user/$(id -u app4cam) systemctl --user stop app4cam-backend
sleep 30
sudo -u app4cam XDG_RUNTIME_DIR=/run/user/$(id -u app4cam) systemctl --user start app4cam-backend
rm /home/app4cam/app4cam-backend/upgrading
rm -rf /home/app4cam/app4cam-backend/temp/upgrade/*
