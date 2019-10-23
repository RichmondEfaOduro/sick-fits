//describes what is going on and then your tests
describe('sample test ', () => {
  //test() same as below
  //it()
  it('works as expected', () =>{
    const age = 100;
    expect(1).toEqual(1);
    expect(age).toEqual(100);
  });

  it('handles ranges just fine', () => {
    const age = 20;
    expect(age).toBeGreaterThan(10)
  })
})