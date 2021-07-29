## rsuite-codemod [![Build Status](https://travis-ci.org/reactjs/rsuite-codemod.svg)](https://travis-ci.org/reactjs/rsuite-codemod)

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
  <Message type="info" closable>
    description
  </Message>
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

### Explanation of the new ES2015 class transform with property initializers

1. Determine if mixins are convertible. We only transform a `createClass` call to an ES6 class component when:

- There are no mixins on the class, or
- `options['pure-component']` is true, the `mixins` property is an array and it _only_ contains pure render mixin (the specific module name can be specified using `options['mixin-module-name']`, which defaults to `react-addons-pure-render-mixin`)

2. Ignore components that:

- Call deprecated APIs. This is very defensive, if the script finds any identifiers called `isMounted`, `getDOMNode`, `replaceProps`, `replaceState` or `setProps` it will skip the component
- Explicitly call `this.getInitialState()` and/or `this.getDefaultProps()` since an ES6 class component will no longer have these methods
- Use `arguments` in methods since arrow functions don't have `arguments`. Also please notice that `arguments` should be [very carefully used](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments) and it's generally better to switch to spread (`...args`) instead
- Have inconvertible `getInitialState()`. Specifically if you have variable declarations like `var props = ...` and the right hand side is not `this.props` then we can't inline the state initialization in the `constructor` due to variable shadowing issues
- Have non-primitive right hand side values (like `foo: getStuff()`) in the class spec

3. Transform it to an ES6 class component
1. Replace `var A = React.createClass(spec)` with `class A extends React.Component {spec}`. If a component uses pure render mixin and passes the mixins test (as described above), it will extend `React.PureComponent` instead

   - Remove the `require`/`import` statement that imports pure render mixin when it's no longer being referenced

1. Pull out all statics defined on `statics` plus the few special cased statics like `childContextTypes`, `contextTypes`, `displayName`, `getDefaultProps()`, and `propTypes` and transform them to `static` properties (`static propTypes = {...};`)

   - If `getDefaultProps()` is simple (i.e. it only contains a return statement that returns something) it will be converted to a simple assignment (`static defaultProps = ...;`). Otherwise an IIFE (immediately-invoked function expression) will be created (`static defaultProps = function() { ... }();`). Note that this means that the function will be executed only a single time per app-lifetime. In practice this hasn't caused any issues — `getDefaultProps` should not contain any side-effects

1. Transform `getInitialState()`

   - If there's no `getInitialState()` or the `getInitialState()` function is simple (i.e., it only contains a return statement that returns something) then we don't need a constructor; `state` will be lifted to a property initializer (`state = ...;`)
     - However, if the RHS of `return` contains references to `this` other than `this.props` and/or `this.context`, we can't be sure about what you'll need from `this`. We need to ensure that our property initializers' evaluation order is safe, so we defer `state`'s initialization by moving it all the way down until all other property initializers have been initialized
   - If `getInitialState()` is not simple, we create a `constructor` and convert `getInitialState()` to an assignment to `this.state`
     - `constructor` always have `props` as the first parameter
     - We only put `context` as the second parameter when (one of) the following things happen in `getInitialState()`:
       - It accesses `this.context`, or
       - There's a direct method call `this.x()`, or
       - `this` is referenced alone
     - Rewrite accesses to `this.props` to `props` and accesses to `this.context` to `context` since the values will be passed as `constructor` arguments
       - Remove _simple_ variable declarations like `var props = this.props;` and `var context = this.context`
     - Rewrite top-level return statements (`return {...};`) to `this.state = {...}`
       - Add `return;` after the assignment when the return statement is part of a control flow statement (not a direct child of `getInitialState()`'s body) and not in an inner function declaration

1. Transform all non-lifecycle methods and fields to class property initializers (like `onClick = () => {};`). All your Flow annotations will be preserved

   - It's actually not necessary to transform all methods to arrow functions (i.e., to bind them), but this behavior is the same as `createClass()` and we can make sure that we won't accidentally break stuff

1. Generate Flow annotations from `propTypes` and put it on the class (this only happens when there's `/* @flow */` in your code and `options['flow']` is `true`)

- Flow actually understands `propTypes` in `createClass` calls but not ES6 class components. Here the transformation logic is identical to [how](https://github.com/facebook/flow/blob/master/src/typing/statement.ml#L3526) Flow treats `propTypes`
- Notice that Flow treats an optional propType as non-nullable
  - For example, `foo: React.PropTypes.number` is valid when you pass `{}`, `{foo: null}`, or `{foo: undefined}` as props at **runtime**. However, when Flow infers type from a `createClass` call, only `{}` and `{foo: undefined}` are valid; `{foo: null}` is not. Thus the equivalent type annotation in Flow is actually `{foo?: number}`. The question mark on the left hand side indicates `{}` and `{foo: undefined}` are fine, but when `foo` is present it must be a `number`
- For `propTypes` fields that can't be recognized by Flow, `$FlowFixMe` will be used

5. `React.createClass` is no longer present in React 16. So, if a `createClass` call cannot be converted to a plain class, the script will fallback to using the `create-react-class` package.

- Replaces `React.createClass` with `ReactCreateClass`.
- Adds a `require` or `import` statement for `create-react-class`. The import style is inferred from the import style of the `react` import. The default module name can be overridden with the `--create-class-module-name` option.
- Prunes the `react` import if there are no more references to it.

#### Usage

```bash
npx rsuite-codemod class <path>
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

rsuite-codemod has been constructed based on codebase from [rsuite-codemod](https://github.com/reactjs/rsuite-codemod) by Facebook.

### License

rsuite-codemod is [MIT licensed](./LICENSE).
