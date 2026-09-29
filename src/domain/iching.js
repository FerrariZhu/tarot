// 三枚钱币起卦：正面=3，背面=2；六次投掷自下而上成卦。
// 卦序、上下卦矩阵参照《周易》六十四卦速查表：
// https://zh.wikisource.org/wiki/周易
const TRIGRAMS = [
  { name: '乾', image: '天', bits: '111' },
  { name: '兑', image: '泽', bits: '110' },
  { name: '离', image: '火', bits: '101' },
  { name: '震', image: '雷', bits: '100' },
  { name: '巽', image: '风', bits: '011' },
  { name: '坎', image: '水', bits: '010' },
  { name: '艮', image: '山', bits: '001' },
  { name: '坤', image: '地', bits: '000' }
];
const NAMES = '乾 坤 屯 蒙 需 讼 师 比 小畜 履 泰 否 同人 大有 谦 豫 随 蛊 临 观 噬嗑 贲 剥 复 无妄 大畜 颐 大过 坎 离 咸 恒 遁 大壮 晋 明夷 家人 睽 蹇 解 损 益 夬 姤 萃 升 困 井 革 鼎 震 艮 渐 归妹 丰 旅 巽 兑 涣 节 中孚 小过 既济 未济'.split(' ');
// 行为上卦，列为下卦；三位二进制均按初爻到上爻排列。
const MATRIX = [
  [1,43,14,34,9,5,26,11],
  [10,58,38,54,61,60,41,19],
  [13,49,30,55,37,63,22,36],
  [25,17,21,51,42,3,27,24],
  [44,28,50,32,57,48,18,46],
  [6,47,64,40,59,29,4,7],
  [33,31,56,62,53,39,52,15],
  [12,45,35,16,20,8,23,2]
];
const trigramByBits = Object.fromEntries(TRIGRAMS.map((item, index) => [item.bits, index]));

function lookupHexagram(bits) {
  if (!Array.isArray(bits) || bits.length !== 6 || bits.some(bit => bit !== 0 && bit !== 1)) {
    throw new Error('卦象必须包含自下而上的六条阴阳爻');
  }
  const lower = TRIGRAMS[trigramByBits[bits.slice(0, 3).join('')]];
  const upper = TRIGRAMS[trigramByBits[bits.slice(3, 6).join('')]];
  const number = MATRIX[TRIGRAMS.indexOf(upper)][TRIGRAMS.indexOf(lower)];
  return {
    number,
    name: NAMES[number - 1],
    symbol: String.fromCodePoint(0x4DC0 + number - 1),
    fullName: upper === lower
      ? `${upper.name}为${upper.image}`
      : `${upper.image}${lower.image}${NAMES[number - 1]}`,
    upper: upper.name,
    lower: lower.name,
    bits: bits.slice()
  };
}

function fromTosses(tosses) {
  if (!Array.isArray(tosses) || tosses.length !== 6) throw new Error('需要按自下而上的顺序投掷六次');
  const lines = tosses.map((coins, index) => {
    if (!Array.isArray(coins) || coins.length !== 3 || coins.some(coin => coin !== 2 && coin !== 3)) {
      throw new Error('每次投掷须记录三枚钱币，每枚为正面 3 或背面 2');
    }
    const sum = coins.reduce((a, b) => a + b, 0);
    return {
      position: index + 1,
      coins: coins.slice(),
      sum,
      yinYang: sum % 2 === 0 ? '阴' : '阳',
      moving: sum === 6 || sum === 9,
      label: ({ 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' })[sum]
    };
  });
  const originalBits = lines.map(line => line.sum % 2);
  const changedBits = lines.map(line => line.moving ? 1 - line.sum % 2 : line.sum % 2);
  const movingLines = lines.filter(line => line.moving).map(line => line.position);
  return {
    method: '三枚钱币六爻',
    lineOrder: '自下而上',
    lines,
    movingLines,
    original: lookupHexagram(originalBits),
    changed: movingLines.length ? lookupHexagram(changedBits) : null,
    // 纳甲干支属于另一套六爻排盘规则，未启用时不填造。
    najia: null
  };
}

function cast(random = Math.random) {
  return fromTosses(Array.from({ length: 6 }, () =>
    Array.from({ length: 3 }, () => random() < 0.5 ? 2 : 3)));
}

export { TRIGRAMS, lookupHexagram, fromTosses, cast };
