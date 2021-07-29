/**
 * FormGroup was renamed to Form.Group
 * FormControl was renamed to Form.Control
 * ControlLabel was renamed to Form.ControlLabel
 * ErrorMessage was renamed to Form.ErrorMessage
 * HelpBlock was renamed to Form.HelpText
 *
 * @see https://next.rsuitejs.com/guide/v5-features/#2-6-rename-form-related-components
 */
"use strict";

const _ = require("lodash");

/**
 * @type {import('jscodeshift').Transform}
 */
module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  const rsuiteImport = root
    .find(j.ImportDeclaration, {
      source: {
        type: "StringLiteral",
        value: "rsuite",
      },
    })
    .at(0);

  const componentRenameMap = {
    FormGroup: "Group",
    FormControl: "Control",
    ControlLabel: "ControlLabel",
    ErrorMessage: "ErrorMessage",
    HelpBlock: "HelpText",
  };

  const oldComponentNames = Object.getOwnPropertyNames(componentRenameMap);

  // If old component name exists, remove the import and add <Form> import if not existing
  rsuiteImport
    .find(j.ImportSpecifier, (specifier) => {
      return oldComponentNames.includes(specifier.imported.name);
    })
    .forEach((fromImport, index) => {
      if (
        index === 0 &&
        rsuiteImport
          .find(j.ImportSpecifier, {
            imported: {
              name: "Form",
            },
          })
          .size() < 1
      ) {
        j(fromImport).insertBefore(j.importSpecifier(j.identifier("Form")));
      }

      const NewComponent = j.jsxMemberExpression(
        j.jsxIdentifier("Form"),
        j.jsxIdentifier(componentRenameMap[fromImport.value.imported.name])
      );

      root
        .find(j.JSXOpeningElement, {
          name: {
            type: "JSXIdentifier",
            name: fromImport.value.local.name,
          },
        })
        .forEach((openingTag) => {
          j(openingTag).replaceWith(
            j.jsxOpeningElement(
              NewComponent,
              openingTag.value.attributes,
              openingTag.value.selfClosing
            )
          );
        });

      root
        .find(j.JSXClosingElement, {
          name: {
            type: "JSXIdentifier",
            name: fromImport.value.local.name,
          },
        })
        .forEach((closingTag) => {
          j(closingTag).replaceWith(j.jsxClosingElement(NewComponent));
        });

      j(fromImport).remove();
    });

  return root.toSource();
};

module.exports.parser = "tsx";
