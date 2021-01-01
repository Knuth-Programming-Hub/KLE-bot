# Contributing to the bot

Contributions are always welcome, no matter how big or small!

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to our Discord server.

## Fork and clone this repository

-   Fork this repository using the button in the top-right corner of the page. Refer https://docs.github.com/en/github/getting-started-with-github/fork-a-repo for more details.

-   Having forked the repository, clone the repository to your local machine by using the below command in your terminal:

```
$ git clone https://github.com/YOUR-GITHUB-USERNAME/KLE-bot
```

-   Having cloned the copy to your local machine, enter into the KLE-bot directory using the cd command.

```
$ cd KLE-bot
```

## Setup

<details>
    <summary> <strong> Install Node.js </strong> </summary>

-   This bot is built on node.js. Install it from [here](https://nodejs.org/en/).

</details>

<details>
    <summary> <strong> Setup local MongoDB server </strong> </summary>

-   The bot uses MongoDB as its database. In order to install MongoDB, refer the guide here: https://docs.mongodb.com/guides/server/install/

</details>

<details>
    <summary> <strong> Create the bot on Discord </strong> </summary>

-   Go to [Discord Developer Portal](https://discord.com/developers/applications) and login with your Discord Account.
-   Create a New Application.
-   Click on Add Bot in the Bot section.
-   You’ll get your _Bot API token_ under the token title.

</details>
    
<details>    
    <summary> <strong> Add bot to yout Test Server </strong> </summary>

-   Go to OAuth2 section in your application
-   Select bot in the scopes menu and _Administrator_ in bot permission menu.
-   A Link will be generated in the scope menu, copy it and paste it in your browser's address bar.
-   Select your test server from the drop down box...

</details>

<details>    
    <summary> <strong> .env file </strong> </summary>

-   Create your _.env_ file and add the following code to it:

```
BOT_TOKEN = <Your-Bot-Token>
mongoPath = "mongodb://localhost:27017/<Your-DB-Name>"
```

</details>
    
<details>
    <summary> <strong> Build & Execute the bot </strong> </summary>

-   Run following commands from the terminal

```
    npm install
    npm start
```

-   The bot will become online on your Test Server!

</details>

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you
   do not have permission to do that, you may request one of the reviewers to merge it for you.
