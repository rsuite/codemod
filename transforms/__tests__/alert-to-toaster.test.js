"use strict";

const defineTest = require("jscodeshift/dist/testUtils").defineTest;

defineTest(__dirname, "alert-to-toaster", null, "no-rsuite-import");
defineTest(
  __dirname,
  "alert-to-toaster",
  null,
  "alert-to-toaster/alert-content-literal"
);
defineTest(
  __dirname,
  "alert-to-toaster",
  null,
  "alert-to-toaster/alert-content-expression"
);

defineTest(
  __dirname,
  "alert-to-toaster",
  null,
  "alert-to-toaster/alert-duration"
);
