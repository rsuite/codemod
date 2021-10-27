/**
 * Transform Notification calls to toaster
 *
 * // for rsuite v4
 * Notification.info({
 *   title: 'info',
 *   description: 'description',
 *   duration: 4500,
 *   placement: 'topStart'
 * });
 *
 * // for rsuite v5
 * toaster.push(
 *   <Notification type="info" header="info" duration={4500}>
 *     description
 *   </Notification>,
 *   { placement: 'topStart' }
 * );
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
        name: "Notification",
      },
    })
    .forEach((notificationImport) => {
      const importedNotification = notificationImport.value;

      const notificationCalls = root.find(j.CallExpression, {
        callee: {
          object: {
            name: importedNotification.local.name,
          },
        },
      });

      // replace import { Notification } with { toaster, Notification }

      const toaster = j.identifier("toaster");
      const Notification = j.jsxIdentifier("Notification");

      if (
        rsuiteImport
          .find(j.ImportSpecifier, {
            imported: {
              name: "toaster",
            },
          })
          .size() < 1
      ) {
        j(notificationImport).insertBefore(j.importSpecifier(toaster));
      }

      // replace
      // Notification[type].({
      //   title,
      //   description,
      //   duration,
      //   placement
      // })
      // with
      // toaster.push(
      //   <Notification type={type} header={title} duration={duration} closable>
      //     {description}
      //   </Notification>,
      //  { placement }
      // )
      notificationCalls.forEach((call) => {
        const notificationType = call.value.callee.property.name;

        const notificationTitle = call.value.arguments[0].properties.find(
          (p) => p.key.name === "title"
        );
        const notificationDescription = call.value.arguments[0].properties.find(
          (p) => p.key.name === "description"
        );
        const notificationDuration = call.value.arguments[0].properties.find(
          (p) => p.key.name === "duration"
        );

        const notificationPlacement = call.value.arguments[0].properties.find(
          (p) => p.key.name === "placement"
        );

        const notificationAttributes = [
          j.jsxAttribute(
            j.jsxIdentifier("type"),
            j.stringLiteral(notificationType)
          ),
        ];

        if (notificationTitle) {
          notificationAttributes.push(
            j.jsxAttribute(
              j.jsxIdentifier("header"),
              j.StringLiteral.check(notificationTitle.value)
                ? notificationTitle.value
                : j.jsxExpressionContainer(notificationTitle.value)
            )
          );
        }

        if (notificationDuration) {
          notificationAttributes.push(
            j.jsxAttribute(
              j.jsxIdentifier("duration"),
              j.jsxExpressionContainer(notificationDuration.value)
            )
          );
        }

        notificationAttributes.push(
          j.jsxAttribute(j.jsxIdentifier("closable"))
        );

        const toasterCallArguments = [
          j.jsxElement(
            j.jsxOpeningElement(Notification, notificationAttributes),
            j.jsxClosingElement(Notification),
            [
              j.StringLiteral.check(notificationDescription.value)
                ? j.jsxText(notificationDescription.value.value)
                : j.jsxExpressionContainer(notificationDescription.value),
            ]
          ),
        ];

        if (notificationPlacement) {
          toasterCallArguments.push(
            j.objectExpression([
              j.objectProperty(
                j.identifier("placement"),
                notificationPlacement.value
              ),
            ])
          );
        }

        j(call).replaceWith(
          j.callExpression(
            j.memberExpression(toaster, j.identifier("push")),
            toasterCallArguments
          )
        );
      });
    });
  return root.toSource();
};

module.exports.parser = "tsx";
