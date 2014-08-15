function NES() {
  this.ppu = new PPU();
  this.cpu = new CPU(this.ppu);
  this.pad1 = new Joypad();

  this.rom = null;

  this.cpu.initMemoryController(this.ppu, this.pad1);
  this.ppu.initMemoryController(this.cpu);

  this.cycle = 0;

  this.state = NES._STATE_POWER_OFF;
};

NES._STATE_POWER_OFF = 0;
NES._STATE_RUN       = 1;
NES._STATE_STOP      = 2;


// TODO: temporal
NES._PAD_BUTTON_TABLE = {
  13: Joypad._BUTTON_START,
  32: Joypad._BUTTON_SELECT,
  37: Joypad._BUTTON_LEFT,
  38: Joypad._BUTTON_UP,
  39: Joypad._BUTTON_RIGHT,
  40: Joypad._BUTTON_DOWN,
  88: Joypad._BUTTON_B,
  90: Joypad._BUTTON_A
};


NES.prototype.setROM = function(rom) {
  this.rom = rom;
  this.cpu.setROM(rom);
  this.ppu.setROM(rom);
};


NES.prototype.setDisplay = function(display) {
  this.ppu.setDisplay(display);
};


NES.prototype.setInstructionDumpFlag = function(flag) {
  this.dumpInstructions = flag;
};


NES.prototype.bootup = function() {
  this.cpu.p.store(0x34);
  this.cpu.sp.store(0xFD);
  this.cpu.interrupt(CPU._INTERRUPT_RESET);
//  nes.cpu.pc.store(0xc000);
  this.state = NES._STATE_RUN;
};


NES.prototype.stop = function() {
  this.state = NES._STATE_STOP;
};


NES.prototype.resume = function() {
  this.state = NES._STATE_RUN;
  this.run();
};


NES.prototype.run = function() {
  var cycles = 0x9000; // TODO: temporal
  for(var i = 0; i < cycles; i++) {
    this._runCycle();
  }
  if(this.state == NES._STATE_RUN)
    setTimeout(this.run.bind(this), 0);
};


NES.prototype._runCycle = function() {
  this.cpu.runCycle();
  this.ppu.runCycle();
  this.ppu.runCycle();
  this.ppu.runCycle();
};


NES.prototype.runStep = function() {
  if(this.state != NES._STATE_STOP)
    return;
  this._runCycle();
};


NES.prototype.handleKeyDown = function(e) {
  if(NES._PAD_BUTTON_TABLE[e.keyCode] != undefined)
    this.pad1.pushButton(NES._PAD_BUTTON_TABLE[e.keyCode]);
  e.preventDefault();
};


NES.prototype.handleKeyUp = function(e) {
  if(NES._PAD_BUTTON_TABLE[e.keyCode] != undefined)
    this.pad1.releaseButton(NES._PAD_BUTTON_TABLE[e.keyCode]);
  e.preventDefault();
};


NES.prototype.dumpCPU = function() {
  return this.cpu.dump();
};


NES.prototype.dumpRAM = function() {
  return this.cpu.dumpRAM();
};


NES.prototype.dumpROM = function() {
  var buffer = '';
  buffer += this.rom.dumpHeader();
  buffer += '\n';
  buffer += this.rom.dump();
  buffer += '\n';
  buffer += this.cpu.disassembleROM();
  buffer += '\n';
  return buffer;
};


NES.prototype.dumpPPU = function() {
  return this.ppu.dump();
};


NES.prototype.dumpVRAM = function() {
  return this.ppu.dumpVRAM();
};


NES.prototype.dumpSPRRAM = function() {
  return this.ppu.dumpSPRRAM();
};