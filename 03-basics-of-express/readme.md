# Create a New NodeJS application
Use `npm init` to create a new NodeJS application.
* Best ran in an empty folder
* Can be ran with `npm init -y` to skip all the questions and provide
the default answers
* The `package.json` stores the application settings

# Install express
Install with: `npm install express`
* Will install express and all its dependencies in a `node_modules` folder
* Make sure to create a file named `.gitignore` and put `node_modules` in it.
  * Don't ever push `node_modules` to Github

# What's NPM
NPM => Node Package Manager
* Package: A third party library of source code that adds new functonality or feature
* Why do we need NPM? Encourage code reuse.

## nodemon
* Nodemon watches all the files for changes and when a change is detected, it restarts server ==> "hot loading"
`npm install -g nodemon`