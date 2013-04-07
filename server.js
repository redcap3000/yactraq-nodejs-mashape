#!/bin/env node
/*

	Mashape Request Wrapper - Express.js
	Hacked up for Yactraq
	
	
	Supply with mashape key, yactrac secret, and yactrac adset.

	http://localhost:8080/
*/
//  OpenShift sample Node application
var express = require('express'),https = require('https');

/**
 *  Define the sample application.
 */
var yactraqRequest = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_INTERNAL_IP;
        self.port      = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_INTERNAL_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  Mashape Request Wrapper - Nodejs
    	
    .                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };
	self.routes['/:youtube'] = function(req,res){
		// Hard coded urls
	      the_host = 'yactraq-yactraq-speech2topics.p' + ".yactraq.com";
	      youtube = req.params.youtube;
	      the_path = 'stream-status?url=https://www.youtube.com/watch?v=' + youtube + '&adset='+ self.adset +'&secret='+self.secret+'&start=1&tx=1';
	      console.log(the_path);
	      var options = { 
              hostname: the_host,
              port: 80,
              path: the_path,
              method: 'GET',
              headers:{
		"X-Mashape-Authorization" : 'PUB1XGTqoEZK8iDqSbvKVNX4k85EYy6a'
              }
            };
            if(the_host != null && the_path != null){
	          var mashape_request = https.get(options, function(res2) {
		      if(typeof res2 != 'undefined'){
				console.log('response error');
			      res.end();
		      }
	              if(res2.statusCode == 200){
		              res2.on('data', function (chunk) {
		                res.write(chunk);
		              });
		              res2.on('end', function(chunk){
		              	 res.end();
		              });
		           }else{
			      res.end(res.send(404,{error:'Problem with yactraq request'}))
		           }
	            });
	            mashape_request.on('error', function(e) {
	              console.log('problem with request: ' + e.message);
	              res.end();
	            });
            }else{
            	res.end(res.send(404,{error:'Missing parameters'}));
            }
	}
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function(key,adset,secret) {
    	if(typeof key !== 'undefined' && typeof key === 'string' && typeof adset !== 'undefined' && typeof secret != 'undefined'){
        	self.mashape_key = key;
		self.adset = adset;
		self.secret = secret;
	}
        else{
        	// exit and error?
        	console.log('Missing or invalid yactraq key');
        	process.exit(1);
        }	
    
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };
    self.constructor = function(){
    
    }

};
/**
 *  main():  Create and Run.
 */
var yactraq = new yactraqRequest();
// yactraq key, adset, secret
yactraq.initialize('<mashape api key>','< yactraq key >','< secret > ');
yactraq.start();

