# Parallax - [View demo](https://ianhan.com/library/parallax)

Library for making parallax animations based on scroll position.

### Basic Usage

Specify attributes to be animated followed by a list of target points that will coincide with the state of the animation.

```html
<div parallax="x:-100,0">
	<h3>X position</h3>
</div>
<div parallax="y:100,0">
	<h3>Y position</h3>
</div>
<div parallax="x:50,0; y:-50,0">
	<h3>Both</h3>
</div>
<div parallax="background-color:#DD5E89,#F7BB97; color:#F7BB97,#DD5E89" parallax-options="in_view:0,1">
	<h3>Colors</h3>
</div>
```

### Multi Step Animations

Additional stages of the animation can be set by supplying more target values.

```html
<div parallax="y:200,0;x:50,0,50,0,50,0,50,0" parallax-options="in_view: 0.1,0.9" >
	<h3>Multi step animation</h3>
</div>
```

### Parallax Options

Additional settings can be specified using the parallax-options property.

```html
<h2 parallax="x:0,555" parallax-options="in_view: 0.1,0.9">Example In View</h2>
```

| Command | Default | Description |
| --- | --- | --- |
| in_view | '0.5,1' | What area of the visible window for the animation to take place |

### Events

The following events are triggered for nodes in Parallax

| Event Name | Action |
| --- | --- |
| parallax/load | Node has been loaded into parallax |
| parallax/update | Node has been updated |