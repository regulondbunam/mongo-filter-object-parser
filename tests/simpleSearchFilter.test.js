const { searchFilter } = require('../index');

const singleArg = 'Forward';
const excludedTerm = '-reverse';
const multiArg = 'AraC and AraD and Gene not regulon';
const multiWordsSearch = '"Regulation control design" and Book not Gene';

test('single search', () => {
	expect(searchFilter(singleArg)).toStrictEqual({ $text: { $search: 'Forward' } });
});

test('term exclusion test', () => {
	expect(searchFilter(excludedTerm)).toStrictEqual({ $text: { $search: '-reverse' } });
});

test('multiple operator', () => {
	// prettier-ignore
	expect(searchFilter(multiArg)).toStrictEqual({ $text: { $search: ' \"AraC\" \"AraD\" \"Gene\" -regulon' } });
});

test('multiple words as term', () => {
	expect(searchFilter(multiWordsSearch)).toStrictEqual({
		// prettier-ignore
		$text: { $search: ' \"Regulation control design\" \"Book\" -Gene' }
	});
});
