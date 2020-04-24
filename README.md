# String to filter object converter for MongoDB

With this module you can be able to make a MongoDB filter starting from a string that contains all arguments and operator, the syntax of the string will be like:

>(Value[Field]) or|and Value[Field]

*Note:* _At this time, the tree can only grow to the left, all new arguments should be added at the end_

Example: 

> ((Green[Color] or Blue[Color]) or Red[Color]) and Medium[Size]

Based on Binary Expression Tree the string will be passed to an object

![Binary expression tree](images/binaryTreeExample.png)

As a result we'll obtain an object:

```json
{
  "$and": [
    {
      "Size": "Medium"
    },
    {
      "$or": [
        {
          "Color": "Red"
        },
        {
          "$or": [
            {
              "Color": "Green"
            },
            {
              "Color": "Blue"
            }
          ]
        }
      ]
    }
  ]
}
```

### Installation

> npm install mongo-filter-object-parser



### Usage

~~~javascript
import buildFilter from "buildFilter";

string = '(Blue[Color] or Red[Color]) and Medium[Size]';
const Filter = buildFilter(string);

//use trough mongodb
const query = Collection.find(Filter);
~~~

### License

Copyright 2020 CCG UNAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
