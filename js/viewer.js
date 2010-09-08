function create_viewer(gametree, domtree) {
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
	

	$('.gametree li a').live('click', function() {
		var elem = $(this).closest('li');
		current_domtree_node = elem;
		var id = get_nodehandle_id_from_tree_elem(elem);
		current_move_index = get_move_index_from_tree_elem(elem); 

		showing_slowly = false;
		gametree_goto(id);
		show_board(board);
		update_selected_nodehandle_view(); // should this be done here?
	});

		//domtree.bind("deselect_all.jstree", function (event, data) {
		domtree.bind("deselect_node.jstree", function (event, data) {
				console.log("deselect");
				console.log(event);
				console.log(data);
				
			// gold turn to silver, vice versa
			/*
	    domtree.jstree('set_type', 'gsingleton_before', 'li[rel="ssingleton_after"]');
	    domtree.jstree('set_type', 'ssingleton_before', 'li[rel="gsingleton_after"]');
	    */
	  });
/*	  
	  domtree.bind("deselect_node.jstree", function(node) {
	  		console.log(node);
	  });
	  */
	  
	
	return {
		
	}
}
