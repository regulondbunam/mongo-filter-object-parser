module.exports = function validateString(searchString) {
	// regex that validate String
	//previous regex
	// const regex = /^(\(*\"*(NOT\s)*[A-Za-z0-9\s\_\|\-\%\/\.\;]+\"*\[([A-Za-z\_]+\.*)+\]\)*(\s(AND|OR|NOT|\:)\s)*\)*)+/i;
	//4-Dic-21 Regex now the following chars % + , - . / : ; = _ ~ |
	const regex = /^(\(*\"*(NOT\s)*[A-Za-z0-9\s\%\+\,\-\.\_\/\:\;\=\~\|\ª]+\"*\[([A-Za-z\_]+\.*)+\]\)*(\s(AND|OR|NOT|\:)\s)*\)*)+/i
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
};
