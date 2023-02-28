# YmailBot - Temporary Email Service in your smartphone. 📬

## Contents
 - [Introduction](#introduction)
 - [Features](#features)
 - [Installation](#installation)
 - [Usage](#usage)
 - [Contributing](#contributing)
 - [License](#license)
 - [Credits](#credits)

## Introduction
----------------
### What is YmailBot?
Ymail is a user-friendly telegram bot that lets you create temporary email addresses and receive emails on your smartphone for free. Its open source design allows you to receive emails from any website or service requiring email verification, as well as from friends and family. The bot helps safeguard your privacy and keep your email address secure by preventing spamming and hacking attempts.

### Why YmailBot?
YmailBot is a free, open source, and user-friendly temporary email service that allows you to receive emails on your smartphone. It is a great alternative to other temporary email services that require you to sign up for an account and provide your personal information. Ymail is a great way to protect your privacy and keep your email address secure. There is also an ability to connect your own domain to the bot to prevent service from being blocked by some websites.


## Features
----------------

### Create a temporary email address
You can create a temporary email address by sending the command `/new` to the bot. The bot will then generate a random email address for you and forward all incoming emails to your chat.

### Persistent email address
One persistent email address is created for each chat. You can use this email address to receive emails from friends and family instead of using your main email address. The bot will forward all incoming emails to your chat.

### Connect your own domain
You can connect your own domain to the bot to prevent service from being blocked by some websites. To do that, you need to install bot on your own machine and follow the instructions in the [Installation](#installation) section.

## Installation
----------------
### Requirements
 - [Deno](https://deno.land/) runtime or [Docker Compose](https://docs.docker.com/compose/)
 - Custom domain
 - [SurrealDB](https://surrealdb.com) Instance or [Docker Compose](https://docs.docker.com/compose/)
 - [Mailgun](https://www.mailgun.com/) account

### Setup
Using Docker Compose:
- Clone the repository and navigate to the project directory.
```bash
$ git clone https://github.com/voxelin/Ymail.git
$ cd Ymail
```
- Rename `.env.example` to `.env` and fill in the required fields.
```bash
$ mv .env.example .env
$ nano .env
```
- Run the bot using Docker Compose.
```bash
$ docker-compose up -d
```
- Next steps from [Network Setup](#network-setup) section.

Using Deno:
- Clone the repository and navigate to the project directory.
```bash
$ git clone https://github.com/voxelin/Ymail.git
$ cd Ymail
```
- Rename `.env.example` to `.env` and fill in the required fields.
```bash
$ mv .env.example .env
$ nano .env
```
- Start the database server.
```bash
$ curl -sSf https://install.surrealdb.com | sh
$ surreal start --user <username-from-env> --pass <password-from-env> <DB-Path-from-env>
```

- Run the bot using Deno.
```bash
$ deno task edge
```

### Network Setup
- Set up a webhook integration in your bot's settings. You can use [ngrok](https://ngrok.com/) to expose your local server to the internet.
```bash
$ ngrok http 7000
```
- Set up a webhook integration in your bot's settings. Use the URL provided by ngrok as the webhook URL.
```jsonc
// Navigate to https://api.telegram.org/bot<your-bot-token>/setWebhook?url=<your-webhook-url>/bot/<your-bot-token>. You should receive a response like this:
{"ok":true,"result":true,"description":"Webhook was set"}
```
- Login to your mailgun account and add your custom domain. Follow the instructions on the mailgun website to verify your domain.
- Open Receiving tab and create a new route. Set this settings:
```diff
+ Expression type: Catch All
+ Forward: <your-webhook-url>/receive?secret=SECRET_KEY_FROM_ENV
+ Priority: 0
```

You are all set! Now you can use the bot to create temporary email addresses and receive emails on your smartphone. 🎊📬


## Usage
----------------
### Commands
 - `/start` - Start the bot.
 - `/help` - Show help message.
 - `/new` - Create a new temporary email address.
 - `/list` - List all temporary email addresses.
 - `/delete` - Delete your temporary email address.
 - `/deleteall` - Delete all temporary email addresses.


## Contributing
----------------
Contributions are welcome! Please read the [contribution guidelines](contributing.md) first.

## License
----------------
This project is licensed under the GNU General Public License - see the [LICENSE](LICENSE) file for details.

## Credits
----------------
- [voxelin 🇺🇦](https://github.com/voxelin) - The creator of this project.
- [SurrealDB](https://surrealdb.com/) - A simple, fast, and secure database that I personally love.
- [Mailgun](https://www.mailgun.com/) - A simple service for sending and receiving emails.
- [Deno](https://deno.land/) - A secure runtime for JavaScript and TypeScript.
- [Docker](https://www.docker.com/) - A great tool for containerizing applications.
- [ngrok](https://ngrok.com/) - An easy way for exposing local servers to the internet.