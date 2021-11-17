const { textSearchFilter } = require('../index');

const properties = [ 'geneInfo.name', 'geneInfo.synonyms' ];
const simpleWord = 'arac';
const doubleSearch = 'arac and arad';
const phraseSearch = '"byosynthesis of macromolecules"';

test('simple word search, only full match', () => {
	expect(textSearchFilter(simpleWord, properties, true)).toStrictEqual({
		$or: [ { 'geneInfo.name': /\barac\b/i }, { 'geneInfo.synonyms': /\barac\b/i } ]
	});
});

test('simple word search', () => {
	expect(textSearchFilter(simpleWord, properties)).toStrictEqual({
		$or: [ { 'geneInfo.name': /\barac/i }, { 'geneInfo.synonyms': /\barac/i } ]
	});
});

test('double search, only full match', () => {
	expect(textSearchFilter(doubleSearch, properties, true)).toStrictEqual({
		$and: [
			{
				$or: [ { 'geneInfo.name': /\barad\b/i }, { 'geneInfo.synonyms': /\barad\b/i } ]
			},
			{
				$or: [ { 'geneInfo.name': /\barac\b/i }, { 'geneInfo.synonyms': /\barac\b/i } ]
			}
		]
	});
});

test('phrase search', () => {
	expect(textSearchFilter(phraseSearch, properties)).toStrictEqual({
		$or: [
			{ 'geneInfo.name': /\bbyosynthesis of macromolecules/i },
			{ 'geneInfo.synonyms': /\bbyosynthesis of macromolecules/i }
		]
	});
});
