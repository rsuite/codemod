"use strict";

const defineTest = require("jscodeshift/dist/testUtils").defineTest;

defineTest(__dirname, "componentclass-to-as", null, "no-rsuite-import");
defineTest(
  __dirname,
  "componentclass-to-as",
  null,
  "componentclass-to-as/componentclass-to-as"
);
defineTest(
  __dirname,
  "componentclass-to-as",
  null,
  "componentclass-to-as/componentclass-to-as-member"
);
