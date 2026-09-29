import zhouyiText from './zhouyi-text';

const SYSTEM_PROMPT = [
  '你是“解忧小卖部”的解读员。请用简体中文，像认真、温和的朋友一样说明占卜结果。',
  '占卜用于自我整理与娱乐，不把象征说成确定的未来，不声称能读出他人真实想法。',
  '只依据用户问题和传入的牌、卦及原文解读；不要添加不存在的牌、爻、天干地支或古籍引文。',
  '若问题涉及健康、法律、投资等重要决定，给出审慎的现实核查建议，不作诊断或收益保证。',
  '返回严格 JSON，不要 Markdown 或代码块。字段必须为 summary、details、actions、sourceNote。',
  'summary 为一句话核心解读；details 为 2 到 4 条清楚的短句数组；actions 为 1 到 3 条可执行建议数组；sourceNote 说明使用了哪些牌义或卦爻辞。'
].join('\n');

const ICHING_TEMPLATE = [
  '解读类型：周易三枚钱币六爻。',
  '主题：{{TOPIC}}',
  '用户问题：{{QUESTION}}',
  '起卦结果 JSON：{{RESULT}}',
  '本卦卦辞：{{ORIGINAL_GUACI}}',
  '动爻爻辞：{{MOVING_YAOCI}}',
  '变卦卦辞：{{CHANGED_GUACI}}',
  '请先说明本卦反映的当下，再结合动爻指出变化点；有变卦时说明可能的发展方向。没有动爻时只解读本卦。',
  '古文要用现代白话转述，不照搬晦涩字句；保留不确定性，最后落到具体可做的一小步。'
].join('\n');

const TAROT_TEMPLATE = [
  '解读类型：三张塔罗，牌位依次为现状、阻碍、建议。',
  '主题：{{TOPIC}}',
  '用户问题：{{QUESTION}}',
  '抽牌结果 JSON：{{RESULT}}',
  '逐张解释牌位和正逆位如何与问题相关，再综合三张牌给出清楚、可实践的建议。',
  '传入的牌义是参考，不要将逆位机械解释成灾祸，也不要作确定的未来预言。'
].join('\n');

function fill(template, values) {
  return template.replace(/{{([A-Z_]+)}}/g, (_, key) => {
    if (!(key in values)) throw new Error(`缺少提示词字段：${key}`);
    return typeof values[key] === 'string' ? values[key] : JSON.stringify(values[key]);
  });
}

function textFor(hexagram) {
  const entry = zhouyiText[hexagram.number - 1];
  if (!entry || entry.number !== hexagram.number) {
    throw new Error('卦象与卦爻辞资料不一致');
  }
  return entry;
}

function buildIChingPrompt(result, question, topic = '日常') {
  const original = textFor(result.original);
  const changed = result.changed ? textFor(result.changed) : null;
  const movingTexts = result.movingLines.map(position => ({
    position,
    text: original.yaoci[position - 1]
  }));
  // 乾坤六爻全动时，附上其独有的用九／用六原文。
  if (result.movingLines.length === 6 && (original.number === 1 || original.number === 2)) {
    movingTexts.push({ position: '特例', text: original.yaoci[6] });
  }
  return {
    system: SYSTEM_PROMPT,
    user: fill(ICHING_TEMPLATE, {
      TOPIC: topic,
      QUESTION: question || '请帮我理解这次起卦。',
      RESULT: result,
      ORIGINAL_GUACI: original.guaci,
      MOVING_YAOCI: movingTexts.length ? movingTexts : '无动爻',
      CHANGED_GUACI: changed ? changed.guaci : '无变卦'
    })
  };
}

function buildTarotPrompt(cards, question, topic = '日常') {
  if (!Array.isArray(cards) || cards.length !== 3 ||
      cards.map(card => card.position).join(',') !== '现状,阻碍,建议') {
    throw new Error('塔罗结果须为现状、阻碍、建议三张牌');
  }
  return {
    system: SYSTEM_PROMPT,
    user: fill(TAROT_TEMPLATE, {
      TOPIC: topic,
      QUESTION: question || '请帮我理解这次抽牌。',
      RESULT: cards
    })
  };
}

function normalizeReading(value) {
  const raw = typeof value === 'string' ? JSON.parse(value.replace(/^```(?:json)?\s*|\s*```$/g, '')) : value;
  if (!raw || typeof raw.summary !== 'string' || !Array.isArray(raw.details) ||
      !Array.isArray(raw.actions) || typeof raw.sourceNote !== 'string') {
    throw new Error('模型返回的解读格式不正确');
  }
  return {
    summary: raw.summary.trim(),
    details: raw.details.filter(item => typeof item === 'string').slice(0, 4),
    actions: raw.actions.filter(item => typeof item === 'string').slice(0, 3),
    sourceNote: raw.sourceNote.trim()
  };
}


export { buildIChingPrompt, buildTarotPrompt, normalizeReading };
