const validateString = require('./validate-string');
const binaryTreeExtractor = require('./binary-tree-extractor');
const { parseArg, parseNotAtStart, replaceDoubleQuotes, replaceChar } = require('./build-object-functions');

module.exports = function advancedSearchFilter(searchString) {
	// object that act as filter to mongoDB
	let filterObject = {};
	// array that contains all search arguments and operator
	let argArray = [];
	let operatorArray = [];
	// get the parenthesis count that remains in string
	var count = 1;
	searchString = replaceChar(searchString, 0, "'", "\"");
	searchString = replaceDoubleQuotes(searchString);
	// insert all args and operator that searchString contains based on the parenthesis count
	while (count != 0) {
		count = validateString(searchString);
		let container = binaryTreeExtractor(searchString, argArray, operatorArray);
		searchString = container[0];
		argArray = container[1];
		operatorArray = container[2];
	}
	// if there is only one argument and not operator, just create a simple query filter with one only argument
	if (operatorArray.length === 0) {
		filterObject = parseArg(argArray[0], filterObject);
	} else if (/^NOT$/i.test(operatorArray[0]) && operatorArray.length === 1 && argArray.length === 1) {
		filterObject = parseNotAtStart(argArray[0], filterObject);
	} else {
		/** prepare the operator with a $ character needed by mongodb to 
		 * identified the query as a logical comparision */
		let ope = '$' + operatorArray.shift().toLowerCase();
		if (/NOT/i.test(ope) && operatorArray.length + 1 < argArray.length) {
			let arg1 = argArray.shift();
			let arg2 = argArray.shift();
			parseArg(arg2, filterObject, ope);
			parseArg(arg1, filterObject, '$and');
		} else if (/NOT/i.test(ope)) {
			let arg = argArray.shift();
			parseArg(arg, filterObject, ope);
		} else {
			filterObject[ope] = [];
			/** this loop asigns the 2 elements that are compared with the 
		 * operator defined above and makes first level*/
			for (let i = 0; i < 2; i++) {
				//pop the first element in the argArray
				let arg = argArray.shift();
				// call the parseArg function to get the first level of the filter
				parseArg(arg, filterObject, ope);
			}
		}
		//this loop checks if argArray has remaining elements to continue
		while (argArray.length !== 0) {
			let arg = argArray.shift();
			/** prepare a template filter that will help push the filterObject 
			 * to the same level as the next operator*/

			let filterBoilerPlate = {};
			/** checks if the operatorArray has more operators */
			if (operatorArray.length !== 0) {
				ope = '$' + operatorArray.shift().toLowerCase();
				if (!/not/i.test(ope)) filterBoilerPlate[ope] = [];
				parseArg(arg, filterBoilerPlate, ope);
				/**push the filterObject with the deeper level (the one obtained first)
				 * into the filter template */
				if (!/not/i.test(ope)) filterBoilerPlate[ope].push(filterObject);
				else filterBoilerPlate['$and'].push(filterObject);
				//after that the template pass to be the filterObject
				filterObject = filterBoilerPlate;
			}
		}
	}
	return filterObject;
};
