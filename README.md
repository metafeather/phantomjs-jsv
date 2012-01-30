# phantomjs-yuitest

The javascript scripts in *phantomjs-jsv* enable the execution and gathering of JSON Schema Validation ([JSV][]) results via PhantomJS.

## Highlights

* Run a single test file.
* Run tests from the filesystem or hosted on other servers.
* Fast headless testing on [PhantomJS][], a full featured WebKit browser with native support for
various web standards: DOM handling, CSS selector, JSON, Canvas, and SVG.
* Run the same tests in exactly the same manner in a browser for easy test debugging.
* Output reports in supported YUI Test formats: [JUnit][], [TAP][], and render a screenshot of each page.
* Runs on Mac OS X, Linux and Windows.

## Install

You need the PhantomJS browser installed on your system. You can download binaries for Mac OS X and Windows from
[the PhantomJS download section][].

You will also need a HTML page with JSV and YUI3 present and test cases setup to run *onload*, and which exposes the test runner as *window.JSV*.
(see *examples/schema_validation_file/validate.html*)

## Usage

An example run:

`phantomjs run-jsv-single.js http://localhost/phantomjs-jsv/jsv/examples/schema_validation_file/validate.html?schema=schema-to-run.json&json=api-to-test.json`

## How it works

In a typical use case on a developers machine:

* The developer sets up a test page to host tests for the area of work under development
* The URL to the page is passed as the argument to the script
* PhantomJS loads the page and executes all tests, just as if loaded in a browser
* On completion the results are collected and output in the console

## History

**2012-01-30** First release v0.1

## Contributors

* [Liam Clancy (metafeather)](http://metafeather.net/)

## License

(The MIT License)

Copyright (c) 2011 Michael Kessler

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[MF.net]: http://metafeather.net/
[YUI Test]: http://yuilibrary.com/yui/docs/test/
[PhantomJS]: http://www.phantomjs.org/
[JSV]: https://github.com/garycourt/JSV
[the PhantomJS download section]: http://code.google.com/p/phantomjs/downloads/list
[JUnit]: http://www.junit.org/
[TAP]: http://testanything.org/wiki/index.php/Main_Page
[Hudson]: http://hudson-ci.org/
[Go]: http://www.thoughtworks-studios.com/go-agile-release-management