beforeEach(function () {
  jasmine.addMatchers({
    myCrap: function () {
      return {
        compare: function (actual, expected) {
          var debts = actual;

          return {
            pass: debts === undefined || debts.length=0;
          };
        }
      };
    }
  });
});
