function get_nodehandle_id_from_tree_elem(elem) {
	var id = elem.attr('id').split("_")[0];
	return parseInt(id);
}

function get_move_index_from_tree_elem(elem) {
	var id = elem.attr('id');
	if(id === undefined) throw "get_move_index: id is undefined";
	var move_index = id.split("_")[1];
	//console.log(move_index);
	if(move_index === undefined || move_index === '') return false;
	return parseInt(move_index); 
}


function create_viewer(gametree_, domtree_) {
	var gametree = gametree_;
	var domtree = domtree_;
	var current_id = gametree.get_initial_nodehandle().id;
	
	var board = gametree.get_initial_nodehandle().board;
	var gamestate = gametree.get_initial_nodehandle().gamestate;	
	/* var board = init_arimaa_board()['board'];
	var gamestate = ARIMAA.get_initial_gamestate(); */
	
	function gametree_goto(id) {
		current_id = id;

		var node = gametree.select_node(id);

		board = node.board;
		gamestate = node.gamestate;
	}	

	/*
		//domtree.bind("deselect_all.jstree", function (event, data) {
		domtree.bind("deselect_node.jstree", function (event, data) {
				
				console.log("deselect");
				console.log(event);
				console.log(data);
			
				// gold turn to silver, vice versa
	    //domtree.jstree('set_type', 'gsingleton_before', 'li[rel="ssingleton_after"]');
	    //domtree.jstree('set_type', 'ssingleton_before', 'li[rel="gsingleton_after"]');
	  });
  		*/		

/*	  
	  domtree.bind("deselect_node.jstree", function(node) {
	  		console.log(node);
	  });
	  */
	  
	
	return {
		'gametree_goto': gametree_goto,
		'board': function() { return board; },
		'gamestate': function() { return gamestate; },
		'setBoard': function(b) { board = b; },
		'gametree': function(){ return gametree; },
		'current_id': function(){ return current_id; }
	}
}
