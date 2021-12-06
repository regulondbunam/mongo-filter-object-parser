const { removeEmptyObject } = require('./build-object-functions');

/** get all arguments and operators in searchString and push them into arrays
 * @param {string} searchString the string that contains the args
 * @param {Array} argArray argument array
 * @param {Array} operatorArray operator array
*/
module.exports = function binaryTreeExtractor(searchString, argArray, operatorArray) {
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
				for(let spaceIdentifier = 0; spaceIdentifier < rightNode.length; spaceIdentifier++){
					if(rightNode.charAt(spaceIdentifier) == " ")
						throw new Error('failed on regex test, check your string');
				}
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
	} else {
		//when the search string has a maximum of 2 args
		//separete the elements of the string
		var args = searchString.split(/\s|\(|\)/);
		//removing empty object that can be after split
		args = removeEmptyObject(args);
		//if args more than 1 element, push in their respective array
		let regexNot = /^NOT$/i;
		if (regexNot.test(args[0])) {
			operatorArray.unshift(args[0]);
			argArray.unshift(args[1]);
		} else {
			if (args.length > 1) {
				argArray.unshift(args[2]);
				operatorArray.unshift(args[1]);
			}
			//and push the first arg into argArray
			argArray.unshift(args[0]);
		}
	}
	return [ leftNode, argArray, operatorArray ];
};
