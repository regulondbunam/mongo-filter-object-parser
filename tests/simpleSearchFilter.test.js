const { simpleSearchFilter } = require('../index');

const singleArg = 'Forward';
const excludedTerm = '-reverse';
const multiArg = 'AraC and AraD and Gene not regulon';
const multiWordsSearch = '"Regulation control design" and Book not Gene';

test('single search', () => {
	expect(simpleSearchFilter(singleArg)).toStrictEqual({ $text: { $search: 'Forward' } });
});

test('term exclusion test', () => {
	expect(simpleSearchFilter(excludedTerm)).toStrictEqual({ $text: { $search: '-reverse' } });
});

test('multiple operator', () => {
	// prettier-ignore
	expect(simpleSearchFilter(multiArg)).toStrictEqual({ $text: { $search: ' \"AraC\" \"AraD\" \"Gene\" -regulon' } });
});

test('multiple words as term', () => {
	expect(simpleSearchFilter(multiWordsSearch)).toStrictEqual({
		// prettier-ignore
		$text: { $search: ' \"Regulation control design\" \"Book\" -Gene' }
	});
});
