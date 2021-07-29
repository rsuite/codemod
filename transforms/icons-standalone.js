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

      const legacyIconSet = new Set();

      root
        .find(j.JSXOpeningElement, {
          name: {
            type: "JSXIdentifier",
            name: importedIcon.local.name,
          },
        })
        .forEach((IconTag) => {
          const { attributes } = IconTag.value;

          const iconAttributeValue = attributes.find(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "icon"
          );

          /** @type {import('jscodeshift').JSXAttribute} */
          const iconSizeAttributeValue = attributes.find(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "size"
          );

          let fontSize;

          if (iconSizeAttributeValue) {
            const size = iconSizeAttributeValue.value.value;

            fontSize = {
              lg: "1.3333em",
              "2x": "2em",
              "3x": "3em",
              "4x": "4em",
              "5x": "5em",
            }[size];
          }

          const newIconAttributes = attributes.filter(
            (attr) =>
              !(attr.type === "JSXAttribute" && attr.name.name === "icon") &&
              !(attr.type === "JSXAttribute" && attr.name.name === "size")
          );

          if (fontSize) {
            newIconAttributes.push(
              j.jsxAttribute(
                j.jsxIdentifier("style"),
                j.jsxExpressionContainer(
                  j.objectExpression([
                    j.objectProperty(
                      j.identifier("fontSize"),
                      j.stringLiteral(fontSize)
                    ),
                  ])
                )
              )
            );
          }

          if (j.StringLiteral.check(iconAttributeValue.value)) {
            // transform <Icon>s whose `icon` prop is string literal
            const iconSlug = iconAttributeValue.value;

            legacyIconSet.add(iconSlug.value);

            const newIconName = iconSlug.value
              .split("-")
              .map(_.capitalize)
              .join("");
            const NewIcon = j.jsxIdentifier(`Legacy${newIconName}Icon`);

            j(IconTag).replaceWith(
              j.jsxOpeningElement(NewIcon, newIconAttributes, true)
            );
          } else if (
            // <Icon>s whose `icon` prop is Conditional (ternary) operator
            // and both paths are string literals
            // <Icon icon={condition ? 'eye' : 'eye-closed'} />
            j.JSXExpressionContainer.check(iconAttributeValue.value) &&
            j.ConditionalExpression.check(
              iconAttributeValue.value.expression
            ) &&
            j.StringLiteral.check(
              iconAttributeValue.value.expression.consequent
            ) &&
            j.StringLiteral.check(iconAttributeValue.value.expression.alternate)
          ) {
            const consequentIconSlug =
              iconAttributeValue.value.expression.consequent.value;
            const alternateIconSlug =
              iconAttributeValue.value.expression.alternate.value;

            legacyIconSet.add(consequentIconSlug);
            legacyIconSet.add(alternateIconSlug);

            const IconElementPath = IconTag.parentPath;

            const isReturned = j.ReturnStatement.check(
              IconElementPath.parentPath.value
            );

            const isInsideExpressionContainer = j.JSXExpressionContainer.check(
              IconElementPath.parentPath.value
            );
            if (isReturned || isInsideExpressionContainer) {
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
                      newIconAttributes,
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
                      newIconAttributes,
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
                        newIconAttributes,
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
                        newIconAttributes,
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

      for (const legacyIconSlug of Array.from(legacyIconSet).reverse()) {
        const newIconName = legacyIconSlug
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
      }

      if (!notTransformed) {
        j(importIcon).remove();
      }
    });

  if (rsuiteImport.find(j.ImportSpecifier).size() < 1) {
    j(rsuiteImport.paths()[0]).remove();
  }
  return root.toSource({
    reuseWhitespace: false,
  });
};

module.exports.parser = "tsx";
