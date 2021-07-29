/**
 * Rename the `componentClass` property of all components to `as` #
 *
 * 2.2 Use SVG Icon instead of Icon font #
 * Icon font has some rendering problems, resulting in blurry icons, font files need to be loaded, and flickering of the content area. For better accessibility, we decided to use SVG Icon first. You need to install @rsuite/icons before using it.
 *
 * npm i @rsuite/icons
 * // for rsuite v4
 * import { Icon } from 'rsuite';
 *
 * return <Icon icon="gear" />;
 *
 * // for rsuite v5
 * import GearIcon from '@rsuite/icons/Gear';
 *
 * return <GearIcon />;
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

  function importLegacyIcon(slug) {
    const newIconName = slug.split("-").map(_.capitalize).join("");
    const NewIcon = j.jsxIdentifier(`Legacy${newIconName}Icon`);
    return j.importDeclaration(
      [j.importDefaultSpecifier(NewIcon)],
      j.stringLiteral(`@rsuite/icons/legacy/${newIconName}`)
    );
  }

  rsuiteImport
    .find(j.ImportSpecifier, {
      imported: {
        name: "Icon",
      },
    })
    .forEach((importIcon) => {
      const importedIcon = importIcon.value;

      let notTransformed = 0;

      root
        .find(j.JSXOpeningElement, {
          name: {
            type: "JSXIdentifier",
            name: importedIcon.local.name,
          },
        })
        .forEach((IconTag) => {
          const { attributes } = IconTag.value;

          // fixme avoid duplications
          const iconAttributeValue = attributes.find(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "icon"
          );

          if (j.StringLiteral.check(iconAttributeValue.value)) {
            // transform <Icon>s whose `icon` prop is string literal
            const iconSlug = iconAttributeValue.value;

            const newIconName = iconSlug.value
              .split("-")
              .map(_.capitalize)
              .join("");
            const NewIcon = j.jsxIdentifier(`Legacy${newIconName}Icon`);

            j(rsuiteImport.paths()[0]).insertAfter(
              j.importDeclaration(
                [j.importDefaultSpecifier(NewIcon)],
                j.stringLiteral(`@rsuite/icons/legacy/${newIconName}`)
              )
            );

            j(IconTag).replaceWith(
              j.jsxOpeningElement(
                NewIcon,
                attributes.filter(
                  (attr) =>
                    !(attr.type === "JSXAttribute" && attr.name.name === "icon")
                ),
                true
              )
            );
          } else if (
            j.JSXExpressionContainer.check(iconAttributeValue.value) &&
            j.ConditionalExpression.check(
              iconAttributeValue.value.expression
            ) &&
            j.StringLiteral.check(
              iconAttributeValue.value.expression.consequent
            ) &&
            j.StringLiteral.check(iconAttributeValue.value.expression.alternate)
          ) {
            // <Icon>s whose `icon` prop is transform Conditional (ternary) operator
            // and both paths are string literals
            // <Icon icon={condition ? 'eye' : 'eye-closed'} />
            const consequentIconSlug =
              iconAttributeValue.value.expression.consequent.value;
            const alternateIconSlug =
              iconAttributeValue.value.expression.alternate.value;

            j(rsuiteImport.paths()[0])
              .insertAfter(importLegacyIcon(consequentIconSlug))
              .insertAfter(importLegacyIcon(alternateIconSlug));
            const parentJSXExpressionContainer = j(IconTag)
              .closest(j.JSXExpressionContainer)
              .paths()[0];
            if (
              parentJSXExpressionContainer &&
              j.JSXElement.check(
                parentJSXExpressionContainer.value.expression
              ) &&
              parentJSXExpressionContainer.value.expression.openingElement ===
                IconTag.value
            ) {
              j(IconTag).replaceWith(
                j.conditionalExpression(
                  iconAttributeValue.value.expression.test,
                  j.jsxElement(
                    j.jsxOpeningElement(
                      j.jsxIdentifier(
                        `Legacy${consequentIconSlug
                          .split("-")
                          .map(_.capitalize)
                          .join("")}Icon`
                      ),
                      attributes.filter(
                        (attr) =>
                          !(
                            attr.type === "JSXAttribute" &&
                            attr.name.name === "icon"
                          )
                      ),
                      true
                    )
                  ),
                  j.jsxElement(
                    j.jsxOpeningElement(
                      j.jsxIdentifier(
                        `Legacy${alternateIconSlug
                          .split("-")
                          .map(_.capitalize)
                          .join("")}Icon`
                      ),
                      attributes.filter(
                        (attr) =>
                          !(
                            attr.type === "JSXAttribute" &&
                            attr.name.name === "icon"
                          )
                      ),
                      true
                    )
                  )
                )
              );
            } else {
              j(IconTag).replaceWith(
                j.jsxExpressionContainer(
                  j.conditionalExpression(
                    iconAttributeValue.value.expression.test,
                    j.jsxElement(
                      j.jsxOpeningElement(
                        j.jsxIdentifier(
                          `Legacy${consequentIconSlug
                            .split("-")
                            .map(_.capitalize)
                            .join("")}Icon`
                        ),
                        attributes.filter(
                          (attr) =>
                            !(
                              attr.type === "JSXAttribute" &&
                              attr.name.name === "icon"
                            )
                        ),
                        true
                      )
                    ),
                    j.jsxElement(
                      j.jsxOpeningElement(
                        j.jsxIdentifier(
                          `Legacy${alternateIconSlug
                            .split("-")
                            .map(_.capitalize)
                            .join("")}Icon`
                        ),
                        attributes.filter(
                          (attr) =>
                            !(
                              attr.type === "JSXAttribute" &&
                              attr.name.name === "icon"
                            )
                        ),
                        true
                      )
                    )
                  )
                )
              );
            }
          } else {
            notTransformed++;
          }
        });

      if (!notTransformed) {
        j(importIcon).remove();
      }
    });

  if (rsuiteImport.find(j.ImportSpecifier).size() < 1) {
    j(rsuiteImport.paths()[0]).remove();
  }
  return root.toSource();
};

module.exports.parser = "tsx";
