/**
 * Rename the `componentClass` property of all components to `as` #
 *
 *  // for rsuite v4
 * return <Button componentClass="span" />;
 *
 * // for rsuite v5
 * return <Button as="span" />;
 */
"use strict";

const _ = require("lodash");

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

    root
      .find(j.JSXOpeningElement, (openingElement) => {
        return (
          _.isMatch(openingElement, {
            name: {
              type: "JSXIdentifier",
              name: componentName,
            },
          }) ||
          _.isMatch(openingElement, {
            name: {
              type: "JSXMemberExpression",
              object: {
                type: "JSXIdentifier",
                name: componentName,
              },
            },
          })
        );
      })
      .find(j.JSXAttribute, {
        name: {
          type: "JSXIdentifier",
          name: "componentClass",
        },
      })
      .forEach((path) => {
        j(path.get("name")).replaceWith(j.jsxIdentifier("as"));
      });
  });
  return root.toSource();
};

module.exports.parser = "tsx";
