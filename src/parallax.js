function mapBetween(currentNum, minAllowed, maxAllowed, min, max) {
  return (maxAllowed - minAllowed) * (currentNum- min) / (max - min) + minAllowed;
}

let nodes = [],
	last_call = false,
	opts = {},
	events = {},
	throttle = 5;

const event_names = ['parallax/load', 'parallax/update'];
for(ev in event_names){
	let event = document.createEvent('Event');
	event.initEvent(event_names[ev], true, true);
	events[event_names[ev]] = event;
}

function add(selector, options){
	let _nodes = document.querySelectorAll(selector);
	_nodes = Array.prototype.slice.call(_nodes)
	for(i in _nodes) load(_nodes[i], options)
	nodes = nodes.concat(_nodes)
}

// Sets up initial classes on nodes
function load(node, options){

	node.parallax = {
		properties: [],
		in_view: [0, 1],
		offset: 20
	}

	if(node.attributes['parallax-options']){
		let settings = node.attributes['parallax-options'] ? extract_settings(node.attributes['parallax-options'].nodeValue) : {};
		for(setting in settings){
			node.parallax[setting] = settings[setting]
		}
	}

	if(node.attributes['parallax']){
		let settings = node.attributes['parallax'] ? extract_settings(node.attributes['parallax'].nodeValue, true) : {};
		for(setting in settings){
			node.parallax.properties.push({
				property: setting,
				values: settings[setting]
			})
		}
	}

	if(options){
		for(opt in options){
			node.parallax[opt] = options[opt]
		}
	}

	node.dispatchEvent(events['parallax/load'])

}

function update(node){

	const top = node.offsetTop + node.offsetHeight;
	let animation_state = 1 - ((1 / (node.parallax.visible_bottom - node.parallax.visible_top)) * (top - node.parallax.visible_top));
	if(animation_state > 1) animation_state = 1;
	if(animation_state < 0) animation_state = 0;

	let styles = {x: 0, y: 0};

	for(property_name in node.parallax.properties){
		let prop = node.parallax.properties[property_name]
		let value;
		if(animation_state === 0){
			value = prop.values[0]
		} else if(animation_state === 1) {
			value = prop.values[prop.values.length - 1]
		} else {
			if(['color'].indexOf(prop.property) !== -1){
				value = color_value_by_range(animation_state, prop.values)
			} else {
				value = numeric_value_by_range(animation_state, prop.values)
			}
		}
		styles[prop.property] = value
	}

	let style_string = '';
	let transform_string = '';

	if(styles.color){
		style_string += 'color:rgb('+styles.color.r+','+styles.color.g+','+styles.color.b+');';
	}

	if(styles.x || styles.y){
		transform_string += 'translate('+styles.x+'px,'+styles.y+'px)';
	}

	for(style_name in styles){
		if(['y','x','color'].indexOf(style_name) !== -1) continue;
		if(['scale','rotate'].indexOf(style_name) !== -1) {
			transform_string += ' '+style_name+'('+styles[style_name]+')';
		} else {
			style_string += style_name+':'+styles[style_name]+';';
		}
	}

	if(transform_string){
		style_string += 'transform:'+transform_string+';'
	}


	node.style = style_string;

	node.dispatchEvent(events['parallax/update'])

}

function update_all(){
	const now = Date.now();
	if(last_call && now - last_call < throttle) return;
	last_call = now;
	const visible = visible_area()
	for(i in nodes) {
		if(is_in_view(nodes[i], visible)) update(nodes[i])
	}
}

// Extracts setting values
function extract_settings(string, property){
	let settings = {};
	if(!string) return settings;
	string.split(';').forEach(function(setting){
		let arr = setting.trim().split(':')
		if(!arr[0]) return;
		let key = arr[0].trim();
		let value = arr[1] ? arr[1].trim() : true;
		if(['offset'].indexOf(key) !== -1) value = parseInt(value)
		if(['in_view'].indexOf(key) !== -1) value = value.split(',').map(function(value){ return parseFloat(value) })
		if(property){
			value = value.split(',').map(function(value){ return ['color'].indexOf(key) !== -1 ? hexToRgb(value) : parseFloat(value) })
		}
		settings[key] = arr[1] ? value : true
	});
	return settings;
}

// Calculate a numeric value by array of numbers
function numeric_value_by_range(value, range){
	let adjusted_value = value;
	let prev = 0;
	let next = 1;
	if(range.length > 2){
		const block = 1 / range.length;
		for(i in range){
			i = parseInt(i);
			let perc = block * i
			if(perc > value){
				break;
			} else if(i > 0) {
				prev = i - 1
				next = i
			}
		}
		if(range.length == 4){
			value = (value - ((next) * block)) / block;
		}
	}
	let abs = Math.abs(range[next] - range[prev]);
	
	return abs - (abs * value)
}

// Calculate a color value by array of numbers
function color_value_by_range(value, range){
	return {
		r: parseInt(numeric_value_by_range(value, range.map(function(color){ return color.r }))), 
		g: parseInt(numeric_value_by_range(value, range.map(function(color){ return color.g }))), 
		b: parseInt(numeric_value_by_range(value, range.map(function(color){ return color.b })))
	};
}

// Convert hex to rgb object
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Is element within window bounds
function is_in_view(node, visible){
	node.parallax.visible_bottom = visible.bottom + (node.parallax.in_view[1] * visible.height) - visible.height;
	node.parallax.visible_top = visible.top + (node.parallax.in_view[0] * visible.height);
	return (node.offsetTop + node.parallax.offset) <= node.parallax.visible_bottom && (node.offsetTop + node.offsetHeight + node.parallax.offset) >= node.parallax.visible_top;
}

// Get visible area in window
function visible_area(){
	let y = parseInt(window.pageYOffset);
	let height = parseInt(window.innerHeight);
	return {top: y, bottom: y + height, height: height}
}

function bind(){
	window.addEventListener('scroll', update_all)
	window.addEventListener('resize', update_all)
	window.setTimeout(function(){
		let event = document.createEvent("Event");
		event.initEvent("scroll", false, true); 
		if(window.pageXOffset == 0) window.dispatchEvent(event);
	}, 60)
}

function init(){
	add('[parallax]');
	bind();
	update_all();
}

module.exports = {
	init: init,
	add: add
};