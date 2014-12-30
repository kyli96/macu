var express = require('express'),
    core = require('./core'),
    genies = require('./genies');

core().start();

genies().start();