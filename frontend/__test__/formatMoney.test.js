import formatMoney from '../lib/formatMoney';

describe('formatmoney function ', () => {
  it('works with fractional dollars', () => {
    expect(formatMoney(1)).toEqual('$0.01');
    expect(formatMoney(10)).toEqual('$0.10');
  })

  it('leaves cents off for whole dollars', () => {
    expect(formatMoney(5000)).toEqual('$50');
    expect(formatMoney(50000000)).toEqual('$500,000');
  })
  
  it('works with whole and fractional dollars', () => {
    expect(formatMoney(5001)).toEqual('$50.01');
  })
});