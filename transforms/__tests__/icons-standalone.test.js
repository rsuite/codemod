"use strict";

const defineTest = require("jscodeshift/dist/testUtils").defineTest;

defineTest(
  __dirname,
  "icons-standalone",
  null,
  "icons-standalone/legacy-icons"
);
defineTest(
  __dirname,
  "icons-standalone",
  null,
  "icons-standalone/legacy-icons-size-prop"
);

defineTest(
  __dirname,
  "icons-standalone",
  null,
  "icons-standalone/legacy-icons-ternary"
);
defineTest(
  __dirname,
  "icons-standalone",
  null,
  "icons-standalone/legacy-icons-ternary-expression"
);
defineTest(
  __dirname,
  "icons-standalone",
  null,
  "icons-standalone/legacy-icons-ternary-return"
);
