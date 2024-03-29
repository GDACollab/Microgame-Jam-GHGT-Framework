/**
 * 
 * Based on {@link https://github.com/shockie/node-iniparser/blob/master/lib/node-iniparser.js}
 * 
 * @copyright Copyright (c) 2009-2010 Jordy van Gelder <jordyvangelder@gmail.com> 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @file
 */

/**
 * Based on {@link https://github.com/shockie/node-iniparser/blob/master/lib/node-iniparser.js}
 * @module configloader
 * @copyright Copyright (c) 2009-2010 Jordy van Gelder <jordyvangelder@gmail.com> 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Set of regular expressions for matching .ini patterns.
 */
var regex = {
	/**
	 * A section of: [SectionName]
	 */
	section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
	/**
	 * A parameter: name = value
	 */
	param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
	/**
	 * A comment: ;
	 */
	comment: /^\s*;.*$/,
	/**
	 * An ending comment at the end of a line: ;
	 */
	commentEOL: /\s*;.*$/,
	/**
	 * A multiline string: ``` (custom definition)
	 */
	multiline: /(```)(.*)/
};

/**
 * Parses a given ini file. Can have recursive definitions (i.e., [Object] and [Object.subobject])
 * @param {string} text 
 * @returns {Object.<string, *>} An object of ini values (and potentially subobjects).
 */
function parseIni(text){
    var value = {};
	var lines = text.split(/\r\n|\r|\n/);
	var section = null;
	var multiline = false;
	var multilineString = "";
	var multilineParam = "";
	lines.forEach(function(line){
		if (multiline && regex.multiline.test(line)) {
			multiline = !multiline;
			if (section) {
				value[section][multilineParam] = multilineString;	
			} else {
				value[multilineParam] = multilineString;
			}
		}

		if (multiline) {
			multilineString += line + "\n";
		} else if(regex.comment.test(line)){
			return;
		} else if(regex.param.test(line)){
			var match = line.match(regex.param);
			if (regex.multiline.test(line)) {
				multiline = !multiline;
				if (multiline === true) {
					multilineString = line.match(regex.multiline)[2];
					multilineParam = match[1];
				}
			} else {
				// Remove comments:
				match[2] = match[2].replace(regex.commentEOL, "");
				if(section){
					value[section][match[1]] = match[2];
				}else{
					value[match[1]] = match[2];
				}
			}
		}else if(!multiline && regex.section.test(line)){
			var match = line.match(regex.section);
			value[match[1]] = {};
			section = match[1];
		}else if(!multiline && line.length == 0 && section){
			section = null;
		};
	});

	// Add sub-sections:
	for (var sectionName in value) {
		var parentage = sectionName.split(".");
		if (parentage.length > 1){
			var section = value[sectionName];
			var traverse = value;
			parentage.forEach(function(parentName, index){
				if (traverse[parentName] === undefined) {
					traverse[parentName] = {};
				}
				if (index < parentage.length - 1) {
					traverse = traverse[parentName];
				}
			});
			traverse[parentage[parentage.length - 1]] = section;
			delete value[sectionName];
		}
	}
	return value;
}

/**
 * @param {string} link Link to the ini file.
 * @returns {Promise.<Object.<string, *>>} A parsed ini function.
 * @async
 */
async function getConfig(link){
	var data = await fetch(link);
	var text = await data.text();
	return parseIni(text);
}

/**
 * The loaded ini file.
 * Not a great solution. Should be already set up by pre-compiling/pre-parsing the data with something like Webpack. 
 */
var ini = getConfig("./jam-version-assets/config.ini");

export default ini;