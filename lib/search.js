const { replaceDoubleQuotes, removeEmptyObject, replaceChar } = require('./build-object-functions');

/** this function creates a filter for the text search in mongodb,
 * it is necessary to have a text index in the collection
 * @param {String} searchstring string that contains all argument 
 * and operators to be parsed
 */
module.exports = function searchFilter(searchString) {
	// boiler-plate of the filter
	let simpleFilter = { $text: {} };
	let finalString = '';
	/** we need to identified possible args with two or more words
	 enclosed in double quotes */
	searchString = replaceDoubleQuotes(searchString);
	//split all args by blank space or double quote
	// prettier-ignore
	let wordsToFind = searchString.split(/\"|\s/);
	//remove all posible empty objects in the array
	wordsToFind = removeEmptyObject(wordsToFind);
	let regexOperator = /^OR|AND|NOT$/i;
	/** begin to build the filter, if there is only 1 arg, don't 
	enter to do-while loop*/
	if (wordsToFind.length != 1) {
		//while wordsToFind aren't empty, the loop continues
		while (wordsToFind.length != 0) {
			//extract the top word
			let extractedWord = wordsToFind.shift();
			//checks if word is an operator
			if (regexOperator.test(extractedWord)) {
				//parse word to lowerCase and get the next word
				extractedWord = extractedWord.toLowerCase();
				let nextExtract = wordsToFind.shift();
				//switch the operator
				switch (extractedWord) {
					case 'or':
						//identifies if the next operator will be an AND
						if (/^and$/i.test(wordsToFind[0])) {
							nextExtract = `\"${nextExtract}\"`;
							nextExtract = replaceChar(nextExtract, 1);
							finalString = finalString + ` ${nextExtract}`;
						} else {
							//if is not a AND the next operator, just push the arg into finalString
							nextExtract = replaceChar(nextExtract);
							finalString = finalString + ` ${nextExtract}`;
						}
						break;
					case 'and':
						//checks if the second arg is a NOT operator
						if (/^not/i.test(nextExtract)) {
							nextExtract = `${wordsToFind.shift()}`;
							nextExtract = replaceChar(nextExtract, 1);
							finalString = finalString + ` -\"${nextExtract}\"`;
						} else {
							nextExtract = replaceChar(nextExtract, 1);
							finalString = finalString + ` \"${nextExtract}\"`;
						}
						break;
					case 'not':
						nextExtract = replaceChar(nextExtract);
						finalString = finalString + ` -${nextExtract}`;
						break;
				}
			} else {
				//if is not an operator, continues here, replace the possible '_' on word
				extractedWord = replaceChar(extractedWord, 1);
				//if are words remaining, checks if the next word is an And operator
				if (wordsToFind.length > 1) {
					if (/^and$/i.test(wordsToFind[0])) {
						extractedWord = ` \"${extractedWord}\"`;
					}
				}
				// and push the arg to the finalString
				finalString = finalString + `${extractedWord}`;
			}
		}
		//constructs the filter with the finalString
		simpleFilter.$text = { $search: `${finalString}` };
	} else {
		//constructs a simple filter with 1 argument
		simpleFilter.$text = { $search: `${replaceChar(searchString, 1)}` };
	}
	return simpleFilter;
};
