# Moick Library for Qwik

## Installation

For install the library, you can use the following command:

```tsx
pnpm add @moick/qwik
```

## Basic Usage

Add `<Toaster />` component to your app and use `toast` function to configure the message or type of your toast.

```tsx
import {Toaster, toast} from '@moick/qwik';

export default () => {
    return (
        <div>
            <Toaster />
            <button onClick$={() => toast('Hello World!')}>Toast</button>
        </div>
    )

}
```
## Types

### Default

The basic type of toast, with a simple message.

```tsx
toast('My first toast')

```
Also you can use the `description` property to add a description to your toast.

```tsx
toast('toast', {
    description: 'My first toast'
})
```

### Success

The success type of toast, with a checkmark icon in front of text.

```tsx
toast.success('My first toast')
```

### Error

The error type of toast, with a error icon in front of text.

```tsx
toast.error('My first toast')
```

### Updating a toast

You can update a toast using the `toast` function with the same id.

```tsx
const toastId = toast('My first toast')

toast('My first toast updated', {
    id: toastId
})
```

## Customization

### Theme

You can customize the theme of your toasts using the `theme` property.

```tsx
<Toaster theme="system" />
```
### Position

You can customize the position of your toasts using the `position` property. By default, the position is `bottom-right`.

```tsx
//available positions: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right

<Toaster position="top-right"/>
```

### Duration

You can customize the duration of your toasts using the `duration` property. By default, the duration is `5000`.

```tsx
<Toaster duration={10000}/>

//or

toast('My first toast', {
    duration: 10000
})
```

### Close Button

You can add a close button to your toasts using the `closeButton` property.

```tsx
<Toaster closeButton />
```

### Expanded

You can activate de expand by default your toasts using the `expanded` property. You can also use the `visibleToasts` property to set the number of visible toasts wich is 3 by default.

```tsx
<Toaster expanded visibleToasts={VisibleToast.five}/>
```

### RichColor

The succes and error types can be more colorful using the `richColor` property.

```tsx
<Toaster richColor />
```

### Styling all toasts

You can style all toasts using the `style` property in the `<Toaster />` component.

```tsx
<Toaster style={{borderRadius: '10px'}} />
```

### Styling a specific toast

You can style a specific toast using the `style` property in the `toast` function.

```tsx
toast('My first toast', {
    style: {borderRadius: '10px'}
})
```

### Custom offset

You can customize the offset of your toasts using the `offset` property. By default, the offset is `32px`.

```tsx
<Toaster offset={50}/>
```

## Keyboard Shortcuts

You can use `Alt + T` to expand the toast. You can customize this shortcut using the `hotKey` property.

```tsx
<Toaster hotKey={['KeyA']}/>
```