/**
 * Rename show/hide props of some components to open/close
 * @see https://rsuitejs.com/guide/v5-features/#use-code-open-close-code-instead-of-code-show-hide-code
 */

"use strict";

const _ = require("lodash");

const componentsNeedsChange = {
  Drawer: {
    show: "open",
    onShow: "onOpen",
    onHide: "onClose",
  },
  Modal: {
    show: "open",
    onShow: "onOpen",
    onHide: "onClose",
  },
  Whisper: {
    delayShow: "delayOpen",
    delayHide: "delayClose",
  },
};

/**
 * @type {import('jscodeshift').Transform}
 */
module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find `componentClass` attribute on components that is imported from rsuite
  // or that is member of a component imported from rsuite, e.g. Dropdown.Item

  const rsuiteImport = root.find(j.ImportDeclaration, {
    source: {
      type: "StringLiteral",
      value: "rsuite",
    },
  });

  rsuiteImport.find(j.ImportSpecifier).forEach((specifierPath) => {
    // Match identifiers imported from rsuite
    const {
      local: { name: componentName },
    } = specifierPath.value;

    if (componentName in componentsNeedsChange) {
      const propsNeedsChange = componentsNeedsChange[componentName];

      Object.entries(propsNeedsChange).forEach(([oldPropName, newPropName]) => {
        root
          .find(j.JSXOpeningElement, (openingElement) => {
            return _.isMatch(openingElement, {
              name: {
                type: "JSXIdentifier",
                name: componentName,
              },
            });
          })
          .find(j.JSXAttribute, {
            name: {
              type: "JSXIdentifier",
              name: oldPropName,
            },
          })
          .forEach((path) => {
            j(path.get("name")).replaceWith(j.jsxIdentifier(newPropName));
          });
      });
    }
  });
  return root.toSource();
};

module.exports.parser = "tsx";
