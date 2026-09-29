import { cards } from './tarot';
// Fisher–Yates: one 78-card deck per reading; cards are drawn without replacement.
function shuffledDeck(random = Math.random) {
  const deck = cards.map(c => c.id);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function threeCardReading({ reversals = false, random = Math.random } = {}) {
  const deck = shuffledDeck(random);
  return deck.slice(0, 3).map((id, index) => ({
    id, position: ['现状', '阻碍', '建议'][index],
    reversed: reversals && random() < .5
  }));
}
function readingDeck({ reversals = false, random = Math.random } = {}) {
  return shuffledDeck(random).map(id => ({id, reversed:reversals && random()<.5, selected:false}));
}
export { shuffledDeck, threeCardReading, readingDeck };
