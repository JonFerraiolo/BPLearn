## About this file

This file contains information about how to set up the InMotion environment and how to copy a new version of the tools to the Inmotion server.

There are two main sections. At the top, there are instructions for uploading a new version of the tools to the InMotion server. The second main section below explains all of the one-time setup things that were necessary to do on the InMotion server to allow the tools to run (which use Node and Mongo).

## Updating the elearning/tools logic on InMotion

* Open up three Terminal windows.
* In Terminal window 1
    * Go to the git/BPLearn/ folder on your local machine, which will hold the source code you want to upload to InMotion
    * Issue "npm run-script clean" to get rid of all built files and just leave the source code
    * Issue 'zip -r ../BPLearn-YYYYMMDD-N.zip . -x ".git/*"' to create a ZIP file. YYYYMMDD is today's date. N is a number (e.g., "1").
    * Copy the zip file to InMotion via "scp ../BPLearn-YYYYMMDD-N.zip brandi7@brandingpays.com:" (same password as cpanel)
* In Terminal window 2, 
    * "ssh brandi7@brandingpays.com" (same password as cpanel)
    * mkdir BPLearn-YYYYMMDD-N (same name as ZIP file)
    * cd BPLearn-YYYYMMDD-N (same name as folder just created)
    * unzip ../BPLearn-YYYYMMDD-N.zip (same name as ZIP file)
    * npm install
    * Stop the currently running server (not sure how to do that quite yet)
    * cd ..
    * rm BrandingPaysLearnService (which should have been a symbolic link)
    * ln -s BPLearn-YYYYMMDD-N BrandingPaysLearnService
* In Terminal window 3,
    * "ssh root@brandingpays.com" (very obscure password)
    * service BrandingPaysLearnService stop
    * service BrandingPaysLearnService start

## If "npm install" fails on InMotion, try restarting the VPS

I have run into problems where "npm install" doesn't work because the VPS has too little swap space. To check swap space, go to WHM and click on Server Status / Service Status and look at Swap Used. If zero or very low, then the VPS should be restarted. To restart the VPS, go to AMP and click on the icon for "Restart VPS".

## Updating node/npm on InMotion

To update node/npm on InMotion, you need to pull down the latest node.js sources and rebuild/reinstall. Instructions are here:

* http://www.inmotionhosting.com/support/website/cpanel-account-management/obtain-root-access

## One-time setup for InMotion

The following sections explain all of the things we had to do to get Node.js and Mongo running on InMotion. Also, how to establish Apache redirects so that http[s]://brandingpays.com/learn brings up the tools (running on port 3000).

### Install node.js

First, I needed root access to brandingpays.com. Instructions for how to get root access (and can change the root password) at:

* http://www.inmotionhosting.com/support/website/cpanel-account-management/obtain-root-access

To actually run as root, you have to issue this command:

* ssh root@brandingpays.com

I currently have root access, so I was able to perform the various steps below.

To install Node.js, I ssh'd as root and followed the instructions at:

* http://www.inmotionhosting.com/support/website/javascript/install-nodejs

Note that we have CentOS6, and that Python 2.6 is already installed.

### Install mongo

To install mongodb, I ssh'd as root and following the instructions at:

* http://docs.mongodb.org/manual/tutorial/install-mongodb-on-red-hat-centos-or-fedora-linux/

We are running 64-bit, so I created `/etc/yum.repos.d/mongodb.repo` with these contents:

```
[mongodb]
name=MongoDB Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/
gpgcheck=0
enabled=1
```

Then I ran `yum install -y mongodb-org`

I didn't have to deal with SELinux because it's not installed on our VPS.

To start mongo: `service mongod start`. To make sure it restarts with reboots: `chkconfig mongod on`

### Install pm2

Logged in as root on brandingpays.com:

npm install -g pm2

### Update ~/.bash_profile

I had to add a couple of things to the PATH so the install scripts could find bower and mocha:

```
PATH=$PATH:$HOME/bin:$HOME/learn/node_modules/bower/bin:$HOME/learn/node_modules/mocha/bin
export PATH
```

### Add proxy for /learn to http(s)://brandingpays.com/learn

The main Apache configuration file is found at `/usr/local/apache/conf/httpd.conf`. However, this file should not be edited directly - it is automatically created by InMotion cpanel utilities. Instead, we are only allowed to customize the VirtualHost values via custom configuration files in these two folders:

* /usr/local/apache/conf/userdata/std/2/brandi7/*.conf
* /usr/local/apache/conf/userdata/ssl/2/brandi7/*.conf

I created `/usr/local/apache/conf/userdata/std/2/brandi7/learn.conf` with these contents:

```
  RewriteEngine On
  RewriteRule ^/?learn/startup/?$ https://brandingpays.com/learn/startup [R=301,L]
  RewriteRule ^/?learn/startup/([0-9]+)$ https://brandingpays.com/learn/startup/$1 [R=301,L]
  RewriteRule ^/?learn/?$ https://brandingpays.com/learn/ [R=301,L]
```

The above rule sends a permanent redirect (301) for any requests to `http://brandingpays.com/learn` (either learn, /learn, learn/ or /learn/) to `https://brandingpays.com/learn/`

I created `/usr/local/apache/conf/userdata/ssl/2/brandi7/learn.conf` with these contents:

```
  SSLProxyEngine On
  ProxyPreserveHost On
  ProxyRequests off
  ProxyPass /learn/ https://brandingpays.com:3000/
  ProxyPassReverse /learn/ https://brandingpays.com:3000/
  ProxyPass /learn https://brandingpays.com:3000/
  ProxyPassReverse /learn https://brandingpays.com:3000/
```

This causes all URLs that the browser sends to https://brandingpays.com/learn to be received by the Node process listening to https on port 3000.

### Restart the web server using InMotion WHM

Log into web host manager at http://brandingpays.com/whm. Give password (same as cpanel). Scroll the left-size menu down towards the bottom to "Restart services" section. Click on Apache and click on the yes/ok button to restart the server.

### How to make sure the Node server restarts with each reboot

First, I had to set up the BrandingPaysTools server as a "service". To do this, I ssh'd as root to brandingpays.com, then created file "/etc/init.d/BrandingPaysLearnService" (with permissions 755) with these contents:

```
#!/bin/sh
### BEGIN INIT INFO
# Provides:          BrandingPaysLearnService
# Required-Start:    $local_fs
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# X-Interactive:     false
# Short-Description: Example init script
# Description:       Start/stop an example script
### END INIT INFO

DESC="BrandingPaysLearnService service script"
NAME=BrandingPaysLearnService
#DAEMON=

do_start()
{
   sudo -u brandi7 bash -c 'cd /home/brandi7/learn; source ~/.bash_profile; pm2 start server.js >stdout.log 2>stderr.log;'
}

do_stop()
{
   sudo -u brandi7 bash -c 'cd /home/brandi7/learn; source ~/.bash_profile; pm2 stop server.js;'
}


case "$1" in
   start)
     do_start
     ;;
   stop)
     do_stop
     ;;
esac

exit 0
```

To register the service, issue this command:

```
chkconfig --add BrandingPaysLearnService
```

To turn on the BrandingPaysTools Node.js service:

```
service BrandingPaysLearnService start
```

To stop the service:

```
service BrandingPaysLearnService stop
```

To make sure the service restarts when the system reboots, theoretically this should work:

```
chkconfig BrandingPaysLearnService on
```

However, this did not work for me. After I restarted the VPS (available on the AMP panel at InMotion), the Node.js was not running. So I reverted to Plan B, turned off the auto-restart via `chkconfig BrandingPaysToolsService off` and adding the line "service BrandingPaysToolsService start" to the end of `/etc/rc.d/rc.local`.

### Restart the VPS at InMotion

They ask that we ask support to restart the VPS. Just go to InMotion support and start a chat session.




