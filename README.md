# KLE Discord Bot

This is a chat bot for the KPH Discord Server, built on top of discord.js.

## Setting up the bot

This bot is built on [node.js](https://nodejs.org/en/). You will need at least node 12.xx. Check the version on your local machine by running 'node -v' on the terminal.

### Get the Discord-API Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) and login with your Discord Account.
2. Create a New Application.
3. Click on Add Bot in the Bot section.
4. You’ll get your Bot API token under the token title
5. Copy it and save it in a file named as /.env/ in your project folder.

### Add bot to your Test Server

1. Go to OAuth2 section in your application
2. Select bot in the scopes menu and Administrator in bot permission menu.
3. A Link will be generated in the scope menu, copy it and paste it in your browser URL tab.
4. Select your test server in the drop down box...

### Fork and clone this repository

-   Fork this repository using the button in the top-right corner of the page. Refer https://docs.github.com/en/github/getting-started-with-github/fork-a-repo for more details.

-   Having forked the repository, clone the repository to your local machine using the below command in the terminal :

```
$ git clone https://github.com/Knuth-Programming-Hub/KLE-bot.git
```

### Build and Execute the bot

1. Move to the project folder:

```bash
    cd KLE-bot
```

2. Run following commands from terminal to install dependencies and run the bot:

```bash
    npm install
    npm start
```
