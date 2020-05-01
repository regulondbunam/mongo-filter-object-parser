const { simpleSearchFilter } = require('../index');

const singleArg = 'Forward';
const excludedTerm = '-reverse';
const multiArg = 'AraC and AraD and Gene not regulon';

test('single search', () => {
	expect(simpleSearchFilter(singleArg)).toStrictEqual({ $text: { $search: ' Forward ' } });
});

test('term exclusion test', () => {
	expect(simpleSearchFilter(excludedTerm)).toStrictEqual({ $text: { $search: ' -reverse ' } });
});

test('multiple operator', () => {
	expect(simpleSearchFilter(multiArg)).toStrictEqual({ $text: { $search: ' "AraC" "AraD" "Gene" -regulon' } });
});
