https://github.com/diecodev/qwik-sonner/assets/51871681/e7a7e4a6-c422-44b2-af7e-1dcb66e1dc19

# qwik-sonner

An opinionated toast component for qwik.
Based on [emilkowalski](https://github.com/emilkowalski)'s React [implementation](https://sonner.emilkowal.ski/).

> [!NOTE]
> This readme was created using the svelte-sonner readme as template

> [!IMPORTANT]
> Due to the resumability handled by Qwik, the `<Toaster />` component should be positioned at the beginning of where you want to use it. This way, you won't encounter [rendering issues.](https://github.com/diecodev/qwik-sonner/issues/13)

## Quick start

Install it:

```bash
npm i qwik-sonner
# or
yarn add qwik-sonner
# or
pnpm add qwik-sonner
# or
bun add qwik-sonner
```

Add `<Toaster />` to your app, it will be the place where all your toasts will be rendered. After that, you can use `toast()` from anywhere in your app.

```jsx
import { Toaster, toast } from "qwik-sonner";

export const QwikComponent = component$(() => {
  return (
    <div>
      <Toaster />
      <button onClick$={() => toast("My first toast")}>Give me a toast</button>
    </div>
  );
});
```

## Types

### Default

Most basic toast. You can customize it (and any other type) by passing an options object as the second argument.

```js
toast("Event has been created");
```

With custom icon and description:

```js
import Icon from "./Icon.tsx";

toast("Event has been created", {
  description: "Monday, January 3rd at 6:00pm",
  icon: Icon,
});
```

### Success

Renders a checkmark icon in front of the message.

```js
toast.success("Event has been created");
```

### Info

Renders a question mark icon in front of the message.

```js
toast.info("Event has new information");
```

### Warning

Renders a warning icon in front of the message.

```js
toast.warning("Event has warning");
```

### Error

Renders an error icon in front of the message.

```js
toast.error("Event has not been created");
```

### Action

Renders a button.

```js
toast("Event has been created", {
  action: {
    label: "Undo",
    onClick: $(() => console.log("Undo")),
  },
});
```

> [!CAUTION]
> You must import the dollar sign when passing a onClick function.

### Promise

Starts in a loading state and will update automatically after the promise resolves or fails.

```js
toast.promise(() => new Promise((resolve) => setTimeout(resolve, 2000)), {
  loading: "Loading",
  success: "Success",
  error: "Error",
});
```

You can pass a function to the success/error messages to incorporate the result/error of the promise.

```js
toast.promise(promise, {
  loading: "Loading...",
  success: (data) => {
    return `${data.name} has been added!`;
  },
  error: "Error",
});
```

### Custom Component

You can pass a component as the first argument instead of a string to render custom component while maintaining default styling. You can use the headless version below for a custom, unstyled toast.

```js
toast(<div>My custom toast</div>);
```

### Updating a toast

You can update a toast by using the `toast` function and passing it the id of the toast you want to update, the rest stays the same.

```js
const toastId = toast("Sonner");

toast.success("Toast has been updated", {
  id: toastId,
});
```

## Customization

### Headless

You can use `toast.custom` to render an unstyled toast with custom component while maintaining the functionality.

```tsx
toast.custom((t) => (
  <div>
    <h1>Custom toast</h1>
     <button onClick={$(() => toast.dismiss(t))}>Dismiss</button>
  </div>
```

### Theme

You can change the theme using the `theme` prop. Default theme is light.

```tsx
<Toaster theme="dark" />
```

### Position

You can change the position through the `position` prop on the `<Toaster />` component. Default is `bottom-right`.

```tsx
// Available positions
// top-left, top-center, top-right, bottom-left, bottom-center, bottom-right

<Toaster position="top-center" />
```

### Expanded

Toasts can also be expanded by default through the `expand` prop. You can also change the amount of visible toasts which is 3 by default.

```tsx
<Toaster expand visibleToasts={9} />
```

### Styling for all toasts

You can style your toasts globally with the `toastOptions` prop in the `Toaster` component.

```tsx
<Toaster
  toastOptions={{
    style: "background: red;",
    class: "my-toast",
    descriptionClass: "my-toast-description",
  }}
/>
```

### Styling for individual toast

```js
toast("Event has been created", {
  style: "background: red;",
  class: "my-toast",
  descriptionClass: "my-toast-description",
});
```

### Close button

Add a close button to all toasts that shows on hover by adding the `closeButton` prop.

```tsx
<Toaster closeButton />
```

### Rich colors

You can make error and success state more colorful by adding the `richColors` prop.

```tsx
<Toaster richColors />
```

### Custom offset

Offset from the edges of the screen.

```tsx
<Toaster offset="80px" />
```

### Programmatically remove toast

To remove a toast programmatically use `toast.dismiss(id)`.

```js
const toastId = toast("Event has been created");

toast.dismiss(toastId);
```

You can also dismiss all toasts at once by calling `toast.dismiss()` without an id.

```js
toast.dismiss();
```

### Duration

You can change the duration of each toast by using the `duration` property, or change the duration of all toasts like this:

```tsx
<Toaster duration={10000} />
```

```js
toast("Event has been created", {
  duration: 10000,
});

// Persisent toast
toast("Event has been created", {
  duration: Number.POSITIVE_INFINITY,
});
```

### On Close Callback

You can pass `onDismiss` and `onAutoClose` callbacks. `onDismiss` gets fired when either the close button gets clicked or the toast is swiped. `onAutoClose` fires when the toast disappears automatically after it's timeout (`duration` prop).

```js
toast("Event has been created", {
  onDismiss: $((t) => console.log(`Toast with id ${t.id} has been dismissed`)),
  onAutoClose: $((t) =>
    console.log(`Toast with id ${t.id} has been closed automatically`)
  ),
});
```

## Keyboard focus

You can focus on the toast area by pressing ⌥/alt + T. You can override it by providing an array of `event.code` values for each key.

```tsx
<Toaster hotkey={["KeyC"]} />
```

## License

MIT
