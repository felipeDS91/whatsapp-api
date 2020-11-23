<h1 align="center">
  <img
    alt="Logo"
    src="https://res.cloudinary.com/dixtjpk8s/image/upload/v1603667524/API%20WhatsApp/whatsapp-2842640_1280_rfptim.png" width="800px"
  />
</h1>

<h3 align="center">
  API to send messages through WhatsApp
</h3>

<p align="center">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/felipeDS91/whatsapp-api">

  <a href="https://www.linkedin.com/in/felipe-douglas-dev/" target="_blank" rel="noopener noreferrer">
    <img alt="Made by" src="https://img.shields.io/badge/made%20by-felipe%20douglas-%20">
  </a>

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/felipeDS91/whatsapp-api">

  <a href="https://github.com/felipeDS91/whatsapp-api/commits/main">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/felipeDS91/whatsapp-api">
  </a>

  <a href="https://github.com/felipeDS91/whatsapp-api/issues">
    <img alt="Repository issues" src="https://img.shields.io/github/issues/felipeDS91/whatsapp-api">
  </a>

  <img alt="GitHub" src="https://img.shields.io/github/license/felipeDS91/whatsapp-api">
</p>

<p align="center">
  <a href="#-about-the-project">About the project</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-technologies">Technologies</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-getting-started">Getting started</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-how-to-contribute">How to contribute</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-license">License</a>
</p>

<p id="insomniaButton" align="center">
  <a href="https://insomnia.rest/run/?label=Whatsapp-API&uri=https%3A%2F%2Fgithub.com%2FfelipeDS91%2Fwhatsapp-api%2Fblob%2Fmain%2FInsomnia.json" target="_blank">
    <img src="https://insomnia.rest/images/run.svg" alt="Run in Insomnia">
  </a>
</p>

## 👨🏻‍💻 About the project

This API allow send messages using whatsapp through an API Rest. The project is separated by two main process, one for the API Rest and other responsible for check if there is new messages to send in the queue.
Remember: This software is only for study purposes and you have to be careful to not be banned for sending spam using whatsapp. (Send spam through Whatsapp is illegal).

## 🚀 Technologies

Technologies that I used to develop this api

- [Node.js](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Express](https://expressjs.com/pt-br/)
- [TypeORM](https://typeorm.io/#/)
- [JWT-token](https://jwt.io/)
- [MySQL](https://dev.mysql.com/doc/)
- [Date-fns](https://date-fns.org/)
- [Babel](https://babeljs.io/setup)
- [Whatsapp-web.js](https://pedroslopez.me/whatsapp-web.js/)
- [Eslint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [EditorConfig](https://editorconfig.org/)

## 💻 Getting started

Import the `Insomnia.json` on Insomnia App or click on [Run in Insomnia](#insomniaButton) button

### Requirements

- [Docker](https://www.docker.com/)
- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install#windows-stable)

**Clone the project and access the folder**

```bash
$ git clone https://github.com/felipeDS91/whatsapp-api.git && cd whatsapp-api
```

**Follow the steps below**

```bash
# Install the dependencies
$ yarn

# Creates a docker container or use your own mysql installation (changes the password)
$ docker run --name "whatsapp"  -e MYSQL_ROOT_PASSWORD="mysql_password" -p 3306:3306 -d mysql:5.7.30

# Creates a new mysql user (changes the username and password)
# To connect with mysql database you can use a tool like DBeaver for example
$ CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';

# Make a copy of '.env.example' to '.env'
# and set with YOUR environment variables
$ cp .env.example .env

# Run the migrations and seeds
$ yarn typeorm migration:run

# Run this command to start the server in development mode
$ yarn dev:server

# Or you can run separately the API/WhatsApp message client
$ yarn dev:api
$ yarn dev:whatsapp

# Default credentials:
# username: admin
# password: 123456

# Well done, project is started!
```
## 👨🏻‍💻 Endpoints

- /sessions: Sign in to get the access token .
- /message: Send message to the queue.

##### Admin routes
- /users: Manage the access to the API.
- /tokens: Return a qrCode image and also render this QrCode on command line prompt to be read using an whatsapp and record that number to send new messages.

## 😖 Troubleshooting
- Paas hosting (Heroku): This project uses whatsapp-web.js package that uses Puppeter and it is based on chrome. So if you are getting some log like this "...loading shared libraries: libnss3.so: cannot open shared object file..." you will have to install a "Buildpack" in your app. To do it, you have to access the app on Heroku and go to the menu "Settings" --> "Buildpacks" --> "Add buildpack", fill out the Buildpack URL with "jontewks/puppeteer" and click in "Save changes" button. And after your next deploy, this buildpack to use puppeter will be installed with your app.

- Installation of linux dependencies:
`sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget build-essential apt-transport-https libgbm-dev`<br/>
`curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`<br/>
`sudo apt install git nodejs yarn`


## 🤔 How to contribute

- **Make a fork of this repository**

```bash
# Fork using GitHub official command line
# If you don't have the GitHub CLI, use the web site to do that.

$ gh repo fork felipeDS91/whatsapp-api
```

```bash
# Clone your fork
$ git clone your-fork-url && cd whatsapp-api

# Create a branch with your feature
$ git checkout -b my-feature

# Make the commit with your changes
$ git commit -m 'feat: My new feature'

# Send the code to your remote branch
$ git push origin my-feature
```

After your pull request is merged, you can delete your branch

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with 💜&nbsp; by Felipe Douglas 👋 [See my linkedin](https://www.linkedin.com/in/felipe-douglas-dev/)
