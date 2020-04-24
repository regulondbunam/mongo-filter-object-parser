module.exports = function buildFilterObject(searchString) {
	// object that act as filter to mongoDB
	var filterObject = {};
	// array that contains all search arguments and operator
	var argArray = [];
	var operatorArray = [];
	// get the parenthesis count that remains in string
	var count = 1;
	// insert all args and operator that searchString contains based on the parenthesis count
	while (count != 0) {
		count = validateString(searchString);
		searchString = testingBinaryTree(searchString, argArray, operatorArray);
	}
	// if there is only one argument and not operator, just create a simple query filter with one only argument
	if (operatorArray.length === 0) {
		getArg(argArray[0], filterObject);
	} else {
		/** prepare the operator with a $ character needed by mongodb to 
		 * identified the query as a logical comparision */
		var ope = '$' + operatorArray.shift().toLowerCase();
		//prepare the first level of the object with the first logical operator
		filterObject[ope] = [];
		/** this loop asigns the 2 elements that are compared with the 
		 * operator defined above and makes first level*/
		for (var i = 0; i < 2; i++) {
			//pop the first element in the argArray
			var arg = argArray.shift();
			// call the getArg function to get the first level of the filter
			getArg(arg, filterObject, ope);
		}
		//this loop checks if argArray has remaining elements to continue
		while (argArray.length !== 0) {
			var arg = argArray.shift();
			/** prepare a template filter that will help push the filterObject 
			 * to the same level as the next operator*/

			var filterBoilerPlate = {};
			/** checks if the operatorArray has more operators */
			if (operatorArray.length !== 0) {
				ope = '$' + operatorArray.shift().toLowerCase();
				filterBoilerPlate[ope] = [];
				getArg(arg, filterBoilerPlate, ope);
				/**push the filterObject with the deeper level (the one obtained first)
				 * into the filter template */

				filterBoilerPlate[ope].push(filterObject);
				//after that the template pass to be the filterObject
				filterObject = filterBoilerPlate;
			}
		}
	}
	return filterObject;
};

function validateString(searchString) {
	// regex that validate String
	const regex = /^(\(*[A-Za-z0-9]+\[([A-Za-z]+\.*)+\]\)*(\s(AND|OR|\:)\s)*\)*)+/gm;
	// validating the string
	if (regex.test(searchString)) {
		// variables to count all Parenthesis and Square Brackets
		let leftPar = 0,
			rightPar = 0,
			leftSB = 0,
			rightSB = 0;
		// the for loop gets all parenthesis and Square Brackets count
		for (let i = 0; i < searchString.length; i++) {
			const charValue = String(searchString).charAt(i);
			if (charValue === '(') leftPar += 1;
			if (charValue === ')') rightPar += 1;
			if (charValue === '[') leftSB += 1;
			if (charValue === ']') rightSB += 1;
		}
		// evaluates if all Parenthesis and Square Brackes have an open and closing character
		if (leftPar === rightPar && leftSB === rightSB) {
			//console.log('everything ok');
			if (String(searchString).charAt(searchString.length - 1) != ')') return rightPar;
			else throw new Error('syntax not yet supported, failed on regex test');
		} else throw new Error('failed on regex test, check your string'); // if has a missing parenthesis or Square Bracket returns error
	} else throw new Error('failed on regex test, check your string');
}

/** push an argument into the filter object
 *  @param {String} Arg the argument that need to be pushed, must have a format like key[value]
 *  @param {Object} filterObj the object that have at this point
 *  @param {String} operator operator that be the level in the object, have to be AND,OR
 */
function getArg(Arg, filterObj, operator) {
	//separate the argument into array of elements to have key and values as separated elements
	var args = Arg.split(/\[|\]/);
	const regexNumb = /^[0-9]+/gm;
	//removing empty object that can be after split
	removeEmptyObject(args);
	//get the key and value in separated variables
	var key = args[1];
	var value = args[0];
	//checks if the value is a number and parse it
	if (regexNumb.test(value)) value = parseInt(value);
	//checks if the operator exists (in case of simple queries)
	if (operator === undefined) {
		filterObj[key] = value;
	} else {
		filterObj[operator].push({
			[key]: value
		});
	}
	return filterObj;
}

/** this function removes all empty elements that could be in an array
 * @param {Array} elementsArray the array that need to remove empty elements
 */
function removeEmptyObject(elementsArray) {
	// this variable is false until array has empty elements
	var noEmptyElements = false;
	do {
		const index = elementsArray.indexOf('');
		//identifies if a element is empty, and remove them
		if (index > -1) {
			elementsArray.splice(index, 1);
		} else noEmptyElements = true; //if there are no empty elements, change the variable to true to break the loop
	} while (noEmptyElements === false);
}

/** get all arguments and operators in searchString and push them into arrays 
 * @param {string} searchString the string that contains the args
 * @param {Array} argArray argument array
 * @param {Array} operatorArray operator array
*/
function testingBinaryTree(searchString, argArray, operatorArray) {
	//the checkpoint is the place where string gonna be sliced
	var checkPoint = 0;
	//define 3 elements of BinaryTree, leftNode, rightNode and the operator
	var leftNode = '';
	var rightNode = '';
	var operator = '';
	//checks if the start of the string is an ( thats means there are more of 2 args
	if (String(searchString).charAt(0) === '(') {
		//remove the first char of the string '('
		searchString = searchString.substring(1);
		//loop to get the left and right string based in the first ')' from
		//right to left
		for (checkPoint = searchString.length; checkPoint > 0; checkPoint--) {
			if (String(searchString).charAt(checkPoint) === ')') {
				//based on checkpoint, slice the searchstring to get rightSide
				var RN = searchString.slice(checkPoint + 2);
				//separete the rightSide into operator and rightNode
				var operatorPosition = 0;
				while (String(RN).charAt(operatorPosition) != ' ') {
					operator = operator + String(RN).charAt(operatorPosition);
					operatorPosition++;
				}
				rightNode = RN.slice(operatorPosition + 1);
				break;
			}
		}
		//to get the leftNode is used checkpoint in a loop
		for (var i = 0; i < checkPoint; i++) {
			leftNode = leftNode + String(searchString).charAt(i);
		}
		//the operator and rightNode are pushed at the start of the respective array
		argArray.unshift(rightNode);
		operatorArray.unshift(operator);
		//the leftNode is returned with remaning args as new searchString
		return leftNode;
	} else {
		//when the search string has a maximum of 2 args
		//separete the elements of the string
		var args = searchString.split(/\s|\(|\)/);
		//removing empty object that can be after split
		removeEmptyObject(args);
		//if args more than 1 element, push in their respective array
		if (args.length > 1) {
			argArray.unshift(args[2]);
			operatorArray.unshift(args[1]);
		}
		//and push the first arg into argArray
		argArray.unshift(args[0]);
	}
}
