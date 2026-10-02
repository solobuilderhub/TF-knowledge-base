#!/usr/bin/env bash
# Session driver for the AuraTax AT1 Schedule 1 (royalty deduction field) check.
#
#   source ab.sh
#   ab open https://app.auratax.ca/landing     # wait for this to return
#   ab snapshot -i
#   ab shot 01-landing
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1
export AGENT_BROWSER_SESSION=auratax-s1-royalty
export AGENT_BROWSER_DEFAULT_TIMEOUT=30000
export AGENT_BROWSER_IGNORE_HTTPS_ERRORS=1

ab() { agent-browser "$@" 2>&1; }
shot() { agent-browser screenshot "screenshots/$1.png" 2>&1; }
