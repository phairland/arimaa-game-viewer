var ARIMAA_DEBUG_ON = false;
	

var GENERIC = GENERIC || function() {
  return {
  	'log': log,
    'for_all': for_all,
    'map': map,
    'filter': filter,
    'reduce': reduce,
    'for_each': for_each,
    'for_each_indexed': for_each_indexed,
    'reverse': reverse,
    'copy_array': copy_array,
    'create_array': create_array,
    'isPrimitiveArray': isJSPrimitiveArray,
    'assert': assert,
    'okUnless': okUnless,
    'shallowCopyObject': shallowCopyObject,
    'intToChar': intToChar,
    'charToInt': charToInt,
    'existsIn': existsIn,
    'exists': exists
  };
  
  var show_alert = true;
  
  function log(message) {
  	if(ARIMAA_DEBUG_ON && console !== undefined) console.log(message); 
  	else if(show_alert) {
  		alert("got message (after which I say nothing: " + message);
  		show_alert = false;
  	}
  }
  
  function existsIn(value, array) {
    return exists(array, function(elem) { return elem === value; });
  } 
  
  function exists(array, fun) {
    for(var i = 0, length = array.length; i < length; ++i) {
      if(fun(array[i])) return true;
    }
    
    return false;
  } 

  function intToChar(code) { return String.fromCharCode(code); }
  function charToInt(ch) { return ch.charCodeAt(); }

  function for_each_indexed(array, fun) {
    for(var i = 0, length = array.length; i < length; ++i) {
      fun(array[i], i);
    }
  }
  
  function reverse(array) {
    return reduce([], array, function(acc, elem) { return [elem].concat(acc); }); 
  }
  
  function isJSPrimitiveArray(elem) {
    return Object.prototype.toString.call(elem) === '[object Array]';
  }

  function assert(propertyName, expected, actual, toString) {
    function toStr(value) { return toString !== undefined ? toString(value) : value; }
    
    if(expected !== actual) {
      throw "expected " + propertyName + ": " + toStr(expected) + ", actual: " + toStr(actual);
    }
  }
  
  function okUnless(errorMessage, value) {
    if(!!value) throw errorMessage;
  }
  
  function create_array(numberOfElements, element) {
    var result = [];
    
    for(var i = 0; i < numberOfElements; ++i) {
      result[i] = element;
    }
    
    return result;
  }
  
  function copy_array(value) {
    return [].concat(value);
  }

  function for_all(array, fun) {
    return reduce(true, array, function(acc, elem) { return acc && fun(elem) });
  }
  
  function filter(array, fun) {
    var result = [];
    
    for(var i = 0, length = array.length; i < length; ++i) {
      var elem = array[i];
      if(fun(elem)) result.push(elem);
    }
    
    return result;
  }
  
  function map(array, fun) {
    var result = []
    
    for(var i = 0, length = array.length; i < length; ++i) {
      result.push(fun(array[i]));
    }
    
    return result;
  }
  
  function reduce(neutral, collection, fun) {
    return isJSPrimitiveArray(collection) ? 
      reduceArray(neutral, collection, fun) :
      reduceString(neutral, collection, fun);
  }
  
  function reduceArray(neutral, array, fun) {
    var result = neutral;
    
    for(var i = 0, length = array.length; i < length; ++i) {
      result = fun(result, array[i]);
    }
    
    return result;
  }

  function reduceString(neutral, string, fun) {
    var result = neutral;
    
    for(var i = 0, length = string.length; i < length; ++i) {
      result = fun(result, string.charAt(i));
    }
    
    return result;
  }
  
  function for_each(array, fun) {
    for(var i = 0, length = array.length; i < length; ++i) {
      fun(array[i]);
    }
  }
  
  function shallowCopyObject(object) {
    var result = {};
    
    for(i in object) {
      if(object.hasOwnProperty(i)) {
        result[i] = object[i];
      }
    }
    
    return result;
  }
  
}();
