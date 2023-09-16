# Wary Counting

Your standard Discord counting bot with a little less trolling.

## The Problem
Most counting bots are vulnerable to a simple trick:
1. Bob counts `12` and receives a check.
2. Mal counts `****13` and the bot doesn't pick it up.
3. Mal adds a check reaction manually.
4. Bob counts `14` and loses, because the bot hadn't counted 13 yet.

## The Solution
Wary Counting finds numbers in messages even when they're mixed with invisible characters. If Bob sees `13`, the bot does too.
