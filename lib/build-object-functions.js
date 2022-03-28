/** push an argument into the filter object
 *  @param {String} Arg the argument that need to be pushed, must have a format like key[value]
 *  @param {Object} filterObj the object that have at this point
 *  @param {String} operator operator that be the level in the object, have to be AND,OR
 */
 exports.parseArg = function parseArg(Arg, filterObj, operator) { 
	//separate the argument into array of elements to have key and values as separated elements
	var args = Arg.split(/\"|\[|\]/);
	let filterNot = {};
	const regexNumb = /^[0-9]+$/gm;
	//removing empty object that can be after split
	args = removeEmptyObject(args);
	//get the key and value in separated variables
	var key = args[1];
	var value = replaceChar(args[0], 0, "ª", " ");
	var intervalRegex = /::/i
	if (intervalRegex.test(value)) filterObj = createIntervalObject(value, key, filterObj)
	else {
		//checks if the value is a number and parse it
		if (regexNumb.test(value)) value = parseInt(value);
		else value = new RegExp(value);
		//checks if the operator exists (in case of simple queries)
		if (operator === undefined) {
			filterObj[key] = value;
		} else if (/NOT/i.test(operator)) {
			filterObj['$and'] = [];
			// When value is numerical is used $ne (not equal) instead of $not, this if checks type of the Value
			if (typeof value == "number") {
				filterNot[key] = {
					$ne: value
				};
			}
			else {
				filterNot[key] = {
					$not: value
				};
			}
			filterObj['$and'].push(filterNot);
		} else {
			filterObj[operator].push({
				[key]: value
			});
		}
	}
	return filterObj;
};

/** identifies interval values when it contains "::"
 *  @param {String} value the value that need to be pushed, must have a format like value1::value2
 *  @param {String} key the key name where the interval will it be searched
 * 	@param {Object} filterObj the object that have at this point
 */

// TODO: Improve this function to allow the use of dates in ranged queries
const createIntervalObject = (value, key, filterObj) => {
	const regexNumb = /^[0-9]+$/i;
	var values = value.split(/:/)
	values = removeEmptyObject(values);
	if (values.length > 2)
		throw new Error('Intervals are only available for 2 values');
	if (filterObj["$and"] == undefined) 
		filterObj["$and"] = []
	if (regexNumb.test(values[0]) && regexNumb.test(values[1])) {
		if (parseInt(values[0]) > parseInt(values[1]))
			throw new Error("Please check the order of the numbers")
		filterObj["$and"].push({
			[key]: {"$gte": parseInt(values[0])}
		});
		filterObj["$and"].push({
			[key]: {"$lte": parseInt(values[1])}
		});
	}
	else
		throw new Error('Interval cannot be correctly defined with this values, please use only numbers')
	return filterObj
}

/** push an argument with the operator "NOT" into the filter object when is at the start of the query
 *  @param {String} Arg the argument that need to be pushed, must have a format like key[value]
 *  @param {Object} filterObj the object that have at this point
 */
exports.parseNotAtStart = function parseNotAtStart(Arg, filterObj) {
	//separate the argument into array of elements to have key and values as separated elements
	var args = Arg.split(/\"|\[|\]/);
	const regexNumb = /^[0-9]+/gm;
	//removing empty object that can be after split
	args = removeEmptyObject(args);
	//get the key and value in separated variables
	var key = args[1];
	var value = replaceChar(args[0], 0, "ª", " ");
	//checks if the value is a number and parse it
	if (regexNumb.test(value)) value = parseInt(value);
	else value = new RegExp(value);
	//checks if the operator exists (in case of simple queries)
	filterObj[key] = {
		$not: value
	};
	return filterObj;
};

/** this function removes all empty elements that could be in an array
 * @param {Array} elementsArray the array that need to remove empty elements
 */
const removeEmptyObject = (elementsArray) => {
	// this variable is false until array has empty elements
	var noEmptyElements = false;
	do {
		const index = elementsArray.indexOf('');
		//identifies if a element is empty, and remove them
		if (index > -1) {
			elementsArray.splice(index, 1);
		} else noEmptyElements = true; //if there are no empty elements, change the variable to true to break the loop
	} while (noEmptyElements === false);
	return elementsArray;
};

/** Replace a char in specific position 
 * @param {String} str string that will change
 * @param {number} index position of the char
 * @param {Char} chr char value that replace in position
*/
const setCharAt = (str, index, chr) => {
	if (index > str.length - 1) return str;
	return str.substr(0, index) + chr + str.substr(index + 1);
};

/** function that locates parentheses and changes values in arguments with multiple words
* @param {String} searchString String to parse
*/
exports.replaceDoubleQuotes = function replaceDoubleQuotes(searchString) {
	let i = 0;
	do {
		if (String(searchString).charAt(i) == '"') {
			do {
				i++;
				if (String(searchString).charAt(i) === ' ') {
					searchString = setCharAt(searchString, i, "ª");
				}
				if (String(searchString).length < i)
					throw new Error('failed on regex test, check your string');
			} while (String(searchString).charAt(i) != '"');
		}
		i++;
	} while (i < searchString.length);
	return searchString;
};

/** function that locates parentheses and changes values in arguments with multiple words
* @param {String} wordArg String to change to it original form
* @param {number} skip if it exists, don't add the escaped quotes
*/
const replaceChar = (wordArg, skip, charToSearch, charToReplace) => {
	for (let i = 0; i < wordArg.length; i++) {
		if (String(wordArg).charAt(i) === charToSearch) {
			wordArg = setCharAt(wordArg, i, charToReplace);
			if (skip === undefined) wordArg = `\"${wordArg}\"`;
		}
	}
	return wordArg;
};

/** function to build a filter part with the arg transformed to regex and applied to
 *  all field to be queried
 *  @param {Array} fieldsToUse contains all fields to use
 *  @param {String} wordToSearch arg to be queried
 *  @param {Boolean} fullMatchOnly defines if will be partial or full match
 */
exports.buildOrObject = function buildOrObject(fieldsToUse, wordToSearch, fullMatchOnly) {
	let orObject = { $or: [] };
	if (fullMatchOnly) wordToSearch = new RegExp('\\b' + wordToSearch + '\\b', 'i');
	else wordToSearch = new RegExp('\\b' + wordToSearch, 'i');
	for (let i = 0; i < fieldsToUse.length; i++) {
		let property = fieldsToUse[i];
		orObject['$or'].push({
			[property]: wordToSearch
		});
	}
	return orObject;
};

/** function to build a filter part with the argument transformed to regular expression 
 *  and applied to all the fields to query when the argument is preceded by a "NO" operator
 *  @param {Array} fieldsToUse contains all fields to use
 *  @param {String} wordToSearch arg to be queried
 *  @param {Boolean} fullMatchOnly defines if will be partial or full match
 */
exports.buildNotObject = function buildNotObject(fieldsToUse, wordToSearch, fullMatchOnly) {
	let notObject = { $and: [] };
	if (fullMatchOnly) wordToSearch = new RegExp('\\b' + wordToSearch + '\\b', 'i');
	else wordToSearch = new RegExp('\\b' + wordToSearch, 'i');
	for (let i = 0; i < fieldsToUse.length; i++) {
		let property = fieldsToUse[i];
		notObject['$and'].push({
			[property]: { $not: wordToSearch }
		});
	}
	return notObject;
};

/** function to replace all special characters in the argument with the same 
 *  character but escaped */
// prettier-ignore
exports.escapeChar = function escapeChar(wordArg) {
	return wordArg.replace(/[\+\-\&\/]/g, (match) => {
		return {
			'\+': '\\+',
			'\-': '\\-',
			'\&': '\\&',
			'\/': '\\/',
		}[match];
	});
}

exports.removeEmptyObject = removeEmptyObject;
exports.replaceChar = replaceChar;
exports.setCharAt = setCharAt;
