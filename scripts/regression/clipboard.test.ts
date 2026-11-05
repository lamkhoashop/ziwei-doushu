import { cleanTextForCopy } from '../../lib/clipboard';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error('Assertion failed: ' + msg);
}

// 1. Basic markdown bold
const raw1 = '**【ĐỊNH TÍNH MỆNH CÁCH】**\nBản mệnh là **Tử Vi Thiên Tướng** tại Thìn.';
const cleaned1 = cleanTextForCopy(raw1);
assert(!cleaned1.includes('**'), 'Should not contain bold stars');
assert(cleaned1.includes('【ĐỊNH TÍNH MỆNH CÁCH】'), 'Should keep section headers');
assert(cleaned1.includes('Tử Vi Thiên Tướng'), 'Should keep text');

// 2. HTML tags and breaks
const raw2 = 'Dòng 1<br>Dòng 2<br />Dòng 3<p>Đoạn văn</p>';
const cleaned2 = cleanTextForCopy(raw2);
assert(!cleaned2.includes('<br>'), 'Should strip br');
assert(!cleaned2.includes('<p>'), 'Should strip p');
assert(!cleaned2.includes('</p>'), 'Should strip closing p');

// 3. Italics
const raw3 = 'Lời khuyên: *Tu dưỡng tâm tính* là gốc rễ.';
const cleaned3 = cleanTextForCopy(raw3);
assert(!cleaned3.includes('*'), 'Should strip asterisks');
assert(cleaned3.includes('Tu dưỡng tâm tính'), 'Should keep italic text');

// 4. Excess newlines
const raw4 = 'Đoạn 1\n\n\n\n\nĐoạn 2';
const cleaned4 = cleanTextForCopy(raw4);
assert(!cleaned4.includes('\n\n\n'), 'Should collapse multiple newlines');

console.log('✅ Clipboard helper tests passed!');
