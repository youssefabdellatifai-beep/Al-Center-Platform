const fs = require('fs');

const content = fs.readFileSync('src/components/students/StudentsTab.tsx', 'utf8');

const stack = [];
const regex = /<\/?([a-zA-Z0-9]+)[^>]*?(\/?)>/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const tagStr = match[0];
  const tagName = match[1];
  const isSelfClosing = match[2] === '/';
  const isClosingTag = tagStr.startsWith('</');

  // Skip self-closing tags and specific empty tags (like <br>, <hr>, <img>, <input>)
  if (isSelfClosing || ['br', 'hr', 'img', 'input', 'path', 'circle', 'line', 'polyline', 'rect', 'meta', 'link'].includes(tagName.toLowerCase())) {
    continue;
  }

  if (!isClosingTag) {
    stack.push({ tagName, line: content.slice(0, match.index).split('\\n').length });
  } else {
    if (stack.length === 0) {
      console.log('Unmatched closing tag:', tagName, 'at line', content.slice(0, match.index).split('\\n').length);
    } else {
      const last = stack.pop();
      if (last.tagName !== tagName) {
        console.log('Mismatched tag! Expected </' + last.tagName + '>, got </' + tagName + '> at line', content.slice(0, match.index).split('\\n').length);
      }
    }
  }
}

if (stack.length > 0) {
  console.log('Unclosed tags at end of file:', stack.map(t => t.tagName + ' at line ' + t.line).join(', '));
} else {
  console.log('JSX tags are perfectly balanced!');
}
