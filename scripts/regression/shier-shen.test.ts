import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PalaceCell from '../../components/PalaceCell';
import ChartBoard from '../../components/ChartBoard';
import { generateChart } from '../../lib/ziwei/algorithm';
import { BRANCHES } from '../../lib/ziwei/constants';
import {
  BOSHI_SHEN,
  BOSHI_SHEN_VI,
  JIANG_QIAN_SHEN,
  JIANG_QIAN_SHEN_VI,
  SUI_QIAN_SHEN,
  SUI_QIAN_SHEN_VI,
  boshiShenByStem,
  boshiShenName,
  boshiShenNameVi,
  jiangQianShenName,
  jiangQianShenNameVi,
  suiQianShenName,
  suiQianShenNameVi,
} from '../../lib/ziwei/shier-shen';

// ── 1. Kiểm tra tính đúng đắn công thức 3 vòng Thần Sát ──
const boshiJiaMale = boshiShenByStem(0, 'male'); // Giáp niên Dương Nam, Lộc Tồn tại Dần (2), đi thuận
assert.equal(BOSHI_SHEN[boshiJiaMale[2]], '博士');
assert.equal(BOSHI_SHEN_VI[boshiJiaMale[2]], 'Bác Sỹ', 'Giáp niên Dương Nam cung Dần phải là Bác Sỹ');
assert.equal(BOSHI_SHEN_VI[boshiJiaMale[3]], 'Lực Sĩ', 'Giáp niên Dương Nam cung Mão phải là Lực Sĩ');
assert.equal(BOSHI_SHEN_VI[boshiJiaMale[11]], 'Đại Hao', 'Giáp niên Dương Nam cung Hợi phải là Đại Hao');

const boshiJiaFemale = boshiShenByStem(0, 'female'); // Giáp niên Dương Nữ, đi nghịch
assert.equal(BOSHI_SHEN_VI[boshiJiaFemale[2]], 'Bác Sỹ', 'Giáp niên Dương Nữ cung Dần phải là Bác Sỹ');
assert.equal(BOSHI_SHEN_VI[boshiJiaFemale[1]], 'Lực Sĩ', 'Giáp niên Dương Nữ cung Sửu phải là Lực Sĩ (đi nghịch)');

const boshiYiMale = boshiShenByStem(1, 'male'); // Ất niên Âm Nam, Lộc Tồn tại Mão (3), đi nghịch
assert.equal(BOSHI_SHEN_VI[boshiYiMale[3]], 'Bác Sỹ', 'Ất niên Âm Nam cung Mão phải là Bác Sỹ');
assert.equal(BOSHI_SHEN_VI[boshiYiMale[2]], 'Lực Sĩ', 'Ất niên Âm Nam cung Dần phải là Lực Sĩ (đi nghịch)');

// Phân biệt Quan Phủ (Bác Sỹ) và Quan Phù (Tuế Tiền)
assert.equal(BOSHI_SHEN_VI[11], 'Quan Phủ', 'Vòng Bác Sỹ sao thứ 12 là Quan Phủ');
assert.equal(SUI_QIAN_SHEN_VI[4], 'Quan Phù', 'Vòng Tuế Tiền sao thứ 5 là Quan Phù');

// ── 2. Kiểm tra render tầng hiển thị 12 cung ──
// 1990-05-15 giờ Ngọ Nam: Canh Ngọ (Can=6, Chi=6), Dương Nam
const chart = generateChart({ year: 1990, month: 5, day: 15, hour: 6, gender: 'male', longitude: 105 });
assert.equal(chart.lunarInfo.yearBranch, 6, '1990 phải là năm Ngọ');
assert.equal(chart.lunarInfo.yearStem, 6, '1990 phải là năm Canh');

const suiNames = new Set<string>();
const jiangNames = new Set<string>();
const boshiNames = new Set<string>();

for (const palace of chart.palaces) {
  const shierShen = {
    boshi: boshiShenNameVi(chart.lunarInfo.yearStem, chart.birthInfo.gender, palace.branch),
    jiangQian: jiangQianShenNameVi(chart.lunarInfo.yearBranch, palace.branch),
    suiQian: suiQianShenNameVi(chart.lunarInfo.yearBranch, palace.branch),
  };
  const html = renderToStaticMarkup(React.createElement(PalaceCell, { palace, shierShen }));
  assert.match(html, new RegExp(
    `data-shier-shen="boshi"[^>]*>${shierShen.boshi}</span>` +
    `<span data-shier-shen="jiangQian"[^>]*>${shierShen.jiangQian}</span>` +
    `<span data-shier-shen="suiQian"[^>]*>${shierShen.suiQian}</span>`,
  ), `Cung ${BRANCHES[palace.branch]} phải render đủ Bác Sỹ, Tướng Tiền, Tuế Tiền`);
  suiNames.add(shierShen.suiQian);
  jiangNames.add(shierShen.jiangQian);
  boshiNames.add(shierShen.boshi);
}

assert.equal(suiNames.size, 12, 'Tuế Tiền 12 thần không được trùng lặp trên 12 cung');
assert.equal(jiangNames.size, 12, 'Tướng Tiền 12 thần không được trùng lặp trên 12 cung');
assert.equal(boshiNames.size, 12, 'Bác Sỹ 12 thần không được trùng lặp trên 12 cung');

assert.equal(suiQianShenNameVi(chart.lunarInfo.yearBranch, 6), 'Tuế Kiến', 'Năm Ngọ cung Ngọ là Tuế Kiến');
assert.equal(suiQianShenNameVi(chart.lunarInfo.yearBranch, 0), 'Tuế Phá', 'Năm Ngọ cung Tý (đối cung) là Tuế Phá');
assert.equal(jiangQianShenNameVi(chart.lunarInfo.yearBranch, 6), 'Tướng Tinh', 'Năm Ngọ (Dần Ngọ Tuất) Tướng Tinh tại Ngọ');
assert.equal(boshiShenNameVi(chart.lunarInfo.yearStem, 'male', 8), 'Bác Sỹ', 'Canh niên Lộc Tồn tại Thân, Dương Nam cung Thân là Bác Sỹ');
assert.equal(boshiShenNameVi(chart.lunarInfo.yearStem, 'male', 9), 'Lực Sĩ', 'Canh niên Dương Nam thuận hành, cung Dậu là Lực Sĩ');
assert.equal(boshiShenNameVi(chart.lunarInfo.yearStem, 'male', 6), 'Phục Binh', 'Canh niên Dương Nam cung Ngọ là Phục Binh');

// Kiểm tra ChartBoard tự động truyền 3 vòng Thần Sát bản địa hóa cho PalaceCell
const boardHtml = renderToStaticMarkup(React.createElement(ChartBoard, { chart }));
assert.match(
  boardHtml,
  /data-shier-shen="boshi"[^>]*>Phục Binh<\/span><span data-shier-shen="jiangQian"[^>]*>Tướng Tinh<\/span><span data-shier-shen="suiQian"[^>]*>Tuế Kiến<\/span>/,
  'ChartBoard phải hiển thị Phục Binh · Tướng Tinh · Tuế Kiến tại cung Ngọ'
);

// Âm Nữ thuận hành: 1991-05-15 giờ Ngọ Nữ, Tân Mùi (Can=7, Chi=7), Lộc Tồn tại Dậu (9)
const chartF = generateChart({ year: 1991, month: 5, day: 15, hour: 6, gender: 'female', longitude: 105 });
assert.equal(chartF.lunarInfo.yearStem, 7, '1991 phải là năm Tân');
assert.equal(boshiShenNameVi(chartF.lunarInfo.yearStem, 'female', 9), 'Bác Sỹ', 'Tân niên Lộc Tồn tại Dậu, Âm Nữ cung Dậu là Bác Sỹ');
assert.equal(boshiShenNameVi(chartF.lunarInfo.yearStem, 'female', 10), 'Lực Sĩ', 'Tân niên Âm Nữ thuận hành, cung Tuất là Lực Sĩ');
assert.equal(suiQianShenNameVi(chartF.lunarInfo.yearBranch, 7), 'Tuế Kiến', 'Năm Mùi cung Mùi là Tuế Kiến');

// Đảm bảo hàm tiếng Trung gốc vẫn hoạt động chuẩn xác
assert.equal(suiQianShenName(chart.lunarInfo.yearBranch, 6), '岁建');
assert.equal(jiangQianShenName(chart.lunarInfo.yearBranch, 6), '将星');
assert.equal(boshiShenName(chart.lunarInfo.yearStem, 'male', 6), '伏兵');
assert.equal(JIANG_QIAN_SHEN.length, JIANG_QIAN_SHEN_VI.length);
assert.equal(SUI_QIAN_SHEN.length, SUI_QIAN_SHEN_VI.length);
assert.equal(BOSHI_SHEN.length, BOSHI_SHEN_VI.length);

console.log('✓ Test 3 vòng Thần Sát (Bác Sỹ · Tướng Tiền · Tuế Tiền) tiếng Việt & hiển thị qua 100%!');
