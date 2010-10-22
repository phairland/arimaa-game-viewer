	function getNode(nodeid, move_index) {
		var selector = getSelectorForNode(nodeid, move_index);
		return $('.gametree').find(selector);
	}
	
	function nodeId(elem) { return parseInt(elem.attr('nodeid')); }
	function moveIndex(elem) { return parseInt(elem.attr('move_index')); }
	
	function create_tree_nodehandle(nodehandle, move_index) {
		/*
		var movename = nodehandle.moves_from_node.length === 0 ? 
										nodehandle.gamestate.turn.side.slice(0, 1) + "#"
									: nodehandle.moves_from_node[0].id /* show main variant */
		var movename = nodehandle.movenumber + nodehandle.gamestate.turn.side.slice(0, 1);

		if(nodehandle.moves_from_node.length > 0) {
			movename = movename + " " + GENERIC.reduce("", nodehandle.moves_from_node[move_index].steps, function(result, step) { return $.trim(result + " " + step.notated); });
		}
									
		var side = nodehandle.gamestate.turn.side;									 

  	var result = '';
  	result += '<ul>';
			//result += '<li id="' + nodehandle.id + "_" + move_index + '">';
			result += '<li id="' + nodehandle.id + "_" + move_index + '" nodeid="' + nodehandle.id + '" move_index="' + move_index + '">';
			//result += '<li nodeid="' + nodehandle.id + '" move_index="' + move_index + '">';			
			result += '<a href="#">' + movename + '</a>';
			result += '</li>';
  	result += '</ul>';
  	return $(result);
  }

  function OLD_create_tree_nodes(gametree, domtree) {
		GENERIC.for_each(gametree.get_nodehandles(), function(nodehandle) {
			if(nodehandle.moves_from_node.length > 0) {
				var dom_nodehandle = create_tree_nodehandle(nodehandle, 0);
				domtree.append(dom_nodehandle);
			}
		});
  }

  function create_tree_nodes(gametree, domtree) {
  	function create_tree_nodes_private(nodehandle, dom_parent) {
  		if(nodehandle.moves_from_node.length === 0) return;
			//TODO: handle singleton nodes
			
			// first move is appended linearly
			GENERIC.for_each(nodehandle.moves_from_node.slice(0, 1), function(move) {
				var dom_nodehandle = create_tree_nodehandle(nodehandle, 0);
				dom_parent.append(dom_nodehandle);
				create_tree_nodes_private(move.nodehandle_after_move, dom_parent);
				dom_parent = dom_nodehandle.find('li:first');
			});
			
			// rest are appended to the new dom_parent (dom_nodehandle) 
  		for(var i = 1; i < nodehandle.moves_from_node.length; ++i) {
  			var move = nodehandle.moves_from_node[i];
				var dom_nodehandle = create_tree_nodehandle(nodehandle, i);
				dom_parent.append(dom_nodehandle);  				
  			create_tree_nodes_private(move.nodehandle_after_move, dom_parent);
  		}
  	}
  	
		create_tree_nodes_private(gametree.get_initial_nodehandle(), domtree);
  }
  
	function build_dom_tree(gametree, domtree,
													/* callbacks */
													remove_position, move_variation_up, move_variation_down ) {
		domtree.children().remove();

		create_tree_nodes(gametree, domtree);
		
  	var initial_handle = gametree.get_initial_nodehandle();
		//var initially_selected_node = getSelectorForNode(initial_handle.id, 0);
		var initially_selected_node = '#' + initial_handle.id + "_" + 0;

	/*
	var drag_and_drop_move = {
			"check_move" : function (m) {
				GENERIC.log("move", m);
				var id = nodeId(m.o);
				var move_index = moveIndex(m.o);
				GENERIC.log("drag and drop move index", move_index);
				if(move_index === 0) return false;
				
				var p = this._get_parent(m.o);
				
				GENERIC.log("parent", p);
				
				if(!p) return false;
				p = p == -1 ? this.get_container() : p;
				if(p === m.np) return true;
				if(p[0] && m.np[0] && p[0] === m.np[0]) return true;
				return false;
			}
	}
	*/

	function can_delete(node) {
		// nodes that are not part of main line can be deleted
		// notice that checking move index is necessarily, cause they are direct
		// variations to main line and are ok to be deleted
		return !gametree.select_node(nodeId(node)).main_line 
					 || moveIndex(node) !== 0;
	}
	
	function can_move_variation_up(node) {
		var move_index = moveIndex(node);
		return move_index >= 2; // 0 is main_line and 1 is already at top
	}
	function can_move_variation_down(node) {
		var move_index = moveIndex(node);
		return move_index !== 0 && move_index < gametree.select_node(nodeId(node)).moves_from_node.length - 1;
	}
	
	var custom_contextmenu = {
//		"rename": false,
		"create": false,
		"ccp": false, // copy, cut & paste in edit-key
		// delete key
		"remove" : {
			"label"				: "Delete position",
			"action"			: remove_position,
			
			// the following are optional 
			"_disabled"			: false,		// clicking the item won't do a thing
			"_class"			: "class",	// class is applied to the item LI node
			"separator_before"	: false,	// Insert a separator before the item
			"separator_after"	: true,		// Insert a separator after the item
			// false or string - if does not contain `/` - used as classname
			"icon"				: "pics/delete_small.png"
		},
		"moveup": {
			"label"  : "Move variation up",
			"action" : move_variation_up,
			"_disabled" : false,
			"icon"	: "pics/arrow_up_small.png"
		},
		"movedown": {
			"label"  : "Move variation down",
			"action" : move_variation_down,
			"_disabled" : false,
			"icon"	: "pics/arrow_down_small.png"
		}
	}
	
	// construct contextmenu dynamically depending on the node
	function custom_contextmenu_fun(node) {
		var menu = {
			"create": false,
			"ccp": false, // copy, cut & paste in edit-key,
			"remove": custom_contextmenu.remove
		}

		menu.remove._disabled = !can_delete(node);
		
		if(can_move_variation_up(node)) {
			menu.moveup = custom_contextmenu.moveup;
		}
		
		if(can_move_variation_down(node)) {
			menu.movedown = custom_contextmenu.movedown;
		}
		
		return menu;		
	}
		
		domtree.jstree({
				"core": { "animation": 0, "html_titles": true },
				"ui": { "initially_select" : [ initially_selected_node ], "select_limit": 1 },
			//n 	"sort": sort_tree,
				"contextmenu": {
					'items': custom_contextmenu_fun,
					'show_at_node': true,
					'select_node': false
				},
				/*
				"crrm": { "move": drag_and_drop_move },
				"dnd": {
					"drop_target": false,
					"drag_target": false
				},*/
				"types" : {
											"valid_children" : [ "all" ],
											"types" : {
													"max_depth": -2, // disables max_depth checking
													"singletonbefore" : {
															"icon" : {
																	"image" : "pics/move_before.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"singletonafter" : {
															"icon" : {
																	"image" : "pics/move_after.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"gsingletonbefore" : {
															"icon" : {
																	"image" : "pics/gmove_before.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"gsingletonafter" : {
															"icon" : {
																	"image" : "pics/gmove_after.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"ssingletonbefore" : {
															"icon" : {
																	"image" : "pics/smove_before.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"ssingletonafter" : {
															"icon" : {
																	"image" : "pics/smove_after.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},

													"gmovebefore" : {
															"icon" : {
																	"image" : "pics/gmove_before.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"gmoveafter" : {
															"icon" : {
																	"image" : "pics/gmove_after.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"smovebefore" : {
															"icon" : {
																	"image" : "pics/smove_before.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													"smoveafter" : {
															"icon" : {
																	"image" : "pics/smove_after.png"
															},
															"valid_children" : [ "all" ],
															"max_depth": -1,
															"hover_node" : false,
															"select_node" : function () {return true;}
													},
													
													"default" : {
															"valid_children" : [ "default" ]
													}
											}
									},				
							"plugins" : [ "themes", "html_data", "ui", "crrm", "types", "contextmenu" ] //, "dnd", "sort" ]
			});

			// missing feature in jstree: hide contextmenu when mouseleave
			$(document).bind("context_show.vakata", function () {
					$.vakata.context.cnt.mouseleave(function (){
						$.vakata.context.hide(); 
					});
			})
					
			GENERIC.for_each(gametree.get_nodehandles(), function(nodehandle) {
				for(var i = 0; i < nodehandle.moves_from_node.length; ++i) {
					var node_after = nodehandle.moves_from_node[i].nodehandle_after_move;
					if(node_after.moves_from_node.length === 0) {
						var nodetype_prefix = nodehandle.gamestate.turn === ARIMAA.gold ? "g" : "s";
						var selector = getSelectorForNode(nodehandle.id, i);
						$(selector).attr('after', node_after.id);
						domtree.jstree('set_type', nodetype_prefix + 'singletonbefore', selector);
						var done = true;
					} else {	
						var nodetype = nodehandle.gamestate.turn === ARIMAA.gold ? "gmovebefore" : "smovebefore";
						//console.log("index", nodehandle.move_index_from_previous, nodehandle);
						var selector = getSelectorForNode(nodehandle.id, i);
						//GENERIC.log(selector);
						domtree.jstree('set_type', nodetype, selector);
					}
				}
			});
			
			domtree.jstree('refresh_all');
	}
	
	

