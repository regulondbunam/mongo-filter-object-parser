const buildFilter = require('../index');

const simpleTest = 'forward[geneInfo.strand]';
const test2Args = '(forward[geneInfo.strand]) AND reverse[geneInfo.strand]';
const test4Args = '((Carlos[Author] AND Robert[Investigator]) OR General[Book]) AND Biomedics[Title]';
const notSupportedString = '(Carlos[Author] AND Robert[Investigator]) OR (General[Book] AND Biomedics[Title])';

test('simple query object filter', () => {
	expect(buildFilter(simpleTest)).toStrictEqual({ 'geneInfo.strand': 'forward' });
});

test('filter object with 2 arguments', () => {
	expect(buildFilter(test2Args)).toStrictEqual({
		$AND: [ { 'geneInfo.strand': 'forward' }, { 'geneInfo.strand': 'reverse' } ]
	});
});

test('get correct object filter with depth of 4 arguments', () => {
	expect(buildFilter(test4Args)).toStrictEqual({
		$AND: [
			{ Title: 'Biomedics' },
			{ $OR: [ { Book: 'General' }, { $AND: [ { Author: 'Carlos' }, { Investigator: 'Robert' } ] } ] }
		]
	});
});

test('string syntax not yet supported', () => {
	expect(() => {
		buildFilter(notSupportedString);
	}).toThrowError(Error);
});
