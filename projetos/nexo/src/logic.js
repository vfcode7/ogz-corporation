export const brl = (value, decimals=0) => Number(value || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:decimals,maximumFractionDigits:decimals});
export const cleanCnpj = value => String(value).toUpperCase().replace(/[^A-Z0-9]/g,'');

// Receita Federal / Serpro: módulo 11 e valores ASCII - 48, inclusive CNPJ alfanumérico.
// https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf
export function isValidCnpj(value) {
  const cnpj=cleanCnpj(value);
  if(!/^[A-Z0-9]{12}\d{2}$/.test(cnpj) || /^(.)\1{13}$/.test(cnpj))return false;
  const digit=base=>{let sum=0,weight=2;for(let i=base.length-1;i>=0;i--){sum+=(base.charCodeAt(i)-48)*weight;weight=weight===9?2:weight+1}const rest=sum%11;return rest<2?'0':String(11-rest)};
  const first=digit(cnpj.slice(0,12));
  return cnpj.slice(12)===first+digit(cnpj.slice(0,12)+first);
}
export function maskCnpj(value){const c=cleanCnpj(value).slice(0,14);return c.replace(/^(.{2})(.)/,'$1.$2').replace(/^(.{6})(.)/,'$1.$2').replace(/^(.{10})(.)/,'$1/$2').replace(/^(.{15})(.)/,'$1-$2')}
export function maskPhone(value){let d=String(value).replace(/\D/g,'');const intl=d.startsWith('55')&&d.length>11;if(intl)d=d.slice(2);d=d.slice(0,11);let result=d;if(d.length>2)result=`(${d.slice(0,2)}) ${d.slice(2)}`;if(d.length>6){const split=d.length===11?7:6;result=`(${d.slice(0,2)}) ${d.slice(2,split)}-${d.slice(split)}`}return (intl?'+55 ':'')+result}
export const isValidPhone=value=>/^(?:55)?[1-9]{2}\d{8,9}$/.test(String(value).replace(/\D/g,''));

// An illustrative model, deliberately isolated from UI and official tax calculations.
export function calculateEstimate({revenue,activity,regime},rates){
  const monthly=Math.min(1000000,Math.max(0,Number(revenue)||0));
  const annual=monthly*12;
  let current,optimized,currentRate,optimizedRate;
  if(regime==='mei'){
    current=monthly===0?0:rates.mei.monthlyFixed*12;optimized=current;
    currentRate=annual?current/annual:0;optimizedRate=currentRate;
  }else{
    const pair=rates[activity]?.[regime];if(!pair)throw new RangeError('Cenário não disponível.');
    currentRate=pair.current;optimizedRate=pair.optimized;current=annual*currentRate;optimized=annual*optimizedRate;
  }
  const savings=Math.max(0,current-optimized);
  return {monthly,annual,current,optimized,currentRate,optimizedRate,savings,percent:current?savings/current*100:0,regime,activity};
}
