function create_comment_handler() {
	var comments_position = {};
	var comments_move = {}
	
	function comment_node(text, id) {
		comments_position[id] = text;
	}
	
	function comment_move(text, id, index) {
		if(!comments_move[id]) { comments_move[id] = {} };		
		comments_move[id][index] = text;
	}
	
	function hasText(text) {
		return !!text && text.toString().replace(/ /g, "") != "";
	}
	
	function comments_by_node() {
		var result = [];
		for(var i in comments_position) {
      if(comments_position.hasOwnProperty(i)) {
      	if(hasText(comments_position[i])) {
          result.push({
          	type: 'position', 
          	node_id: i,
          	text: comments_position[i]
          });
        }
      }
    }
    
		// check if any of the moves contain comments
		// if so, add the node (position)
		for(var i in comments_move) {
			for(var j in comments_move[i]) {
				if(comments_move[i].hasOwnProperty(j)) {
					if(hasText(comments_move[i][j])) {
						result.push({
							type: 'move',
							node_id: i,
							move_index: j,
							text: comments_move[i][j]
						});
					}
				}
			}
		}
    
    return result;
	}
	
	return {
		comment_node: comment_node,
		comment_move: comment_move,
		comments_by_node: comments_by_node
	}
}
