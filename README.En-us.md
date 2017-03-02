##NEXSO SmartMap

###Description
---
SmartMap is a simple-to-use tool for visualizing, analyzing, and layering geographic-based data. Users choose from among dozens of social, economic, and environmental indicators, drawn from publicly available data sources, to create customized and detailed maps.

The information available in SmartMap is based on official data published by national and international agencies referenced. The policy adopted to define administrative limits does not reflect any official position of the IDB Group and the MIF. 
The results of the analysis should be considered purely indicative and reference in any way be used in critical situations or emergencies. NEXSO SmartMap team welcomes any comments, observations or suggestions regarding the information contained in this application and its functionalities.

###Application Architecture
---
Smartmap is a Modular MVC application based in Backbonejs and JQuery on the client and ESRI ArcGis on the server.

Client

- /js - Main app
- /ja/component - App modules
- /ja/component/smartmap-ui - Main UI container application


Server

The application consumes remote geo-data service from a public server at the IDB. To configure the service refer to /js/config/config.js

Warning:

>The current service is temporary offline. 

Remember:

>Smartmap is designed to be embedded in other applications. So, you can reuse separately the modules used in smartmap-ui.

###Go beyond, make it social open source
---
Reason why we are opening the source code ....

###Development Requirements
---

- NodeJS
- grunt-cli (Needs to be installed globally, see: https://github.com/gruntjs/grunt-cli#grunt-cli-)
- Sass CSS Importer ( $ gem install --pre sass-css-importer )
- Compass ($ gem install compass)
- Browser-Sync

###Getting Started
---

Navigate to `cd js/components/smartmap-ui`:
- `npm install`
- `grunt init --force` (installs bower deps for you, stop the process once is listening with Ctrl +c)
- `grunt build`

Navigate to the root directory of your application:
- `npm install`
- `grunt init --force` (installs bower deps for you)
- `grunt build`

Open terminal and execute a http server

- `browser-sync start --server --files "css/*.css"`

Voila!! You are all set and running.

Remember:

> Every time you need to fully rebuild the project run `grunt build` in the smartmap-ui directory and once completed run `grunt build` in the app root.

###Development
---
During development, you must run the watch task both in the smartmap-ui directory and in the root.
- `grunt watch` in the root directory
- `grunt watch --force` in the smartmap-ui directory (to bypass linting errors during dev)
- instead of using --force, you could also add `"debug": true` to the `smartmap-ui/.jshintrc` file

Run application 

At the root directory

###Quality Analysis
---

The IDB made a third party quality assessment of this code in order to inform to the comunity issues to resolve. This code is rated as XXXX. It means, it requires a load work prior to be a production code grade. 

###How to Contribute
---

Please refer to Contributing file in this repository.

###To do's
---

We identify several points to improve Smartmap.

1. Change the map engine.
2. Fix bugs.
3. Implement social media sharing
4. Implement save my map.
5. Update libraries.
6. Improve documentation in the code.
7. Improve code performance.



###License
---

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


###Authors
IADB

- Jairo Anaya @jairoanaya

ESRI

- Josh Petterson @jpeterson

- Allison Sizer @Alison Sizer

Flipside

- Olaf Verman 

- Ricardo Saavedra


Sinapsis Innovation

- Cristian Agudelo @crstn210

###Other Links

http://server.arcgis.com/en/

http://www.nexso.org/smartmap
