'use strict';

var toy = {};

toy.offset = {};

toy.offset.PC = 1;
toy.offset.REG = 2;
toy.offset.RAM = 18;

toy.util = {};

toy.util.slice = function(bytes, start, length) {
  var end = start + length;
  return bytes.slice(start,end);
};

toy.util.header = function(bytes) {
  return toy.util.slice(bytes,0,1);
}

toy.util.pc = function(bytes) {
  return toy.util.slice(bytes,toy.offset.PC,1);
}

toy.util.registers = function(bytes) {
  return toy.util.slice(bytes,toy.offset.REG,16);
}

toy.util.ram = function(bytes) {
  return toy.util.slice(bytes,toy.offset.RAM,256);
}

toy.util.getPcIn = function(bytes) {
  return toy.util.pc(bytes)[0];
}
toy.util.setPcIn = function(bytes, value) {
  bytes[toy.offset.PC] = value;
}

toy.util.getRegisterIn = function(bytes, register) {
  return toy.util.registers(bytes)[register];
}
toy.util.setRegisterIn = function(bytes, register, value) {
  bytes[toy.offset.REG + register] = value;
}

toy.util.getRamIn = function(bytes, address) {
  return toy.util.ram(bytes)[address];
}
toy.util.setRamIn = function(bytes, address, value) {
  bytes[toy.offset.RAM + address] = value;
}

function Toy(handlers) {
  var that = this;
  var pc = new Uint8Array(1);
  pc[0] = 0x10;
  var registers = new Uint16Array(16);
  var ram = new Uint16Array(256);
  var setRam = function(addr, value) {
    if(handlers && handlers.memoryChange) {
      handlers.memoryChange(addr,value);
    }
    ram[addr] = value;
  };
  that.pc = function() { return pc[0]; },

  that.load = function(bytes) {
    if(!(bytes instanceof Uint16Array)) {
      throw {name: "invalid", message: "invalid binary format for loading"};
    }
    if(bytes[0] === 1) {
      pc = Uint8Array.from(toy.util.pc(bytes));
      registers = Uint16Array.from(toy.util.registers(bytes));
      ram = Uint16Array.from(toy.util.ram(bytes));
    } else {
      pc = Uint8Array.from(toy.util.pc(bytes));
      _.each(bytes.slice(2), function(opcode,idx) {
        setRam(that.pc() + idx,opcode);
      });
    }
  };

  that.dump = function() {
      var result = new Uint16Array(274);
      result[0] = 1;
      result.set(pc, toy.offset.PC);
      result.set(registers, toy.offset.REG);
      result.set(ram, toy.offset.RAM);
      return result;
  };

  that.parseInstruction = function(code) {
    var matches = code.match(/^([0-9,A-F])([0-9,A-F])([0-9,A-F]{2})$/);
    return matches.slice(1);
  }
}; 

