/*
* PhantomJS JSV driver
*
* Runs a single HTML file with JSV setup in it and reports the results in (human readable) TAP format.
* This is a simple example for comparison with run-qunit.js, run-jasmine.js, etc.
*
* Home: https://github.com/metafeather/phantomjs-jsv
*/

var fileoverview = "PhantomJS JSV Driver (v0.1)";

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

if (phantom.args.length === 0 || phantom.args.length > 2) {
  console.log('Usage: run-jsv-single.js URL');
  phantom.exit(1);
}

var page = require('webpage').create();

page.settings.javascriptEnabled = true;
page.settings.localToRemoteUrlAccessEnabled = true;
page.settings.loadImages = true;
page.settings.loadPlugins = true;
page.viewportSize = {
  width: 1024,
  height: 1024
}

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.open(
  phantom.args[0],
  function(status){
    var timeout=10,
        exit = 1;

    if (status !== "success") {
      console.log("Unable to access network");
      phantom.exit(exit);
    } else {

      waitFor(
        function test(){
          return page.evaluate(function(){
            console.log('Waiting for results ... ');

            // check there is a test runner and query its status by asking for any results
            if(window.JSV) {
              return !!JSV._lastResults;
            } else {
              console.log("Not a test page");
              return true;
            }
          });

        },
        function onReady(){
          // export test results data
          var data = page.evaluate(function(){

            // get all the results in various formats for convienience
            if(typeof window.JSV._lastResults === 'object') {

              // YUITest compatible API
              JSV.getResults = function(format){
                if (Y.Lang.isFunction(format)){
                  return format(this._lastResults);
                } else {
                  return this._lastResults;
                }
              };

              // Results formatters
              JSV.Format = {
                JUnitXML: function(results){
                  var total = Object.keys(results.validated).length,
                      filename = JSV._options.json;

                  function serializeToJUnitXML(results){
                    var l = Y.Lang,
                        xml = "";

                      // XML structure
                      xml += '<testsuites>';
                      xml +=   '<testsuite name="'+ filename +'" tests="'+ total +'" failures="'+ results.errors.length +'" time="'+ total +'">';

                      if (l.isArray(results.errors)){
                        Y.Array.each(
                          results.errors,
                          function (v,i,a){
                            xml += '<testcase name="'+ v.schemaUri +'" time="1">';
                            xml +=   '<failure message="'+ v.message +'\>';
                            xml +=     '<![CDATA['+ v.message +']]>';
                            xml +=   '</failure>';
                            xml+= "</testcase>";
                          }
                        )
                      };
                      if (l.isObject(results.validated)){
                        Y.Object.each(
                          results.validated,
                          function (v,i,o){
                            xml += '<testcase name="'+ i +'" time="1">';
                            xml+= "</testcase>";
                          }
                        )
                      };

                      xml +=   '</testsuite>';
                      xml += '</testsuites>';

                      return xml;
                  }
                  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"+ serializeToJUnitXML(results);
                },
                TAP: function(results){
                  var total = Object.keys(results.validated).length,
                      filename = JSV._options.json;

                  function serializeToJUnitTAP(results){
                    var currentTestNum = 1,
                        l = Y.Lang,
                        text = "";

                      // text structure
                      text +=  '#Begin testsuite '+ filename +' ('+ results.errors.length +' failed of '+ total +')\n';
                      text +=   '#Begin testcase '+ filename +' ('+ results.errors.length +' failed of '+ total +')\n';

                      if (l.isArray(results.errors)){
                        Y.Array.each(
                          results.errors,
                          function (v,i,a){
                            text += 'not ok '+ (currentTestNum++) +' - '+ v.schemaUri +' - '+ v.message +'\n';
                          }
                        )
                      };
                      /*
                      if (l.isObject(results.validated)){
                        Y.Object.each(
                          results.validated,
                          function (v,i,o){
                            text += 'ok '+ (currentTestNum++) +' - '+ i +'\n';
                          }
                        )
                      };
                      */

                      text +=   '#End testcase '+ filename +'\n';
                      text += '#End testsuite '+ filename +'\n';

                      return text;
                  }
                  return "1.."+ total +'\n'+ serializeToJUnitTAP(results);
                }

              };

              return {
                js: JSV.getResults(), // JS object
                junit: JSV.getResults(JSV.Format.JUnitXML), // JUnit XML report
                tap: JSV.getResults(JSV.Format.TAP) // JUnit XML report
              }
            } else {
              return false;
            }
          });

          // save an image of the page
          page.render("screenshot.png");

          if (data){
            // parseable but human readable output
            if (data.tap){
              console.log(data.tap);
            }

            if (data.junit){
              // onsole.log('Results in JUnit format can easily be saved to the filesystem');
              var fs = require('fs');
              fs.write("junit.xml", data.junit, 'w');
            }

            if (data.js){
              // exit indicating failed states
              exit = (parseInt(data.js.errors.length) > 0 ? 1: 0);
            }
          }
          phantom.exit(exit);
        },
        (timeout * 1000)
      );
    }
  }
);
