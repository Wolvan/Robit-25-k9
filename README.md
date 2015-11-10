# Robit-25-k9
[![NPM](https://nodei.co/npm/lctv-chat-bot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/lctv-chat-bot/) [![Join the chat at https://gitter.im/Wolvan/Robit-25-k9](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Wolvan/Robit-25-k9?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![npm version](https://badge.fury.io/js/lctv-chat-bot.svg)](https://badge.fury.io/js/lctv-chat-bot)

## Introduction
Robit-25-k9 is the name of a chat bot, written in NodeJS, for the [Livecoding.TV Chat Bot Competition](http://blog.livecoding.tv/2015/10/18/livecoding-tv-chat-bot-competition-3/).

## Features
* Easily configurable: The configuration supports multiple formats
* Lightweight: Being a NodeJS app makes it easily deployable everywhere! Even on low power servers
* Automatic Messages in a regular interval
* Greets your viewers with 3 different welcome messages
* Chat commands!
* Multi-Language support!

## Setup
1. Install NodeJS
2. Use ``npm install -g lctv-chat-bot``
3. Configure the bot (See Configuration)
4. Run it with ``lctv-bot [-u|-p|-c|-config|-help]``

## Configuration
The bot comes with a default configuration file in the ``./config/`` folder.
To configure the bot, create a file in one of the [supported formats](https://github.com/lorenwest/node-config/wiki/Configuration-Files#file-formats). Afterwards, either place the file in the ``./config/`` folder and name it ``local.EXTENSION`` yourself or start the bot with the ``-config <Config File>`` parameter, which copies the file to the right directory for you. The next time you start the bot, this isn't necessary unless you modified the config.

## How to get the LCTV Password? (Thanks to [owenconti](http://www.github.com/owenconti))
1. Open your live stream page ( https://www.livecoding.tv/USERNAME )
2. Open Dev Tools and switch to the Elements tab
3. Search the HTML content for "password".
4. The XMPP password will be a long string in an object containing 'jid' and 'password'.
