"use strict";

const defineTest = require("jscodeshift/dist/testUtils").defineTest;

defineTest(__dirname, "show-to-open", null, "no-rsuite-import");
defineTest(__dirname, "show-to-open", null, "show-to-open/show-to-open");
