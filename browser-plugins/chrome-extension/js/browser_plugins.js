	/** This should be included only in Chrome Extension release */ 
	function addChromeListener() {
		var imported = false;
		
		function listener(request, sender, sendResponse) {
			if (!imported && !!request.moves) {
				ARIMAA_MAIN.import_game(request.moves);
				imported = true;
			}
			
			sendResponse({}); // cleanup
		}	

		chrome.extension.onRequest.addListener(listener);
	}
	
	addChromeListener();
	

