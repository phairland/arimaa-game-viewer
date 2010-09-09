  function create_tree_nodehandle(nodehandle, move_index) {
		var movename = nodehandle.moves_from_node.length === 0 ? 
										nodehandle.gamestate.turn.side.slice(0, 1) + "#"
									: nodehandle.moves_from_node[0].id /* show main variant */;

		if(nodehandle.moves_from_node.length > 0) {
			movename = "<strong>" + movename + "</strong>&nbsp;" + GENERIC.reduce("", nodehandle.moves_from_node[0].steps, function(result, step) { return step.notated + " " + result; });
			if(movename.length > 50) {
			  movename = movename.slice(0, 50) + "...";
			}
		}
									
		var side = nodehandle.gamestate.turn.side;									 

  	var result = '';
  	result += '<ul>';
			result += '<li id="' + nodehandle.id + "_" + move_index + '">';
			result += '<a href="#">' + movename + '</a>';
			result += '</li>';
  	result += '</ul>';
  	return $(result);
  }

	function build_dom_tree(gametree, domtree, moves) {
		domtree.children().remove();

		GENERIC.for_each(gametree.get_nodehandles(), function(nodehandle) {
			if(nodehandle.moves_from_node.length > 0) {
				var dom_nodehandle = create_tree_nodehandle(nodehandle, 0);
				domtree.append(dom_nodehandle);
				//lastnode = $('#' + dom_nodehandle.find('li').attr('id'));
				//console.log(lastnode);
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
		
		domtree.jstree({
				"core": { "animation": 0, "html_titles": true },
				"ui": { "initially_select" : [ initially_selected_node ], "select_limit": 1 },
			//n 	"sort": sort_tree,
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
							"plugins" : [ "themes", "html_data", "ui", "crrm", "types" ] //, "sort" ]
			});
		
			GENERIC.for_each(gametree.get_nodehandles(), function(nodehandle) {
				for(var i = 0; i < nodehandle.moves_from_node.length; ++i) {
					var nodetype = nodehandle.gamestate.turn === ARIMAA.gold ? "gmovebefore" : "smovebefore";
					var move_index = i;
					var selector = "#" + nodehandle.id + "_" + move_index;
					//console.log(selector);
					domtree.jstree('set_type', nodetype, selector);
				}
			});
	}
