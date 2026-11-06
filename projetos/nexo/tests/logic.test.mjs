import test from 'node:test';
import assert from 'node:assert/strict';
import {isValidCnpj,maskCnpj,isValidPhone,maskPhone,calculateEstimate} from '../src/logic.js';
import {EXAMPLE_RATES} from '../src/config.js';

test('CNPJ accepts the official Serpro alphanumeric example and a numeric check-digit case',()=>{
  assert.equal(isValidCnpj('12.ABC.345/01DE-35'),true);
  assert.equal(isValidCnpj('12.345.678/0001-95'),true);
  assert.equal(maskCnpj('12abc34501de35'),'12.ABC.345/01DE-35');
});
test('CNPJ rejects wrong digits, missing characters and repeated zero identifiers',()=>{
  for(const value of ['12.ABC.345/01DE-34','12.345.678/0001-96','00000000000000','11111111111111','123','12ABC34501DEAB'])assert.equal(isValidCnpj(value),false,value);
});
test('Brazilian contact masks keep DDD and support an explicit country code',()=>{
  assert.equal(maskPhone('11999999999'),'(11) 99999-9999');
  assert.equal(maskPhone('+5511999999999'),'+55 (11) 99999-9999');
  assert.equal(isValidPhone('(11) 99999-9999'),true);
  assert.equal(isValidPhone('(00) 99999-9999'),false);
});
test('illustrative annual totals use the selected activity and configurable rates',()=>{
  const result=calculateEstimate({revenue:50000,activity:'servicos',regime:'simples'},EXAMPLE_RATES);
  assert.equal(result.current,93000);assert.equal(result.optimized,66000);assert.equal(result.savings,27000);
  const custom={...EXAMPLE_RATES,comercio:{simples:{current:.1,optimized:.04}}};
  assert.equal(calculateEstimate({revenue:10000,activity:'comercio',regime:'simples'},custom).savings,7200);
});
test('zero and invalid revenue never produce NaN or fictitious savings',()=>{
  for(const revenue of [0,-200,NaN,'abc']){const result=calculateEstimate({revenue,activity:'servicos',regime:'simples'},EXAMPLE_RATES);assert.equal(result.current,0);assert.equal(result.savings,0);assert.equal(result.percent,0)}
  const result=calculateEstimate({revenue:10000,activity:'servicos',regime:'mei'},EXAMPLE_RATES);assert.equal(result.current,960);assert.equal(result.current,result.optimized);assert.equal(result.savings,0);
});
