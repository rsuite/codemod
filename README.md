## rsuite-codemod

[![GitHub Actions](https://github.com/rsuite/codemod/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/rsuite/codemod/actions?query=branch%3Amaster+workflow%3A%22Node.js+CI%22)
[![codecov](https://codecov.io/gh/rsuite/codemod/branch/master/graph/badge.svg)](https://codecov.io/gh/rsuite/codemod)

This repository contains a collection of codemod scripts for use with
[JSCodeshift](https://github.com/facebook/jscodeshift) that help update React
APIs.

### Usage

`npx rsuite-codemod <transform> <path> [...options]`

- `transform` - name of transform, see available transforms below.
- `path` - files or directory to transform
- use the `--dry` option for a dry-run and use `--print` to print the output for comparison

This will start an interactive wizard, and then run the specified transform.

### Included Transforms

#### `alert-to-toaster`

Transform `Alert` calls to `toaster`

```jsx
// for rsuite v4
Alert.info("description");

// for rsutie v5
toaster.push(
  <Message type="info" showIcon closable>
    description
  </Message>
);
```

#### `notification-to-toaster`

Transform `Notification` calls to `toaster`

https://rsuitejs.com/guide/v5-features/#refactor-notification

```jsx
// for rsuite v4
Notification.info({
  title: "info",
  description: "description",
  duration: 4500,
  placement: "topStart",
});

// for rsuite v5
toaster.push(
  <Notification type="info" header="info" duration={4500} closable>
    description
  </Notification>,
  { placement: "topStart" }
);
```

#### `rename-form-components`

https://next.rsuitejs.com/guide/v5-features/#2-6-rename-form-related-components

- `<FormGroup>` was renamed to `<Form.Group>`
- `<FormControl>` was renamed to `<Form.Control>`
- `<ControlLabel>` was renamed to `<Form.ControlLabel>`
- `<ErrorMessage>` was renamed to `<Form.ErrorMessage>`
- `<HelpBlock>` was renamed to `<Form.HelpText>`

#### `icons-standalone`

Transform legacy `<Icon>` component to new `@rsuite/icons` components.

https://next.rsuitejs.com/guide/v5-features/#2-2-use-svg-icon-instead-of-icon-font

```jsx
// before
import { Icon } from "rsuite";

return <Icon icon="gear" />;

// after
import LegacyGearIcon from "@rsuite/icons/legacy/Gear";

return <LegacyGearIcon />;
```

##### Limitations

This transform only takes effect on `<Icon>`s whose `icon` props are string literals

```jsx
// This won't be transformed
<Icon icon={variable} />
```

#### `componentclass-to-as`

https://next.rsuitejs.com/guide/v5-features/#2-7-rename-the-code-component-class-property-of-all-components-to-code-as

```jsx
// before
return <Button componentClass="span" />;

// after
return <Button as="span" />;
```

### jscodeshift options

To pass more options directly to jscodeshift, use `--jscodeshift="..."`. For example:

```sh
npx rsuite-codemod --jscodeshift="--run-in-band --verbose=2"
```

See all available options [here](https://github.com/facebook/jscodeshift#usage-cli).

### Recast Options

Options to [recast](https://github.com/benjamn/recast)'s printer can be provided
through jscodeshift's `printOptions` command line argument

```sh
npx rsuite-codemod <transform> <path> --jscodeshift="--printOptions='{\"quote\":\"double\"}'"
```

#### `explicit-require=false`

If you're not explicitly importing React in your files (eg: if you're loading React with a script tag), you should add `--explicit-require=false`.

### Support and Contributing

The scripts in this repository are provided in the hope that they are useful,
but they are not officially maintained, and we generally will not fix
community-reported issues. They are a collection of scripts that were previously
used internally within Facebook or were contributed by the community, and we
rely on community contributions to fix any issues discovered or make any
improvements. If you want to contribute, you're welcome to submit a pull
request.

### Credits

rsuite-codemod has been constructed based on codebase from [react-codemod](https://github.com/reactjs/react-codemod) by Facebook.

### License

rsuite-codemod is [MIT licensed](./LICENSE).
