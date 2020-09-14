const {
	replaceDoubleQuotes,
	replaceChar,
	removeEmptyObject,
	buildOrObject,
	buildNotObject,
	escapeChar
} = require('./build-object-functions');

/** This function contains all needed to build filters for Search
 *  without using $text operator that mongoDB use, this function can
 *  define if the search will be partial or full match, also accepts 
 *  a String array that contains all the fields that will be queried
 * 
 *  textSearch is the Main function and this start the build process
 *  @param {String} searchString contains all argument and operator that
 * 	will be parsed
 * 	@param {Array} properties contains all field that will be queried by
 * 	all search args.
 * 	@param {Boolean} fullMatchOnly indicates if the query accepts partial
 * 	or full match 
 */
module.exports = function textSearch(searchString, properties, fullMatchOnly = false) {
	let finalObject = {};
	// used to search args defined by two or more words
	searchString = replaceDoubleQuotes(searchString);
	// get an array with all arguments and operators and remove all possible
	// empty objects
	// prettier-ignore
	let wordsToFind = searchString.split(/\"|\s/);
	wordsToFind = removeEmptyObject(wordsToFind);
	let regexOperator = /^OR|AND|NOT$/i;
	// function start a loop to search all possible operator
	if (wordsToFind.length > 1) {
		do {
			// obtain the first element in array and detects if is an operator
			let extractedWord = wordsToFind.shift();
			if (regexOperator.test(extractedWord)) {
				// with an operator encounter, function needs next element in array,
				// and identified all special characters that are contained
				extractedWord = extractedWord.toLowerCase();
				let nextExtract = escapeChar(wordsToFind.shift());
				// build the filter based on the operator obtained
				let operatorObject;
				let filterPlaceHolder;
				switch (extractedWord) {
					case 'or':
						operatorObject = buildOrObject(properties, nextExtract, fullMatchOnly);
						filterPlaceHolder = finalObject;
						finalObject = {
							$or: [ operatorObject, filterPlaceHolder ]
						};
						break;
					case 'and':
						operatorObject = buildOrObject(properties, nextExtract, fullMatchOnly);
						filterPlaceHolder = finalObject;
						finalObject = {
							$and: [ operatorObject, filterPlaceHolder ]
						};
						break;
					case 'not':
						operatorObject = buildNotObject(properties, nextExtract, fullMatchOnly);
						filterPlaceHolder = finalObject;
						finalObject = {
							$and: [ operatorObject, filterPlaceHolder ]
						};
						break;
				}
			} else {
				//if is not an operator, continues here, replace the possible '_' on word
				extractedWord = replaceChar(extractedWord, 1);
				//this is defined in cases when is used a space ' ' instead of an operator 'OR'
				let noArgObject = buildOrObject(properties, escapeChar(extractedWord), fullMatchOnly);
				filterPlaceHolder = finalObject;
				finalObject = {
					$or: [ noArgObject, filterPlaceHolder ]
				};
			}
		} while (wordsToFind.length != 0);
	} else {
		// if is only an arg in the string the filter will be builded without a loop
		let word = replaceChar(wordsToFind[0], 1);
		finalObject = buildOrObject(properties, escapeChar(word), fullMatchOnly);
	}
	return finalObject;
};
