/**
 * Transform Alert calls to toaster
 *
 * // for rsuite v4
 * Alert.info('description');
 *
 * // for rsutie v5
 * toaster.push(<Message type="info" closable>description</Message>);
 * // Remove message
 * const key = toaster.push(
 *  <Message type="info" closable>
 *    description
 *  </Message>
 * );
 * toaster.remove(key);
 *
 * // Clear all messages
 * toaster.clear();
 */
"use strict";

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

  rsuiteImport
    .find(j.ImportSpecifier, {
      imported: {
        name: "Alert",
      },
    })
    .forEach((alertImport) => {
      const importedAlert = alertImport.value;

      const alertCalls = root.find(j.CallExpression, {
        callee: {
          object: {
            name: importedAlert.local.name,
          },
        },
      });

      // replace import { Alert } with { toaster }

      const toaster = j.identifier("toaster");
      const Message = j.jsxIdentifier("Message");

      const toasterImport = j(alertImport).replaceWith(
        j.importSpecifier(toaster)
      );

      if (
        rsuiteImport
          .find(j.ImportSpecifier, {
            imported: {
              name: "Message",
            },
          })
          .size() < 1
      ) {
        toasterImport.insertAfter(j.importSpecifier(Message));
      }

      // replace Alert[type].(message) with toaster.push(<Message type={type} showIcon closable>{message}</Message>)
      alertCalls.forEach((call) => {
        const alertType = call.value.callee.property.name;

        const alertMessage = call.value.arguments[0];

        const alertDuration = call.value.arguments[1];

        const messageAttributes = [
          j.jsxAttribute(j.jsxIdentifier("type"), j.stringLiteral(alertType)),
          j.jsxAttribute(j.jsxIdentifier("showIcon")),
          j.jsxAttribute(j.jsxIdentifier("closable")),
        ];

        if (alertDuration) {
          messageAttributes.push(
            j.jsxAttribute(
              j.jsxIdentifier("duration"),
              j.jsxExpressionContainer(alertDuration)
            )
          );
        }

        j(call).replaceWith(
          j.callExpression(j.memberExpression(toaster, j.identifier("push")), [
            j.jsxElement(
              j.jsxOpeningElement(Message, messageAttributes),
              j.jsxClosingElement(Message),
              [
                j.StringLiteral.check(alertMessage)
                  ? j.jsxText(alertMessage.value)
                  : j.jsxExpressionContainer(alertMessage),
              ]
            ),
          ])
        );
      });
    });
  return root.toSource();
};

module.exports.parser = "tsx";
