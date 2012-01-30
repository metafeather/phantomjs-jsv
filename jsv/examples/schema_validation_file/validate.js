/*
 * Uses JSV with schema .json files that can be used to output JUnit reports.
 */
(function() {


  // Parse options declared in the URL, e.g. the test_suite filename
  var url_options = {},
      url = url || YUI().config.doc.location.search;

  if (url){
    var  params = url.slice(1).split("&");
    for (var i=0; i <params.length; i++){
      var param = params[i].split("=");
      url_options[param[0]] = param[1];
    }
  }

  // The actual test runner is used if only a schema and api file has been declared.
  if (url_options && !url_options.schema && url_options.json){
    console.log('A path to a schema file is required');
  }
  if (url_options && url_options.schema && !url_options.json){
    console.log('A path to a json file is required');
  }
  if (url_options && url_options.schema && url_options.json){
    window.Y = YUI({
        logInclude:{"TestRunner":true},
        useConsole: true,
        useBrowserConsole: true
    }).use('test', 'console', 'io-base', function(Y){

      // use JSV
      var JSV = require("./jsv").JSV;
      var env = JSV.createEnvironment();

      // YUITest compatible API
      JSV._lastResults = null;
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
          var total = Object.keys(results.validated).length;

          function serializeToJUnitXML(results){
            var l = Y.Lang,
                xml = "";

              // XML structure
              xml += '<testsuites>';
              xml +=   '<testsuite name="'+ url_options.json +'" tests="'+ total +'" failures="'+ results.errors.length +'" time="'+ total +'">';

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
          var total = Object.keys(results.validated).length;

          function serializeToJUnitTAP(results){
            var currentTestNum = 1,
                l = Y.Lang,
                text = "";

              // text structure
              text +=  '#Begin testsuite '+ url_options.json +' ('+ results.errors.length +' failed of '+ total +')\n';
              text +=   '#Begin testcase '+ url_options.json +' ('+ results.errors.length +' failed of '+ total +')\n';

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

              text +=   '#End testcase '+ url_options.json +'\n';
              text += '#End testsuite '+ url_options.json +'\n';

              return text;
          }
          return "1.."+ total +'\n'+ serializeToJUnitTAP(results);
        }

      };

      var STRIP_COMMENTS = new RegExp(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g),
          schema = {},
          json = {};

      // make sync requests for data, strip comments and parse as JSON
      schema = Y.io(url_options.schema, {sync: true});
      schema = schema.responseText.replace(STRIP_COMMENTS, '');
      schema = JSON.parse(schema);
      json = Y.io(url_options.json, {sync: true});
      json = json.responseText.replace(STRIP_COMMENTS, '');
      json = JSON.parse(json);

      window.report = JSV._lastResults = env.validate(json, schema);

      if (report.errors.length === 0) {
        console.log('JSON is valid against the schema');
      } else {
        console.log('JSON is not valid against the schema: '+ report.errors.length +' errors');
      }
      console.log(report);

    });
  }


})();