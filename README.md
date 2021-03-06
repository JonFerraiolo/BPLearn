This is the main README for the BrandingPays Tools (version 2).

## Setup

### Prerequisites

The development environment assumes you are using MacOS.

You'll need to install:

* MacOS 10.10 (Yosemite) or better
* MacOS command line developer tools
    * Just go to Terminal and type in "gcc". This will prompt you to install command line developer tools if not already installed.
* git
    * Install from: http://git-scm.com/download/mac
    * Use at least version 2.2.1
* Node.js
	* Install from http://nodejs.org/download/
	* Use at least version 0.10.35
    * Make sure /usr/local/bin is on PATH (to work with Terminal, edit ~/.bash_profile)
* MongoDB
	* Download it from https://www.mongodb.org/downloads
	* Move the tar.gz file to a favorite folder, then double click on that file in Finder to unpack
	* (Optional) Create a symbolic link to the mongodb folder, such as: ln -s mongodb-osx-x86_64-2.6.6 mongodb
	* Put the mongodb bin/ folder on your PATH (to work with Terminal, edit ~/.bash_profile)
	* Set up the mongo daemon to start with each reboot. Instructions at: http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/
	* Verify that mongod is running via "ps -ef | grep mongo"
	* You can run command-line mongo via "mongo" (after launching a new Terminal window)
* pm2 - process keep-alive service
	* Install via "sudo npm install -g pm2"
	* To launch a process such that it keeps running forever: pm2 start server.js

### Put various things on your PATH

For all of the development tools to work, you need to add the following things to your PATH:

* node
* bower
* mocha
* mongo
* git

One way to accomplish this is to edit the `.bash_profile` file in your home folder (e.g., `vi ~/.bash_profile`). Note that you make it easy to open files that begin with a `.` if you follow the instructions at: http://www.macworld.co.uk/how-to/mac-software/how-show-hidden-files-in-mac-os-x-finder-3520878/. One way to update your PATH is to add the following as the last line in your `.bash_profile` file, where `/__PATHTOMONGO__` is the location where you unpacked the Mongo download (see above). 

```
export PATH=./node_modules/bower/bin:./node_modules/mocha/bin:/__PATHTOMONGO__/mongodb/bin:/usr/local/git/bin:/usr/local/bin:$PATH
```

After updating your `.bash_profile` file, close and reopen all of your Terminal windows. Then issue `which` commands for each of the items above (e.g., `which bower`) to make sure that everything is working correctly.

### Install packages using `npm install`

After installing the pre-requisites and downloading the code from GitHub, go into the base folder for the project and issue `npm install`. (Note: this will run `bower install` under the hood.)

### Create a self-signed SSL certificate in the certs folder

Issue these commands:

mkdir certs
cd certs
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl req -x509 -days 365 -key key.pem -in csr.pem -out cert.pem
cd ..

### To start the server

To start the server, using Terminal, go into the base folder (BrandingPaysTools2), and issue this command: `npm start`. This is equivalent to: `node server.js`.

### To run the tools from a web browser

Type this into the browser's URL bar (note the "s" in https): https://localhost:3000. (Note: you may have to go into advanced mode to allow https access to localhost.)

## Key software used by the tools

### Node.js (with npm for server-side package management)

The server is written in Node.js (server-side JavaScript), with Express4 as the application server technology.

Notes:
* The bootstrap file for the server is `./server.js`. 
* The mapping of all HTTP request end points to associated handlers is defined in `./routes.js`. The actual handlers are in the `./handlers` folder.

(For Node.js beginners:) Node.js includes the `npm` utility for installing and managing server-side modules. The list of Node modules used by the server are found in the `package.json` file. When you run `npm install` (see above), various server-side modules are pulled down from github.com and installed into the `./node_modules` folder.

### bower (for client-side package management)

The tools use "bower" to manage client-side modules. bower is similar in concept and design to npm (which manages server-side modules). bower.json is similar in concept and setup to package.json.

Links:

* http://bower.io/
* http://blog.teamtreehouse.com/getting-started-bower

### AMD-based client logic, require.js and dynamic JavaScript builds

Almost all of the client-side JavaScript logic are AMD modules that are loaded by a client-side version of `require.js`.

The server automatically calls the requirejs optimizer to rebuild ./amd/tools_built.js each time the server is restarted 

Most of the client-side code is found in the `amd/` folder. (Not all, because some of the client-side code is dynamically generated by the server's Node.js logic.)

### CSS defined using LESS

All of the CSS style definitions are defined as *.less files within the "styles/" folder.

The code leverages server-side LESS to compile the *.less files into *.css files. The compilation from *.less to *.css is done dynamically at run time by "less-middleware", which is less packaged as express middleware. The middleware operates as follows: for each *.css file that is requested by the client, the middleware sees if there is a *.less file that is newer than the references *.css, and if so, then re-run the less compiler to generate an updated *.css file, then deliver that *.css to the browser.

The less processor handles "css builds" in that any @import definitions in the *.less files are inline'd before sending to the browser.

The symbol map feature for LESS is used so that it is possible to debug the original *.less files using the Chrome debugger.

### MongoDB for the database

The tools use MongoDB for the database. The initialization logic can be found in `./server.js`.

### Session management using express sessions and passport

Express4 has session logic built-in (express.session). Passport builds on that to provide a general mechanism for managing user login and logout. The tools currently use the "localStrategy" feature because the tools have their own register/login/logout mechanism.

### Real-time updates and simultaneous editing via socket.io

The tools use socket.io 1.x to establish web socket connections between the browser client and the server. This allows the server to push notifications to the client, enabling real-time collaboration between multiple people working on the same user account. (For example, during a consulting phone call, someone from BrandingPays might be editing user data at the same time the user is editing it.)

### Server-side async logic via node-promise

Because Node.js logic is almost entirely asynchronous, it is often necessary to use "promises" approach to make sure that logic block B does not execute until logic block A has completed. (Or maybe logic block Z has to wait for all of [A,B,C,D] to complete.)

The tools use the node-promise module for this purpose.

### pm2 to keep the Node.js server running even if it happens to crash

Must be installed as root globally: npm install -g pm2

Common commands: "pm2 start server.js" and "pm2 stop server.js".

### Automated tests via mocha

The "mocha" testing library is used for both server-side and client-side (in browser) automated testing.

The test suite is found in the `test/` folder, which has two sub-folders: `server/` and `client/`.

To run the client-side tests, start the server, and then open this file in the browser: https://localhost:3000/test/client/mocha.html

### e-Commerce with recurring payments via PayPal

We use PayPal to process subscriptions to the tools using the "recurring payments" feature.

PayPal offers two options for recurring payments: direct payment (where you provide the UI and database for collecting credit card info) and express checkout (where PayPal provides the UI and database for collecting credit card). We are using direct payment largely because PayPal allows unlimited duration for direct payment, but only 10 repeats for express checkout. Also, with direct payment, the charge appears on user credit card statements as "BrandingPays LLC" whereas with express checkout it would have appears just as "PayPal".

* Main PayPal page for e-Commerce account: http://manager.paypal.com
* Talk to BrandingPays team about account info and passwords
* Merchant account technical support: http://www.paypal.com/mts
* There is one "app" with a clientid and secret. Go to https://developer.paypal.com/ and click on "Dashboard".
* Recurring payments intro: https://developer.paypal.com/docs/classic/paypal-payments-pro/integration-guide/WPRecurringPayments/
* Recurring payments pricing: https://merchant.paypal.com/us/cgi-bin/?cmd=_render-content&content_ID=merchant/erp_overview
* PayPal REST APIs: https://developer.paypal.com/docs/classic/paypal-payments-pro/integration-guide/WPRecurringPayments/
    * Click on "Node.js" button so the right-side column shows sample Node.js code
* PayPal Node.js REST API: https://github.com/paypal/PayPal-node-SDK (included in package.json)
* Support pointed to these sites:
    * https://developer.paypal.com/docs/classic/paypal-payments-pro/integration-guide/WPRecurringPayments/
    * https://devtools-paypal.com/tryit
* Support suggested this URL (for classic APIs)
    * https://developer.paypal.com/docs/classic/products/#recurring
* which for PayPal PayFlow Gateway:
    * https://developer.paypal.com/docs/classic/payflow/recurring-billing/

## Supported browsers

* Most recent desktop versions of Chrome, Safari, Firefox and IE11 ??? 
* Mobile browsers ???





