@echo off
if "%1"=="-qo" (
    powershell -Command "Expand-Archive -Path '%~2' -DestinationPath '%~4' -Force"
) else (
    powershell -Command "Expand-Archive -Path '%~1' -DestinationPath '%~3' -Force"
)
