const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, {value:'', textContent:'', innerHTML:'', addEventListener(type, fn){this[type]=fn;}, close(){}, showModal(){}, classList:{add(){},remove(){},toggle(){}}});
  return elements.get(id);
};
const storage = new Map();
const ctx = vm.createContext({console, Date, Math, Number, String, JSON, setTimeout, navigator:{},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  document:{getElementById:element, querySelector:()=>null, querySelectorAll:()=>[], createElement:()=>({set textContent(v){this.innerHTML=v;}})},
  window:{clearTimeout(){},setTimeout(){return 0;}}, confirm:()=>true});
vm.runInContext(script.slice(0,script.indexOf('  const initialBtn =')),ctx);
vm.runInContext(`
  const month = previousMonth();
  entries = [{id:'old',driver:'driver12',subject:'Alte Aufgabe',bonus:5,localDate:month+'-10',date:month+'-10T12:00:00'}];
  openSettlement();
`,ctx);
element('settlementPaid').value='9'; element('settlementDate').value=new Date().toLocaleDateString('en-CA');
element('settlementForm').submit({preventDefault(){}});
assert.equal(vm.runInContext('monthData(previousMonth()).total',ctx),15);
assert.equal(vm.runInContext('monthData(previousMonth()).paid',ctx),9);
vm.runInContext("baseSalary=100; entries[0].subject='Changed'; entries[0].bonus=50;",ctx);
assert.equal(vm.runInContext('monthData(previousMonth()).total',ctx),15);
assert.equal(vm.runInContext('monthData(previousMonth()).entries[0].subject',ctx),'Alte Aufgabe');
assert.equal(vm.runInContext("isMonthClosed(previousMonth(),'driver87')",ctx),false);
vm.runInContext("window.deleteEntry('old')",ctx);
assert.equal(vm.runInContext('entries.length',ctx),1);
vm.runInContext('reopenMonth(previousMonth())',ctx);
assert.equal(vm.runInContext('isMonthClosed(previousMonth())',ctx),false);
assert.equal(vm.runInContext('monthData(previousMonth()).base',ctx),10);
assert.equal(vm.runInContext('monthData(previousMonth()).total',ctx),60);
assert.equal(vm.runInContext('Object.keys(CHORE_NAMES).filter(k=>k.includes("app")||k.includes("podcast")).length',ctx),2);
console.log('PASS: script syntax, frozen historical values, payout, driver isolation, deletion guard, reopening, retained base salary, two new tasks.');
