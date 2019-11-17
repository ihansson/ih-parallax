const Parallax = {
	prefix: 'parallax',
	throttle: 10,
	last_call: false,
	nodes: false,
	init: function(context){
		this.nodes = context.querySelectorAll('['+this.prefix+']');
		if(!this.nodes) return;
		this.scroll = this.scroll.bind(this)
		this.resize = this.resize.bind(this)
		window.addEventListener('scroll', this.scroll)
		window.addEventListener('resize', this.resize)
		window.setTimeout(function(){
			let event = document.createEvent("Event");
			event.initEvent("scroll", false, true); 
			if(window.pageXOffset == 0) window.dispatchEvent(event);
		}, 60)
		return this
	},
	scroll: function(){
		this.add_parallax_styles()
	},
	resize: function(){
		this.add_parallax_styles()
	},
	add_parallax_styles: function(){
		const now = Date.now();
		if(this.last_call && now - this.last_call < this.throttle) return;
		this.last_call = now;
		const visible_area = this.get_visible_area()
		this.nodes.forEach(function(node){

			const property = node.attributes[this.prefix+'-property'].nodeValue

			const values = node.attributes[this.prefix+'-values'].nodeValue.split(',').map(value => parseFloat(value))
			const zones = node.attributes[this.prefix+'-zones'].nodeValue.split(',').map(value => parseFloat(value))

			const start_zone = (zones[0] * visible_area.height) + visible_area.top;
			const end_zone = (zones[1] * visible_area.height) + visible_area.top;

			const top = node.offsetTop;

			const animation_state = (1 / (end_zone - start_zone)) * (top - start_zone);

			if(animation_state > 1) return;
			if(animation_state < 0) return;

			const animation_value = ((values[1] - values[0]) * animation_state) + values[0];

			if(property == 'y'){
				node.style["transform"] = "translateY("+animation_value+"px)";
			}

		}.bind(this));
	},
	get_visible_area: function(){
		return {top: window.pageYOffset, bottom: window.pageYOffset + window.innerHeight, height: window.innerHeight}
	}
}

Object.create(Parallax).init(document.querySelector('body'))

function mapBetween(currentNum, minAllowed, maxAllowed, min, max) {
  return (maxAllowed - minAllowed) * (currentNum- min) / (max - min) + minAllowed;
}

let nodes = [],
	last_call = false,
	opts = {},
	events = {};

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
console.log(nodes)
}

function load(node, options){
	console.log(node)
}

function update(){

}

// Is element within window bounds
function is_in_view(node, visible){
	let bottom = visible.bottom + (node.aiv.in_view[1] * visible.height) - visible.height;
	let top = visible.top + (node.aiv.in_view[0] * visible.height);
	return (node.offsetTop + node.aiv.offset) <= bottom && (node.offsetTop + node.offsetHeight + node.aiv.offset) >= top;
}

// Get visible area in window
function visible_area(){
	let y = parseInt(window.pageYOffset);
	let height = parseInt(window.innerHeight);
	return {top: y, bottom: y + height, height: height}
}

function bind(){
	window.addEventListener('scroll', update)
	window.addEventListener('resize', update)
	window.setTimeout(function(){
		let event = document.createEvent("Event");
		event.initEvent("scroll", false, true); 
		if(window.pageXOffset == 0) window.dispatchEvent(event);
	}, 60)
}

function init(){
	add('[parallax]');
	bind();
}

module.exports = {
	init: init,
	add: add
};