	function getNode(nodeid, move_index) {
		console.log("nodeid", "move_index", nodeid, move_index);
		var node = $('.gametree').find('li [nodeid="'+nodeid+'"][move_index="' + move_index + '"]');
		console.log("getNode", node);
		return node;
	}
	
	function nodeId(elem) { return parseInt(elem.attr('nodeid')); }
	function moveIndex(elem) { return parseInt(elem.attr('move_index')); }
	
	function create_tree_nodehandle(nodehandle, move_index) {
		var movename = nodehandle.moves_from_node.length === 0 ? 
										nodehandle.gamestate.turn.side.slice(0, 1) + "#"
									: nodehandle.moves_from_node[0].id /* show main variant */;

		if(nodehandle.moves_from_node.length > 0) {
			movename = movename + " " + GENERIC.reduce("", nodehandle.moves_from_node[0].steps, function(result, step) { return $.trim(result + " " + step.notated); });
		}
									
		var side = nodehandle.gamestate.turn.side;									 

  	var result = '';
  	result += '<ul>';
			//result += '<li id="' + nodehandle.id + "_" + move_index + '">';
			result += '<li id="' + nodehandle.id + "_" + move_index + '" nodeid="' + nodehandle.id + '" move_index="' + move_index + '">';
			result += '<a href="#">' + movename + '</a>';
			result += '</li>';
  	result += '</ul>';
  	return $(result);
  }

	function build_dom_tree(gametree, domtree,
													/* callbacks */
													remove_position, move_variation_up, move_variation_down ) {
		domtree.children().remove();

		GENERIC.for_each(gametree.get_nodehandles(), function(nodehandle) {
			if(nodehandle.moves_from_node.length > 0) {
				var dom_nodehandle = create_tree_nodehandle(nodehandle, 0);
				domtree.append(dom_nodehandle);
			}
		});

  	var initial_handle = gametree.get_initial_nodehandle();
		var initially_selected_node = initial_handle.id + "_" + 0;

/*		
		function sort_tree(a, b) {
			var ai = $(a).attr('id').split("_")[1]; // move index
			var bi = $(b).attr('id').split("_")[1];
			return $(a).parent() === $(b).parent() && ai > bi ? 1 : -1;
			//return $(a).parent() === $(b).parent() && this.get_text(a) > this.get_text(b) ? 1 : -1; 
		}
		*/
		
	/*
	var drag_and_drop_move = {
			"check_move" : function (m) {
				GENERIC.log("move", m);
				var id = m.o.attr('id');
				var move_index = parseInt(id.split("_")[1]);
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
		},
	}
		
		
		domtree.jstree({
				"core": { "animation": 0, "html_titles": true },
				"ui": { "initially_select" : [ initially_selected_node ], "select_limit": 1 },
			//n 	"sort": sort_tree,
				"contextmenu": {
					'items': custom_contextmenu,
					'show_at_node': true,
					'select_node': true
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
							"plugins" : [ "themes", "html_data", "ui", "crrm", "dnd", "types", "contextmenu" ] //, "sort" ]
			});

			// missing feature in jstree: hide contextmenu when mouseleave
			$(document).bind("context_show.vakata", function () {
					$.vakata.context.cnt.mouseleave(function (){
						$.vakata.context.hide(); 
					});
			})
		
			GENERIC.for_each(gametree.get_nodehandles(), function(nodehandle) {
				for(var i = 0; i < nodehandle.moves_from_node.length; ++i) {
					var nodetype = nodehandle.gamestate.turn === ARIMAA.gold ? "gmovebefore" : "smovebefore";
					var move_index = i;
					var selector = "#" + nodehandle.id + "_" + move_index;
					//GENERIC.log(selector);
					domtree.jstree('set_type', nodetype, selector);
				}
			});
	}
	
	

