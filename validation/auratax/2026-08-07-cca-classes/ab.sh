#!/usr/bin/env bash
# Session driver for the AuraTax CCA-class validation.
#
# Launch ONCE and wait — the first open takes minutes on this machine and running
# several in parallel only saturates it. Subsequent commands reuse the live
# session and are fast.
#
#   source ab.sh
#   ab open https://app.auratax.ca/landing     # wait for this to return
#   ab snapshot -i
#   ab shot 01-landing
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1
export AGENT_BROWSER_SESSION=auratax-cca
export AGENT_BROWSER_DEFAULT_TIMEOUT=30000
export AGENT_BROWSER_IGNORE_HTTPS_ERRORS=1

ab() { agent-browser "$@" 2>&1; }
# ab shot <slug> → screenshots/<slug>.png
shot() { agent-browser screenshot "screenshots/$1.png" 2>&1; }

# Recover from a wedged daemon: kill agent-browser's own Chrome/node and clear
# the stale session files. Does not touch the user's own browser.
abreset() {
  powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' or Name='node.exe'\" | Where-Object { \$_.ExecutablePath -like '*agent-browser*' -or \$_.CommandLine -like '*agent-browser*' } | ForEach-Object { try { Stop-Process -Id \$_.ProcessId -Force -ErrorAction Stop } catch {} }; Remove-Item \"\$env:USERPROFILE\.agent-browser\*.pid\",\"\$env:USERPROFILE\.agent-browser\*.port\",\"\$env:USERPROFILE\.agent-browser\*.stream\",\"\$env:USERPROFILE\.agent-browser\*.version\",\"\$env:USERPROFILE\.agent-browser\*.config\",\"\$env:USERPROFILE\.agent-browser\*.engine\" -Force -ErrorAction SilentlyContinue"
}
