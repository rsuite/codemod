"use strict";

const defineTest = require("jscodeshift/dist/testUtils").defineTest;

defineTest(__dirname, "notification-to-toaster", null, "no-rsuite-import");
defineTest(
  __dirname,
  "notification-to-toaster",
  null,
  "notification-to-toaster/notification-type"
);
defineTest(
  __dirname,
  "notification-to-toaster",
  null,
  "notification-to-toaster/notification-description-expression"
);
defineTest(
  __dirname,
  "notification-to-toaster",
  null,
  "notification-to-toaster/existing-toaster"
);
