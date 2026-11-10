const test=require("node:test");
const assert=require("node:assert/strict");
const {resolveListenHost}=require("../src/config/listenHost");
test("desarrollo escucha solo en loopback por defecto",()=>{
  assert.equal(resolveListenHost({NODE_ENV:"development"}),"127.0.0.1");
  assert.equal(resolveListenHost({}),"127.0.0.1");
});
test("producción y HOST explícito conservan comportamiento configurable",()=>{
  assert.equal(resolveListenHost({NODE_ENV:"production"}),"0.0.0.0");
  assert.equal(resolveListenHost({HOST:"0.0.0.0"}),"0.0.0.0");
  assert.equal(resolveListenHost({NODE_ENV:"production",HOST:"127.0.0.1"}),"127.0.0.1");
});
