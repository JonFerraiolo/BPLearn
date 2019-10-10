define([
	'../../util/elem',
	'../../util/cls',
	'text!./Ecosystem_Model_Form.html',
	'text!./PersonForm.html',
	'../../util/removeAccidentalWhitespace'
], function(
	elem,
	cls,
	Ecosystem_Model_Form_html,
	PersonForm_html,
	removeAccidentalWhitespace
) {
	var defaultRings = [ 
		{ name: 'Inner Circle' },
		{ name: 'Department' },
		{ name: 'Division' },
		{ name: 'Company' },
		{ name: 'Industry' },
		{ name: 'Public' }
	];
	var sqrtThree = Math.sqrt(3);
	var colors = ['darkviolet', 'darkolivegreen', 'darkblue', 'darkred', 'darkcyan', 'darkorange', 'darkturquoise', 'darkgoldenrod', 'darksalmon', 'skyblue' ];
	var nColors = colors.length;

	var makeCircle = function(parentNode, fillColor, strokeColor, className, radius) {
		var span = elem('span');
		span.className = className;
		span.style.backgroundColor = fillColor;
		span.style.borderColor = strokeColor;
		span.style.height = span.style.width = (radius*2)+'px';
		parentNode.appendChild(span);
	};

	return {
		/**
		 * Initialize an Ecosystem_Model form
		 * @param {object} workbookView The workbookView that will be parent of the form
		 * @param {Element} parentNode The element into which the form should be stuffed as innerHTML
		 */
		init: function(workbookView, parentNode) {
			this.workbookView = workbookView;
			this.model = workbookView.model;
			this.parentNode = parentNode;
			parentNode.innerHTML = removeAccidentalWhitespace(Ecosystem_Model_Form_html);
			this.Ecosystem_Model_Rings_DIV = parentNode.querySelector('.Ecosystem_Model_Rings_DIV');
			this.Ecosystem_Model_Triangle_DIV = parentNode.querySelector('.Ecosystem_Model_Triangle_DIV');
			this.Ecosystem_Model_People_TD = parentNode.querySelector('.Ecosystem_Model_People_TD');
			this.Ecosystem_Model_Body = parentNode.querySelector('.Ecosystem_Model_Body');
			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var formData = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']') || this.model.newSheet(workbookId, sheetType);
			this.updateFormFields(parentNode, formData);
		},

		/**
		 * Update the form fields to contain data passed as the second parameter.
		 * @param {Element} parentNode Parent node for all of the TEXTAREA elements
		 * @param {object} Object containing the data to stuff into the TEXTAREA elements
		 */
		updateFormFields: function(parentNode, formData) {
			this.showingRingIndex = null;
			this.showingChildIndex = null;

			this._updateGraphics(formData);
			this._updateInputArea(formData);
		},

		/**
		 * Update the form fields to contain data passed as the second parameter.
		 * @param {Element} parentNode Parent node for all of the TEXTAREA elements
		 * @param {object} Object containing the data to stuff into the TEXTAREA elements
		 */
		_updateGraphics: function(formData) {
			this._updateTriangle(formData);
			this._updateRings(formData);
		},

		_updateTriangle: function(formData) {
			this.Ecosystem_Model_Triangle_DIV.innerHTML = '';

			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var rings = (formData && formData._rings) ||
					this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings') || defaultRings;
			var nRings = rings.length;
			var nSections = nRings + 1;

			// Rings and Triangle are basically defined on a square (0->100)
			// To make triangle fill tightly into region, shrink top/bottom of viewBox
			var viewBox = '0 0 160 100';
			var preserveAspectRatio = 'xMidYMin';	
			var triangleCircleRadius = 1.5;
			var triangleCircleGap = 2;
			var triangleCircleYAdjust = -5.5;

			var svgTriangle = elem('svg:svg', {
				attrs: {
					'class': 'Ecosystem_Model_Triangle_SVG', 
					viewBox: viewBox,
					preserveAspectRatio: preserveAspectRatio
				}
			}, this.Ecosystem_Model_Triangle_DIV);
			var Ecosystem_Model_Triangle_Arrow_Marker_Left = elem('svg:marker', {
				attrs: {
					id: 'Ecosystem_Model_Triangle_Arrow_Marker_Left',
					viewBox: "0 0 10 10",
					refX: "8",
					refY: "5",
					markerWidth: "6",
					markerHeight: "6",
					orient:60
				}
			}, svgTriangle);
			var Ecosystem_Model_Triangle_Arrow_Path = elem('svg:path', { attrs: { d: "M 0 0 L 10 5 L 0 10 z" }}, Ecosystem_Model_Triangle_Arrow_Marker_Left);

			// Draw the triangle
			var width = 106;
			var height = width * sqrtThree / 2;	// formula for equilateral triangle
			var left = 12, right = left + width, top = 2, bottom = top + height, 
				center = (left+right)/2, halfWidth = width/2;
			for (var i=0; i<nRings; i++) {
				var g = elem('svg:g', {}, svgTriangle);
				var ring = rings[i];
				var dy = height/nSections * (i+1);
				var dx = halfWidth/nSections * (i+1);
				var l = center - dx;
				var r = center + dx;
				var y = bottom - dy;
				var line = elem('svg:line', {
					attrs: {
						'class': 'Ecosystem_Model_Triangle_Line', 
						x1:l, y1:y, x2:r, y2:y
					},
					styles: {
						fill: 'none',
						stroke: colors[i % nColors]
					}
				}, g);
				var yLabel = bottom - dy - 3.5;
				var label = elem('svg:text', {
					attrs: {
						'class': 'Ecosystem_Model_Triangle_Ring_Label', 
						x:center,
						y:yLabel 
					},
					styles: {
						fill: colors[i % nColors]
					},
					children: ring.name
				}, g);
				if (ring.children) {
					var x = center - (triangleCircleRadius * ring.children.length + 
							triangleCircleGap * (ring.children.length - 1)) / 2;
					for (var j=0; j<ring.children.length; j++) {
						var influencer = (ring.children && ring.children[j] && ring.children[j].influencer) || '';
						elem('svg:circle', {
							attrs: {
								'class': 'Ecosystem_Model_Triangle_Circle', 
								cx: x,
								cy: yLabel + triangleCircleYAdjust,
								r: triangleCircleRadius
							},
							styles: {
								fill: colors[i % nColors]
							}
						}, g);
						x += triangleCircleRadius + triangleCircleGap;
					}
				}
			}
			var perimeter =  elem('svg:path', { 
				attrs: { 
					'class': 'Ecosystem_Model_Triangle_Perimeter', 
					d:'M'+center+','+bottom + 'L'+right+','+top + 'L'+left+','+top + 'z'
				}
			}, svgTriangle);
			var me =  elem('svg:text', { 
				attrs: { 
					'class': 'Ecosystem_Model_Triangle_Me', 
					x:center,
					y:bottom-6
				},
				children: 'ME'
			}, svgTriangle);
			var arrows = elem('svg:g', { attrs: { 'class': 'Ecosystem_Model_Triangle_Arrows' }}, svgTriangle);
			this._drawArrow(arrows, 'Left', 'Path of Reference', 16, width, height, left, right, top, bottom, center, halfWidth);
			this._drawArrow(arrows, 'Right', 'Path of Communication', 20, width, height, left, right, top, bottom, center, halfWidth);
		},

		_drawArrow: function(container, side, label, whiteOutYOffset, width, height, left, right, top, bottom, center, halfWidth) {
			var positiveNegative = side == 'Left' ? -1 : 1;
			var arrowOffset = 9;
			var Ecosystem_Model_Triangle_Arrow_Marker = elem('svg:marker', {
				attrs: {
					id: 'Ecosystem_Model_Triangle_Arrow_Marker_'+side,
					viewBox: "0 0 10 10",
					refX: "8",
					refY: "5",
					markerWidth: "6",
					markerHeight: "6",
					orient:-1*positiveNegative*60
				}
			}, container);
			var Ecosystem_Model_Triangle_Arrow_Path = elem('svg:path', { attrs: { d: "M 0 0 L 10 5 L 0 10 z" }}, Ecosystem_Model_Triangle_Arrow_Marker);
			var x1 = center + (positiveNegative*arrowOffset), y1 = bottom, y2 = top+3, x2 = x1+(positiveNegative*(y1-y2)/sqrtThree);
			var rightArrow = elem('svg:line', {
				attrs: {
					'class': 'Ecosystem_Model_Triangle_Arrow',
					x1: x1, 
					y1: y1, 
					x2: x2, 
					y2: y2
				},
				styles: {
					strokeLinecap: "butt",
					markerStart: side=='Left' ? 'url(#Ecosystem_Model_Triangle_Arrow_Marker_'+side+')' : '',
					markerEnd: side=='Right' ? 'url(#Ecosystem_Model_Triangle_Arrow_Marker_'+side+')' : ''
				}
			}, container);
			var xMid = (x1+x2)/2, yMid = (y1+y2)/2;
			var y1w = yMid - whiteOutYOffset, y2w = yMid + whiteOutYOffset;
			var x1w = xMid + positiveNegative*whiteOutYOffset/sqrtThree, x2w = xMid + (-1*positiveNegative*whiteOutYOffset/sqrtThree);
			var rightWhiteOut = elem('svg:line', {
				attrs: {
					'class': 'Ecosystem_Model_Triangle_Arrow_White_Out',
					x1: x1w, 
					y1: y1w, 
					x2: x2w, 
					y2: y2w
				},
				styles: {
					strokeLinecap: "butt"
				}
			}, container);
			var rightLabel = elem('svg:text', {
				attrs: {
					'class': 'Ecosystem_Model_Triangle_Arrow_Text',
					transform: 'translate('+(xMid+positiveNegative*1.5)+','+(yMid+1.5/sqrtThree)+') rotate('+(-1*positiveNegative*60)+')'
				},
				children: label
			}, container);
		},


		_updateRings: function(formData) {
			this.Ecosystem_Model_Rings_DIV.innerHTML = '';

			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var rings = (formData && formData._rings) ||
					this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings') || defaultRings;
			var nRings = rings.length;
			var nSections = nRings + 1;

			// Rings and Triangle are basically defined on a square (0->100)
			// To make triangle fill tightly into region, shrink top/bottom of viewBox
			var viewBox = '0 0 160 100';
			var preserveAspectRatio = 'xMidYMin';

			var svgRings = elem('svg:svg', {
				attrs: { 
					'class': 'Ecosystem_Model_Rings_SVG', 
					viewBox: viewBox,
					preserveAspectRatio: preserveAspectRatio
				}
			}, this.Ecosystem_Model_Rings_DIV);

			// Draw the rings
			var cx = 129;
			var cy = 79;
			var outerMostRadius = 20;
			for (var i=0; i<nRings; i++) {
				var g = elem('svg:g', {}, svgRings);
				var ring = rings[i];
				r = (outerMostRadius/nSections) * (i+1);
				var c =  elem('svg:circle', { 
					attrs: { 
						'class': 'Ecosystem_Model_Rings_Interior_Ring',
						cx: cx,
						cy: cy,
						r: r
					},
					styles: {
						stroke: colors[i % nColors]
					}
				}, g);
/*Karen doesn't want this
				var yLabel = cy - r  -.75;
				var label = elem('svg:text', {
					attrs: {
						'class': 'Ecosystem_Model_Rings_Ring_Label', 
						x: cx,
						y: yLabel 
					},
					styles: {
						fill: colors[i % nColors]
					},
					children: ring.name
				}, g);
*/
			}
			var c =  elem('svg:circle', { 
				attrs: { 
					'class': 'Ecosystem_Model_Rings_Perimeter',
					cx: cx,
					cy: cy,
					r: outerMostRadius
				}
			}, svgRings);
			var me =  elem('svg:text', { 
				attrs: { 
					'class': 'Ecosystem_Model_Rings_Me', 
					x: cx,
					y: cy + 1.5
				},
				children: 'ME'
			}, svgRings);
		},


		/**
		 * Update the form fields to contain data passed as the second parameter.
		 * @param {Element} parentNode Parent node for all of the TEXTAREA elements
		 * @param {object} Object containing the data to stuff into the TEXTAREA elements
		 */
		_updateInputArea: function(formData) {

			var ringNameChanged = function(i, e) {
				e.preventDefault();
				e.stopPropagation();
				var ringNodes = this.Ecosystem_Model_People_TD.querySelectorAll('.Ecosystem_Model_People_Ring');
				var ringNode = ringNodes[i];
				var ringNameNode = ringNode.querySelector('.Ecosystem_Model_Ring_Name');
				var modifiedRings = JSON.parse(JSON.stringify(rings));
				var ring = modifiedRings[i];
				ring.name = ringNameNode.value;
				var workbookId = this.model.currentWorkbookId();
				var sheetType = this.model.currentSheetType(workbookId);
				var sheetId = this.model.currentSheetId(workbookId, sheetType);
				this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings', modifiedRings);
				this._updateGraphics();
			};

			this.Ecosystem_Model_People_TD.innerHTML = '';

			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var rings = (formData && formData._rings) ||
					this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings') || defaultRings;

			// Redraw the input area
			var circleRadius = 6;
			this.Ecosystem_Model_People_TD.innerHTML = '';
			var Ecosystem_Model_People_Rings = elem('div', { attrs:{ 'class': 'Ecosystem_Model_People_Rings' }}, this.Ecosystem_Model_People_TD);
			var Ecosystem_Model_People_Label_DIV = elem('div', { attrs:{ 'class': 'Ecosystem_Model_People_Label_DIV' }}, Ecosystem_Model_People_Rings);
			var Ecosystem_Model_People_Label = elem('span', { attrs:{ 'class': 'Ecosystem_Model_People_Label' }, children: 'Groups (in reverse order vs triangle):'}, Ecosystem_Model_People_Label_DIV);
			for (var i=0; i<rings.length; i++) {
				var ring = rings[i];
				var Ecosystem_Model_People_Ring = elem('div', { attrs:{ 'class': 'Ecosystem_Model_People_Ring' }}, Ecosystem_Model_People_Rings);
				this._createAddRing(Ecosystem_Model_People_Ring, formData);
				var Ecosystem_Model_People_Ring_Name_DIV = elem('div', { attrs:{ 'class': 'Ecosystem_Model_People_Ring_Name_DIV' }}, Ecosystem_Model_People_Ring);
				var input = elem('input', {
					attrs: { 
						'class': 'Ecosystem_Model_Ring_Name',
						value: ring.name
					},
					styles: {
						color: colors[i % nColors],
						borderColor:  colors[i % nColors]
					},
					events: {
						change: ringNameChanged.bind(this, i),
						keyup: ringNameChanged.bind(this, i),
						focus: function(Ecosystem_Model_People_Ring_Name_DIV, e) {
							e.stopPropagation();
							var Ecosystem_Model_Ring_Delete = Ecosystem_Model_People_Ring_Name_DIV.querySelector('.Ecosystem_Model_Ring_Delete');
							cls.add(Ecosystem_Model_Ring_Delete, 'Ecosystem_Model_Ring_Delete_Visible_1');
							cls.add(Ecosystem_Model_Ring_Delete, 'Ecosystem_Model_Ring_Delete_Visible_2');
							cls.add(this.Ecosystem_Model_Body, 'Ecosystem_Model_Body_No_Add_Ring');
						}.bind(this, Ecosystem_Model_People_Ring_Name_DIV),
						blur: function(Ecosystem_Model_People_Ring_Name_DIV, e) {
							e.stopPropagation();
							var Ecosystem_Model_Ring_Delete = Ecosystem_Model_People_Ring_Name_DIV.querySelector('.Ecosystem_Model_Ring_Delete');
							cls.remove(Ecosystem_Model_Ring_Delete, 'Ecosystem_Model_Ring_Delete_Visible_1');
							cls.remove(this.Ecosystem_Model_Body, 'Ecosystem_Model_Body_No_Add_Ring');
							// Delay changing visibility so that click event will get to delete icon
							// On Chrome, sometimes short timeouts don't work
							setTimeout(function(e) {
								cls.remove(Ecosystem_Model_Ring_Delete, 'Ecosystem_Model_Ring_Delete_Visible_2');
							}, 1000);
						}.bind(this, Ecosystem_Model_People_Ring_Name_DIV)
					}
				}, Ecosystem_Model_People_Ring_Name_DIV);
				var Ecosystem_Model_Ring_Delete = elem('a', {
					attrs:{ 
						'class': 'Ecosystem_Model_Ring_Delete',
						href: ''
					},
					events: {
						click: function(e) {
							//FIXME: are you sure prompt
							var node = e.target;
							var ringNode = null;
							while (node && node.tagName != 'BODY') {
								if (cls.has(node, 'Ecosystem_Model_People_Ring')) {
									ringNode = node;
									break;
								} else {
									node = node.parentNode;
								}
							}
							var ringNodes = Ecosystem_Model_People_Rings.querySelectorAll('.Ecosystem_Model_People_Ring');
							var ringIndex = null;
							for (var i=0; i<ringNodes.length; i++) {
								if (ringNodes[i] == ringNode) {
									ringIndex = i;
								}
							}
							if (typeof ringIndex == 'number') {
								var modifiedRings = JSON.parse(JSON.stringify(rings));	// clone
								modifiedRings.splice(ringIndex, 1);
								var workbookId = this.model.currentWorkbookId();
								var sheetType = this.model.currentSheetType(workbookId);
								var sheetId = this.model.currentSheetId(workbookId, sheetType);
								this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings', modifiedRings);
								this._updateGraphics();
								this._updateInputArea();
							}
						}.bind(this)
					}
				}, Ecosystem_Model_People_Ring_Name_DIV);
				var Ecosystem_Model_People_Ring_Children_DIV = elem('div', { attrs:{ 'class': 'Ecosystem_Model_People_Ring_Children_DIV' }}, Ecosystem_Model_People_Ring);
				var Ecosystem_Model_People_Ring_Children_Label_DIV = elem('div', { 
					attrs:{ 'class': 'Ecosystem_Model_People_Ring_Children_Label_DIV' },
					children: 'Influencers:'
				}, Ecosystem_Model_People_Ring_Children_DIV);
				if (ring.children) {
					for (var j=0; j<ring.children.length; j++) {
						var influencer = (ring.children[j] && ring.children[j].influencer) || '';
						var Ecosystem_Model_Child_DIV = elem('div', { attrs:{ 'class': 'Ecosystem_Model_Child_DIV' } }, Ecosystem_Model_People_Ring_Children_DIV);
						makeCircle(Ecosystem_Model_Child_DIV, colors[i % nColors], 'none', 'Ecosystem_Model_Circle', circleRadius)
						var Ecosystem_Model_People_Child = elem('span', { attrs:{ 'class': 'Ecosystem_Model_People_Child' }, children: influencer }, Ecosystem_Model_Child_DIV);
					}
				}
				var newChildSPAN = elem('span', { attrs:{ 'class': 'Ecosystem_Model_Child_DIV Ecosystem_Model_New_Child_SPAN' } }, Ecosystem_Model_People_Ring_Children_DIV);
				makeCircle(newChildSPAN, 'none', colors[i % nColors], 'Ecosystem_Model_Circle Ecosystem_Model_Circle_New', circleRadius);
				var newChild = elem('span', {
					attrs:{ 'class': 'Ecosystem_Model_New_Child' }, 
					styles:{ borderColor: colors[i % nColors] }, 
					children: 'New...' 
				}, newChildSPAN);
				var Ecosystem_Model_Add_Above_ME = elem('div', { attrs:{ 'class': 'Ecosystem_Model_Add_Above_ME' }}, Ecosystem_Model_People_Ring);
				var Ecosystem_Model_People_Form_DIV = elem('div', { attrs:{ 'class': 'Ecosystem_Model_People_Form_DIV' }}, Ecosystem_Model_People_Ring);
			}
			this._createAddRing(Ecosystem_Model_People_Rings, formData);
			Ecosystem_Model_People_Rings.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				var eventChildSpan = undefined;
				var node = e.target;
				while (node && node.tagName != 'BODY') {
					if (cls.has(node, 'Ecosystem_Model_Child_DIV')) {
						eventChildSpan = node;
						break;
					} else {
						node = node.parentNode;
					}
				}
				if (eventChildSpan) {
					var ringNode = undefined;
					var node = eventChildSpan;
					while (node && node.tagName != 'BODY') {
						if (cls.has(node, 'Ecosystem_Model_People_Ring')) {
							ringNode = node;
							break;
						} else {
							node = node.parentNode;
						}
					}
					if (ringNode) {
						var ringNodes = Ecosystem_Model_People_Rings.querySelectorAll('.Ecosystem_Model_People_Ring');
						var nRings = ringNodes.length;
						var ringIndex = null;
						for (var i=0; i<nRings; i++) {
							if (ringNodes[i] == ringNode) {
								ringIndex = i;
								break;
							}
						}
						if (typeof ringIndex == 'number') {
							var childNodes = ringNode.querySelectorAll('.Ecosystem_Model_Child_DIV');
							var childIndex = null;
							for (var j=0; j<childNodes.length; j++) {
								if (childNodes[j] == eventChildSpan) {
									childIndex = j;
									break;
								}
							}
							if (typeof childIndex == 'number') {
								var closePersonForm = function() {
									var Ecosystem_Model_People_Forms = this.parentNode.querySelectorAll('.Ecosystem_Model_People_Form');
									for (var i=0; i<Ecosystem_Model_People_Forms.length; i++) {
										var node = Ecosystem_Model_People_Forms[i];
										node.parentNode.removeChild(node);
									}
								};
								closePersonForm.bind(this)();
								var Ecosystem_Model_Child_DIV_Selecteds = this.parentNode.querySelectorAll('.Ecosystem_Model_Child_DIV_Selected');
								for (var i=0; i<Ecosystem_Model_Child_DIV_Selecteds.length; i++) {
									var node = Ecosystem_Model_Child_DIV_Selecteds[i];
									cls.remove(node, 'Ecosystem_Model_Child_DIV_Selected');
								}
								if (this.showingRingIndex === ringIndex && this.showingChildIndex === childIndex) {
									// Toggle off the currently showing form
									this.showingRingIndex = null;
									this.showingChildIndex = null;
									return;
								}
								this.showingRingIndex = ringIndex;
								this.showingChildIndex = childIndex;
								cls.add(eventChildSpan, 'Ecosystem_Model_Child_DIV_Selected');
								var Ecosystem_Model_People_Form_DIV = ringNode.querySelector('.Ecosystem_Model_People_Form_DIV');
								Ecosystem_Model_People_Form_DIV.innerHTML = PersonForm_html;
								var ring = rings[ringIndex];
								var child = ring.children && ring.children[childIndex];
								Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Influencer').value = (child && child.influencer) || '';
								Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Rating').value = (child && child.rating) || '';
								Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Challenge').value = (child && child.challenge) || '';
								Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Goal').value = (child && child.goal) || '';
								var valueChanged = function(e) {
									e.preventDefault();
									e.stopPropagation();
									var influencer = Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Influencer').value;
									var rating = Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Rating').value;
									var challenge = Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Challenge').value;
									var goal = Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Goal').value;
									var modifiedRings = JSON.parse(JSON.stringify(rings));	// clone
									var modifiedRing = modifiedRings[this.showingRingIndex]
									if (!modifiedRing.children) {
										modifiedRing.children = [];
									}
									modifiedRing.children[this.showingChildIndex] = {
										influencer: influencer,
										rating: rating,
										challenge: challenge,
										goal: goal
									};
									var workbookId = this.model.currentWorkbookId();
									var sheetType = this.model.currentSheetType(workbookId);
									var sheetId = this.model.currentSheetId(workbookId, sheetType);
									this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings', modifiedRings);
									rings = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings');
								};
								Ecosystem_Model_People_Form_DIV.addEventListener('click', function() {
									e.stopPropagation();
								}, false);
								Ecosystem_Model_People_Form_DIV.addEventListener('change', valueChanged.bind(this), false);
								Ecosystem_Model_People_Form_DIV.addEventListener('blue', valueChanged.bind(this), false);
								Ecosystem_Model_People_Form_DIV.addEventListener('keyup', valueChanged.bind(this), false);
								var Ecosystem_Model_Person_Table_Close_BUTTON = Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Table_Close_BUTTON');
								Ecosystem_Model_Person_Table_Close_BUTTON.addEventListener('click', function(e) {
									e.preventDefault();
									e.stopPropagation();
									closePersonForm.bind(this)();
									var formData = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']');
									this.updateFormFields(this.parentNode, formData);
								}.bind(this), false);
								var Ecosystem_Model_Person_Delete = Ecosystem_Model_People_Form_DIV.querySelector('.Ecosystem_Model_Person_Delete');
								Ecosystem_Model_Person_Delete.addEventListener('click', function(e) {
									e.preventDefault();
									e.stopPropagation();
									//FIXME: are you sure prompt
									var modifiedRings = JSON.parse(JSON.stringify(rings));	// clone
									var modifiedRing = modifiedRings[this.showingRingIndex]
									modifiedRing.children.splice(this.showingChildIndex, 1);
									var workbookId = this.model.currentWorkbookId();
									var sheetType = this.model.currentSheetType(workbookId);
									var sheetId = this.model.currentSheetId(workbookId, sheetType);
									this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings', modifiedRings);
									var formData = this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']');
									this.updateFormFields(this.parentNode, formData);
								}.bind(this), false);
							}
						}
					}
				}
			}.bind(this), false);
		},

		_createAddRing: function(Ecosystem_Model_People_Ring, formData) {
			var workbookId = this.model.currentWorkbookId();
			var sheetType = this.model.currentSheetType(workbookId);
			var sheetId = this.model.currentSheetId(workbookId, sheetType);
			var rings = (formData && formData._rings) ||
					this.model.get('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings') || defaultRings;
			var Ecosystem_Model_People_Add_Ring_DIV = elem('div', { attrs:{ 'class': 'Ecosystem_Model_People_Add_Ring_DIV' }}, Ecosystem_Model_People_Ring);
			var Ecosystem_Model_People_Add_Ring = elem('span', { 
				attrs: { 'class': 'Ecosystem_Model_People_Add_Ring' },
				events: {
					click: function(e) {
						e.preventDefault();
						e.stopPropagation();
						//FIXME: factor this out - used in at least a couple of places
						var node = e.target;
						var addRingNode = null;
						while (node && node.tagName != 'BODY') {
							if (cls.has(node, 'Ecosystem_Model_People_Add_Ring')) {
								addRingNode = node;
								break;
							} else {
								node = node.parentNode;
							}
						}
						var Ecosystem_Model_People_Rings = this.Ecosystem_Model_Body.querySelector('.Ecosystem_Model_People_Rings');
						var addRingNodes = Ecosystem_Model_People_Rings.querySelectorAll('.Ecosystem_Model_People_Add_Ring');
						var ringIndex = null;
						for (var i=0; i<addRingNodes.length; i++) {
							if (addRingNodes[i] == addRingNode) {
								ringIndex = i;
								break;
							}
						}
						if (typeof ringIndex == 'number') {
							var modifiedRings = JSON.parse(JSON.stringify(rings));	// clone
							modifiedRings.splice(ringIndex, 0, { name: ''});
							var workbookId = this.model.currentWorkbookId();
							var sheetType = this.model.currentSheetType(workbookId);
							var sheetId = this.model.currentSheetId(workbookId, sheetType);
							this.model.set('workbooks['+workbookId+'].sheets['+sheetType+']['+sheetId+']._rings', modifiedRings);
							this._updateGraphics();
							this._updateInputArea();
						}
					}.bind(this)
				}
			}, Ecosystem_Model_People_Add_Ring_DIV);
		}

	};
});
