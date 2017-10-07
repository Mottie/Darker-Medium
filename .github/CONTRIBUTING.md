# Contributing

1. [Getting Involved](#getting-involved)
3. [Getting Started](#getting-started)
4. [Build & Test](#build--test)

## Getting Involved

There are a number of ways to get involved with the development of this Web Extension. Even if you've never contributed to an Open Source project before, we're always looking for help identifying spelling mistakes, grammar corrections or any other kind of help.

**This project is bound by a [Code of Conduct](CODE_OF_CONDUCT.md)**.

## Getting Started

Here is a quick summary:

* Download, fork or clone this repository to your computer.
* Make sure [node.js](http://nodejs.org/) is installed.
* Run `npm install` to get the build scripts working.
* Create and switch to a branch before making any corrections or enhancements to the files.
* Run `npm test` to check the linting of both the JavaScript and CSS files.
* Commit and push the changes to your fork.
* Submit a pull request with a description of the changes you made.

For more details, check out this [contributing guide](https://github.com/Roshanjossey/first-contributions#readme).

## Build & test

* To test this script, make sure to run `npm install` to install the required node modules.
* Note that at the time of this writing, you will see some warnings while attempting to load the unpacked extension into Chrome:
  * The warnings are related to the [`node-jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken/issues/411) module.
  * It is safe to ignore these warnings as they will not impede this extension from running.
* Currently there are no unit tests associated with this web extension, so running `npm test` will only check for linting errors.
* You can test your changes by loading the extension into your browser

### Webkit (Chrome)

* Go to the Menu &gt; More tools &gt; Extensions.
* Check the "Developer mode" checkbox.
* Click on "Load unpacked extension...".
* Find the folder for this extension on your computer.
* Click on the "background page" link next to "Inspect views" to check for errors on the background page.
* Open the options, then right click and "Inspect" to open the Development tools to check for errors.

### Firefox

* First, you'll need to create the compressed `.xpi` file:
  * Make sure to run `npm install` first, if you haven't done it already.
  * Now use `npm run build` to create the `darker-medium.xpi` file in the root directory.
* Open Firefox
  * Navigate to `about:debugging#addons`.
  * Click "Load Temporary Add-on".
  * *Make sure* to select the `darker-medium.xpi` file.
  * Click "Debug", then "OK" when the pop up asks to permit a remote debugging connection; This is the browser communicating with the debug window, it has nothing to do with this web extension.
  * Check for errors in this debugging window.
  * Please be aware that not all the errors shown in the debug window are related to this web extension.
