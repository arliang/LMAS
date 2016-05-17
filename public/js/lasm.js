var lasm = {};

lasm.prepare = function(code) {
  return _.flatten(_.map(code.split("\n"), function(line) {
    return toyGrammar.parse(line);
  }));
};

lasm.opcodeTable = {
  ORG: {
    length: function(data) { return 0},
    translate: function(op, code) {
      return code;
    },
  },
  HEX: {
    length: function(data) {
      return data.operands.data.length;
    },
    translate: function(op, code) {
      return code.concat(op.operands.data);
    }
  },
  LOAD: {
    length: function(data) { return 1; },
    translate: function(op, code) {
      return code.push(0x1234);
    }
  },
  ADDR: {
    length: function(data) { return 1; },
    translate: function(op, code) {
      return code.push(0x1234);
    }
  }
};
lasm.assemble = function(code) {
  var lines =  lasm.prepare(code);
  var firstPass = lasm.buildSymbols(lines);
  var result = [0,firstPass.pc];
  _.each(lines, function(line) {
    if(!_.isEmpty(line)) {
      var translate = lasm.opcodeTable[line.operation].translate;
      result = translate(line, result);
    }
  });
  return Uint16Array.from(result);
};

lasm.buildSymbols = function(code) {
  var lc = 0;
  var pc = lc;
  var symbols = {};
  _.each(code, function(line) {
    if(_.isEmpty(line)) return;
    if(line.label) {
      symbols[line.label] = lc;
    }
    if(line.operation) {
      lc += lasm.opcodeTable[line.operation].length(line);
    }
    if(line.operation === "ORG") {
      if(lc === 0) {
        pc = line.operands.address;
      }
      lc = line.operands.address;
    }
  });
  return { pc: pc, symbols: symbols };
}