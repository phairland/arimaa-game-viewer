 /** Retrieves moves from the movelist and sends them to background to handle */
	//var moves = "1w Ra1 Db1 Rc1 Rd1 De1 Rf1 Rg1 Rh1 Ra2 Hb2 Cc2 Md2 Ee2 Cf2 Hg2 Rh2 1b ra7 hb7 cc7 ed7 me7 df7 hg7 rh7 ra8 rb8 rc8 dd8 ce8 rf8 rg8 rh8 2w Ee2n Ee3n Ee4n Hg2n 2b ed7s ed6s ed5s hg7s 3w De1n Ee5w Ed5n Hb2n 3b ed4s hb7s ra7e rh7w 4w Db1n Hb3n Hb4n Db2n 4b ed3n Md2n ed4w Md3n 5w Hb5w De2w Rc1w Rd1w 5b ec4n Md4w ec5w Mc4n 6w Ed6s Mc5s Ed5w Mc4e 6b eb5s eb4e Db3n me7w 7w Ec5e Md4s Ha5s Db4s";

	var result = "";
	
	var moves = $('#movelist option');
	
	$.each(moves, function(index, move) {
			result += move.text + " ";
	});

	chrome.extension.sendRequest(
		{
			'arimaa': { 'moves': result }
		}
	);		

