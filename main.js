Hooks.once('init', () => {
  const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  diceTypes.forEach(die => {
    game.settings.register('fixed-dice-roller', die, {
      name: `Фіксоване значення для ${die}`,
      hint: `Введіть число від 1 до ${die.slice(1)} (0 для випадкового кидка)`,
      scope: 'world',
      config: true,
      type: Number,
      default: 0,
      range: {
        min: 0,
        max: parseInt(die.slice(1))
      }
    });
  });
});

Hooks.once('ready', () => {

  const originalEvaluate = DiceTerm.prototype.evaluate;

  DiceTerm.prototype.evaluate = async function(options = {}) {
    await originalEvaluate.call(this, options);
    if(game.user.isGM) {
      const dieType = this.getDieType();
      const fixedValue = game.settings.get('fixed-dice-roller', dieType);
      if(fixedValue > 0 && fixedValue <= this.faces) {
        this.results = this.results.map(r => ({...r, result: fixedValue}));
      }
    }
    return this;
  };

  DiceTerm.prototype.getDieType = function() {
    if(this instanceof Die && this.faces === 100) return 'd100';
    if(this instanceof Die) return `d${this.faces}`;
    if(this instanceof Coin) return 'd2';
    return '';
  };
});
