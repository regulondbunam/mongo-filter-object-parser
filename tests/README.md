# Mongodb object filter parser

Currently, the mongodb support 2 types of filter parser, simpleSearch and advancedSearch;

The first one focused on queries that only want to get the documents containing the term/argument that was sent in any text field, and the advanced one offers high control on the query and needs syntax like value-field as argument.

## Simple search

### Supported use-cases

- Get all documents containing one word or more in all text fields of the document.
- Can be used logical operators like AND, OR & NOT.

### Out of scope

- Advanced logic control with the use of parentheses.
- Make the query in a specific Field of the document.
- Use two or more words as one argument.



## Advanced search

### Supported use-cases

- Get documents containing the value defined in the field defined.
- Has more control at deep-level, as Binary tree expression (at this moment, tree can grow to the left).
- Can be used logical operators like AND & OR.
- Value is case insensitive.

### Out of scope

- Queries with range are not available support currently.