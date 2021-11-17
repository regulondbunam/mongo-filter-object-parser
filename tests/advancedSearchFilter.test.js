const { advancedSearchFilter } = require('../index');

const simpleTest = 'forward[geneInfo.strand]';
const test2Args = '(forward[geneInfo.strand]) AND reverse[geneInfo.strand]';
const test4Args = '((Carlos[Author] AND Robert[Investigator]) OR General[Book]) AND Biomedics[Title]';
const testSpaces =
	'((Carlos[Author] AND Robert[Investigator]) OR General recommendations[Book]) AND Natural Biomedics[Title]';
const notSupportedString = '(Carlos[Author] AND Robert[Investigator]) OR (General[Book] AND Biomedics[Title])';

test('simple query object filter', () => {
	expect(advancedSearchFilter(simpleTest)).toStrictEqual({ 'geneInfo.strand': /forward/ });
});

test('filter object with 2 arguments', () => {
	expect(advancedSearchFilter(test2Args)).toStrictEqual({
		$and: [ { 'geneInfo.strand': /forward/ }, { 'geneInfo.strand': /reverse/ } ]
	});
});

test('get correct object filter with depth of 4 arguments', () => {
	expect(advancedSearchFilter(test4Args)).toStrictEqual({
		$and: [
			{ Title: /Biomedics/ },
			{ $or: [ { Book: /General/ }, { $and: [ { Author: /Carlos/ }, { Investigator: /Robert/ } ] } ] }
		]
	});
});

test('value with spaces char', () => {
	expect(advancedSearchFilter(testSpaces)).toStrictEqual({
		$and: [
			{ Title: /Natural Biomedics/ },
			{
				$or: [
					{ Book: /General recommendations/ },
					{ $and: [ { Author: /Carlos/ }, { Investigator: /Robert/ } ] }
				]
			}
		]
	});
});

test('string syntax not yet supported', () => {
	expect(() => {
		advancedSearchFilter(notSupportedString);
	}).toThrowError(Error);
});
