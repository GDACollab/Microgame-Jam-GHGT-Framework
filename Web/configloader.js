// Based on https://github.com/shockie/node-iniparser/blob/master/lib/node-iniparser.js
/*
Copyright (c) 2009-2010 Jordy van Gelder <jordyvangelder@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var regex = {
	section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
	param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
	comment: /^\s*;.*$/,
	commentEOL: /\s*;.*$/
};

function parseIni(text){
    var value = {};
	var lines = text.split(/\r\n|\r|\n/);
	var section = null;
	lines.forEach(function(line){
		if(regex.comment.test(line)){
			return;
		}else if(regex.param.test(line)){
			var match = line.match(regex.param);
			// Remove comments:
			match[2] = match[2].replace(regex.commentEOL, "");
			if(section){
				value[section][match[1]] = match[2];
			}else{
				value[match[1]] = match[2];
			}
		}else if(regex.section.test(line)){
			var match = line.match(regex.section);
			value[match[1]] = {};
			section = match[1];
		}else if(line.length == 0 && section){
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

// Own code starts here:
async function getConfig(link){
	var data = await fetch(link);
	var text = await data.text();
	return parseIni(text);
}