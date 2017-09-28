# README

Tablet Ninjas is an application built to interest users in helping 
machines learn how to identify ancient cuneifrom writing.
The user drags the characters shown on the bottom to match
the characters on the tablet's image.
With everything provided and in order, the process is smooth
and will even spark an interest in ancient history!

Tablet Ninjas is built using the Polymer Starter Kit v1.

The following README takes elements from the [Polymer Starter Kit](https://github.com/PolymerElements/polymer-starter-kit) 
with modified instructions for Tablet Ninjas written by Rebekah Fowles.

## Information About the Polymer Starter Kit

[![Build Status](https://travis-ci.org/PolymerElements/polymer-starter-kit.svg?branch=master)](https://travis-ci.org/PolymerElements/polymer-starter-kit)

This template is a starting point for building apps using a drawer-based
layout. The layout is provided by `app-layout` elements.

This template, along with the `polymer-cli` toolchain, also demonstrates use
of the "PRPL pattern" This pattern allows fast first delivery and interaction with
the content at the initial route requested by the user, along with fast subsequent
navigation by pre-caching the remaining components required by the app and
progressively loading them on-demand as the user navigates through the app.

The PRPL pattern, in a nutshell:

* **Push** components required for the initial route
* **Render** initial route ASAP
* **Pre-cache** components for remaining routes
* **Lazy-load** and progressively upgrade next routes on-demand

### Setup

##### Install the Polymer Client

First, install [Polymer CLI](https://github.com/Polymer/polymer-cli) using
[npm](https://www.npmjs.com) (we assume you have pre-installed [node.js](https://nodejs.org)).

    npm install -g polymer-cli

##### Clone project from repository

Navigate to wherever you wish to store the project on your local machine. 
It doesn't need to be anywhere in particular.

    git clone https://github.com/bmackley/tabletninjas.git
    cd tabletninjas

##### Install Bower

	bower install

Bower will install all the components found in `bower.json`. 
It will create the `bower_components` directory which is absolutely VITAL to the project. 
This directory will not get saved to the repository when pushed. (See the `.gitignore` file.)

##### Install Node.js

	npm install

This will create the `node_modules` directory. It is also exempted in the `.gitignore` file.

### Start the development server

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app:

    polymer serve --open

NOTE: Due to some bug in the Polymer Starter Kit's code, 
the default location is `http://127.0.0.1:8081/components/polymer-starter-kit/`.
Don't be alarmed. Just follow the link back home or change the URL yourself.

### Build

This command performs HTML, CSS, and JS minification on the application
dependencies, and generates a service-worker.js file with code to pre-cache the
dependencies based on the entrypoint and fragments specified in `polymer.json`.
The minified files are output to the `build/unbundled` folder, and are suitable
for serving from a HTTP/2+Push compatible server.

In addition the command also creates a fallback `build/bundled` folder,
generated using fragment bundling, suitable for serving from non
H2/push-compatible servers or to clients that do not support H2/Push.

    polymer build

### Preview the build

This command serves the minified version of the app at `http://localhost:8080`
in an unbundled state, as it would be served by a push-compatible server:

    polymer serve build/unbundled

This command serves the minified version of the app at `http://localhost:8080`
generated using fragment bundling:

    polymer serve build/bundled

### Run tests

This command will run [Web Component Tester](https://github.com/Polymer/web-component-tester)
against the browsers currently installed on your machine:

    polymer test

### Adding a new view

You can extend the app by adding more views that will be demand-loaded
e.g. based on the route, or to progressively render non-critical sections of the
application. Each new demand-loaded fragment should be added to the list of
`fragments` in the included `polymer.json` file. This will ensure those
components and their dependencies are added to the list of pre-cached components
and will be included in the `bundled` build.

Don't forget to add additional views in the `src/my-app.html` under the `iron-selector` 
type and `iron-pages` type. For other elements, make sure to include them wherever they 
need to go by importing them using the `link` HTML type. 