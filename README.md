# discord-bot-blazzy

install https://nodejs.org/ (LTS)

clone or download project

unzip

navagate to folder and run command below

run 'npm install'

remove .template from 'config.json.template'

replace with respective information

Bot-Token
Application-Id
Guild-Id

in order to deploy commands run 'node .\deploy-commands.js' it is important that you DO NOT run 'node .\global-deploy-commands.js'

in order to launch the bot run 'node .' or 'node .\index.js'

--------------------
sqlite3 (not optional)

npm install better-sqlite3

--------------------
optional linter (is recommended)

install https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint for vscode

if linter has issues right away navigate to your project folder and run 'npm install --save-dev eslint @eslint/js'