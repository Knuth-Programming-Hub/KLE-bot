# Contributing to the bot

Contributions are always welcome, no matter how big or small!

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to our Discord server.

## Fork and clone this repository

- Fork this repository using the button in the top-right corner of the page. Refer https://docs.github.com/en/github/getting-started-with-github/fork-a-repo for more details.

- Having forked the repository, clone the repository to your local machine by using the below command in your terminal:

```
$ git clone https://github.com/YOUR-GITHUB-USERNAME/KLE-bot
```

- Having cloned the copy to your local machine, enter into the KLE-bot directory using the cd command.

```
$ cd KLE-bot
```

## Setup

### Install Node.js

The bot is built on node.js. Install it from [here](https://nodejs.org/en/).

### Setup local MongoDB server

The bot uses MongoDB as its database. In order to install MongoDB, refer the guide here: https://docs.mongodb.com/guides/server/install/

### Create the bot on Discord

For an illustrated guide, refer [this](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token).

- Go to [Discord Developer Portal](https://discord.com/developers/applications) and login with your Discord Account.
- Create a New Application.
- Click on Add Bot in the Bot section.
- You’ll get your _Bot API token_ under the token title.

### Add bot to yout Test Server

- Go to OAuth2 section in your application
- Select bot in the scopes menu and _Administrator_ in bot permission menu.
- A Link will be generated in the scope menu, copy it and paste it in your browser's address bar.
- Select your test server from the drop down box...

### .env file

For the environment variables, create a _.env_ file.

**Note: Specify the environment variables according to your need i.e. you might not require some of them depending upon your use-case. To help you, for each environment variable, the reasons and references for it have been provided here.**

<details>
  <summary>Bot token</summary>

First of all, you need to specify [your Bot token](CONTRIBUTING.md#Create-the-bot-on-Discord) to perform any action through your bot.

```
BOT_TOKEN = <Your-Bot-Token>
```

</details>

<details>
  <summary>MongoDB path</summary>

The path to [your MongoDB server](CONTRIBUTING.md#Setup-local-MongoDB-server) is required for establising the connection.

```
mongoPath = "mongodb://localhost:27017/<Your-DB-Name>"
```

</details>

<details>
  <summary>Discord-related environment variables</summary>

To get the Server, Channel and User IDs on Discord, refer this [article](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID).

- The Server ID is required to handle many server-related actions.
  ```
  SERVER_GUILD_ID = <Your-Test-Server-ID>
  ```
- Currently, as part of the "JIITian-verification-process", the bot only allow members to initiate the process through a specific channel on the server.
  ```
  VERIFY_CHANNEL_ID = <Verify-Channel-ID>
  ```
- In case there is any error, the bot logs the error message to a specified channel on the server.
  ```
  ERROR_LOG_CHANNEL = <Error-Log-Channel-ID>
  ```
- To link Discord usernames to CF handles the bot depends upon the [TLE bot](https://github.com/cheran-senthil/TLE). This also means that you require TLE to be in your Test server for accomplishing this task.
  ```
  TLE_ID = <TLE-Bot-Discord-User-ID>
  ```

</details>

<details>
  <summary>Email Credentails</summary>

The verification process involves sending an email to the institute email id of the member who has requested verification. For this reason an email account is required which will be used to send the email.

```
SENDER_MAIL_ID = <Email-ID>
SENDER_PASSWORD = <Email-Password>
```

</details>

<details>
  <summary>GitHub Token</summary>

The bot has a _!paste_ command which uses [gists](https://docs.github.com/en/free-pro-team@latest/github/writing-on-github/creating-gists#about-gists) and for that you require a GitHub personal access token ([create](https://github.com/settings/tokens/new)). You need to atleast select the _"gist"_ scope for the token you will create.

```
GITHUB_TOKEN = <GitHub-Token>
```

</details>

### Build & Execute the bot

- Run following commands from the terminal.

```
    npm install
    npm start
```

- The bot will become online on your Test Server!

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you
   do not have permission to do that, you may request one of the reviewers to merge it for you.
