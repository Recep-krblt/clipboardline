'use strict';

function decodeTextFile(contents) {
  if (!Buffer.isBuffer(contents)) throw new TypeError('Text file contents must be a Buffer.');
  if (contents.length >= 2 && contents[0] === 0xff && contents[1] === 0xfe) {
    return contents.subarray(2).toString('utf16le');
  }
  const utf8 = contents.length >= 3 && contents[0] === 0xef && contents[1] === 0xbb && contents[2] === 0xbf
    ? contents.subarray(3)
    : contents;
  return utf8.toString('utf8');
}

module.exports = {decodeTextFile};
