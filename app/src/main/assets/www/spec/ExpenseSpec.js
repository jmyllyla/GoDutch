
function expenseWithParticipants(participants) {
    return new Expense("test_payer", "test_amount", participants)
}

describe("Going Dutch core logic", function() {
    var larryAndMoe = ["larry", "moe"];
    var expense;
    var participants = ["larry", "moe"];
    beforeEach(function() {
        expense = new Expense("test_payer", "test_amount",
            participants);
    });
    describe("1. Payment basic information should exist", function() {
        it("should contain payer", function() {
            expect(expense.payer).toEqual("test_payer");
        });
        it("should contain amount", function() {
            expect(expense.amount).toEqual(
                "test_amount");
        });
        it("should have list of participants", function() {
            expect(expense.participants).toContain(
                "larry");
            expect(expense.participants).toContain(
                "moe");
        });
    });
    describe("2. misc helper functions", function() {
        describe("2.1 group finder", function() {
            it(
                "should be able to find participant main group and subgroup",
                function() {
                    var expenses = [
                        expenseWithParticipants(
                            ["larry", "moe"]),
                        expenseWithParticipants(
                            ["larry", "moe",
                                "curly"
                            ])
                    ];
                    var groups = findGroups(
                        expenses);
                    expect(groups).toContain([
                        "larry", "moe"
                    ]);
                    expect(groups).toContain([
                        "larry", "moe",
                        "curly"
                    ]);
                });
            it(
                "should be able to uniquely find participant groups",
                function() {
                    var expenses = [
                        expenseWithParticipants(
                            ["larry", "moe"]),
                        expenseWithParticipants(
                            ["larry", "moe"])
                    ];
                    var groups = findGroups(
                        expenses);
                    expect(groups.length).toBe(1);
                });
            it(
                "should be able to combine subgroups to common main group",
                function() {
                    var expenses = [
                        expenseWithParticipants(
                            ["larry", "moe"]),
                        expenseWithParticipants(
                            ["larry", "curly"])
                    ];
                    var groups = findGroups(
                        expenses);
                    expect(groups).toContain([
                        "larry", "moe"
                    ]);
                    expect(groups).toContain([
                        "larry", "curly"
                    ]);
                    expect(groups).toContain([
                        "larry", "moe",
                        "curly"
                    ]);
                });
            it(
                "should return the groups smallest first",
                function() {
                    var expenses = [
                        expenseWithParticipants(
                            ["larry", "moe"]),
                        expenseWithParticipants(
                            ["larry", "moe",
                                "curly"
                            ]),
                        expenseWithParticipants(
                            ["larry", "curly"])
                    ];
                    var groups = findGroups(
                        expenses);
                    expect(groups[0].length).toBe(2);
                    expect(groups[1].length).toBe(2);
                    expect(groups[2].length).toBe(3);
                });
        }); //group finder
        describe("2.2 dept calculator", function() {
            it(
                "should be able to collect the sums from expenses",
                function() {
                    var expenses = [new Expense(
                            "larry", 10, []),
                        new Expense("moe", 5, []),
                        new Expense("larry", 5, [])
                    ];
                    var sums =
                        paymentsByParticipant(
                            expenses);
                    expect(sums["larry"]).toBe(15);
                    expect(sums["moe"]).toBe(5);
                });
            it(
                "should be able to filter by participant list",
                function() {
                    var participants = ["larry",
                        "moe", "curly"
                    ];
                    var participantsSubSet = [
                        "larry", "moe"
                    ];
                    var expenses = [
                        expenseWithParticipants(
                            participants),
                        expenseWithParticipants(
                            participants),
                        expenseWithParticipants(
                            participantsSubSet)
                    ];
                    expect(filterByParticipants(
                        expenses,
                        participants).length).toBe(
                        2);
                    expect(filterByParticipants(
                            expenses,
                            participantsSubSet)
                        .length).toBe(1);
                });
            it(
                "should assign debts to creditors with the amount each has paid",
                function() {
                    var credits = [{
                        creditor: "larry",
                        amount: 5
                    }, {
                        creditor: "moe",
                        amount: 3
                    }];
                    var debts = [{
                        debtor: "curly",
                        amount: 6
                    }, {
                        debtor: "shemp",
                        amount: 2
                    }];
                    var result = assignDebts(credits,
                        debts);
                    expect(result["curly"][0]).toEqual({
                        to: "larry",
                        amount: 5
                    });
                    expect(result["curly"][1]).toEqual({
                        to: "moe",
                        amount: 1
                    });
                    expect(result["shemp"][0]).toEqual({
                        to: "moe",
                        amount: 2
                    });
                });
            it(
                "should combine own debt credit pots to minimize transactions",
                function() {
                    var credits = [{
                        creditor: "moe",
                        amount: 3
                    }, {
                        creditor: "curly",
                        amount: 2
                    }];
                    var debts = [{
                            debtor: "larry",
                            amount: 2
                        },
                        {
                            debtor: "moe",
                            amount: 3
                        }
                    ];
                    var result = assignDebts(credits,
                        debts);
                    expect(result["moe"]).toEqual([]);
                    expect(result["larry"]).toEqual([{ to: "curly", amount: 2 }]);
                });
            it(
                "should be able to join participants credits/debts from different pots together",
                function() {
                    var all = [{
                        key: "testParticipant",
                        amount: 1
                    }];
                    var pot = [{
                        key: "testParticipant",
                        amount: 1
                    }];
                    join(all, pot, "key");
                    expect(all.length).toBe(1);
                    expect(all[0].amount).toBe(2);
                });
            it(
                "should assign same amount debts to credits to minimize transactions",
                function() {
                    var credits = [{
                        creditor: "larry",
                        amount: 7
                    }, {
                        creditor: "moe",
                        amount: 3
                    }];
                    var debts = [{
                        debtor: "curly",
                        amount: 3
                    }];
                    var result = assignDebts(credits,
                        debts);
                    expect(result["curly"][0]).toEqual({
                        to: "moe",
                        amount: 3
                    });
                });
        });
    }); //describe misc
    describe("3. Larry and Moe form participants", function() {
        describe("3.1 Larry pays expense of value 10", function() {
            var expenseLarryPays = new Expense("larry",
                10, larryAndMoe);
            it("should show that Moe has one debt",
                function() {
                    var debtsOf = debts(
                        [expenseLarryPays]);

                    expect(debtsOf["moe"].length).toBe(
                        1);
                });
            it("should show that Moe ows to Larry",
                function() {
                    var debtsOf = debts(
                        [expenseLarryPays]);

                    var deptToLarry = debtsOf["moe"][0];
                    expect(deptToLarry.to).toBe(
                        "larry");
                });
            it("should show that Moe ows 5", function() {
                var debtsOf = debts(
                    [expenseLarryPays]);

                var dept = debtsOf["moe"][0];
                expect(dept.amount).toBe(5);
            });
            describe(
                "3.1.1 Moe then pays expense of value 12",
                function() {
                    it(
                        "should now show Larry ows 1 dept",
                        function() {
                            var
                                debtsOf =
                                debts([
                                    expenseLarryPays,
                                    new Expense(
                                        "moe",
                                        12,
                                        larryAndMoe)
                                ]);

                            expect(
                                debtsOf["larry"]
                                .length).toBe(
                                1);
                        });
                    it(
                        "should show that Larry ows 1",
                        function() {
                            var
                                debtsOf =
                                debts([
                                    expenseLarryPays,
                                    new Expense(
                                        "moe",
                                        12,
                                        larryAndMoe)
                                ]);

                            var dept =
                                debtsOf["larry"][0];
                            expect(dept.amount)
                                .toBe(1);
                        });
                });
        });
    });
    describe("4. Larry Moe and Curly form participants", function() {
        var all = ["larry", "moe", "curly"];
        describe("4.1 Larry pays expense of value 12", function() {
            var expenseLarryPays = new Expense("larry",
                12, all);
            var debtsOf = debts([
                expenseLarryPays
            ]);
            it("should show that Moe has one debt",
                function() {

                    expect(debtsOf["moe"].length).toBe(
                        1);
                });
            it("should show that Curly has one debt",
                function() {

                    expect(debtsOf["curly"].length).toBe(
                        1);
                });
            it("should show that Curly ows to Larry",
                function() {

                    var debtToLarry = debtsOf["curly"][
                        0];
                    expect(debtToLarry.to).toBe(
                        "larry");
                });
            it("should show that Moe ows to Larry",
                function() {
                    var deptToLarry = debtsOf["moe"][0];
                    expect(deptToLarry.to).toBe(
                        "larry");
                });
            it("should show that Moe ows 4", function() {
                var debt = debtsOf["moe"][0];
                expect(debt.amount).toBe(4);
            });
            it("should show that Curly ows 4", function() {
                var debt = debtsOf["curly"][0];
                expect(debt.amount).toBe(4);
            });
            describe("4.1.1 Moe then pays expense of value 12",
                function() {
                    var debtsOf = debts(
                        [expenseLarryPays, new Expense(
                            "moe", 12, all)]);
                    it("should now show Curly ows 2 debts",
                        function() {
                            expect(
                                debtsOf["curly"]
                                .length).toBe(
                                2);
                        });
                    it("should now show Curly ows Larry 4",
                        function() {

                            var toLarry = _.find(
                                debtsOf["curly"], {
                                    to: "larry"
                                });
                            expect(toLarry.amount)
                                .toBe(4);
                        });
                    it("should now show Curly ows Moe 4",
                        function() {
                            var toMoe = _.find(
                                debtsOf["curly"], {
                                    to: "moe"
                                });
                            expect(toMoe.amount)
                                .toBe(4);
                        });
                    it("should now show Larry and Moe have no debt",
                        function() {
                            expect(
                                debtsOf[
                                    "larry"
                                ]).toBe(
                                undefined);
                            expect(
                                    debtsOf[
                                        "moe"])
                                .toBe(undefined);
                        });
                });
            describe("4.1.2 Moe then pays expense of value 6",
                function() {
                    var debtsOf = debts(
                        [expenseLarryPays, new Expense(
                            "moe", 6, all)]);
                    it("should now show Curly ows 1 debt",
                        function() {
                            expect(
                                debtsOf["curly"]
                                .length).toBe(
                                1);
                        });
                    it("should now show Curly ows Larry 6",
                        function() {
                            var toLarry = _.find(
                                debtsOf["curly"], {
                                    to: "larry"
                                });
                            expect(toLarry.amount)
                                .toBe(6);
                        });
                    it("should now show Larry and Moe have no debt",
                        function() {
                            expect(
                                debtsOf[
                                    "larry"
                                ]).toBe(
                                undefined);
                            expect(
                                    debtsOf[
                                        "moe"])
                                .toBe(undefined);
                        });
                });
        });
        describe("4.2 Sidepots Larry pays 6, Curly not participating",
            function() {
                var debtsOf = debts([new Expense(
                    "larry", 6, larryAndMoe
                )]);
                it("should now show Moe ows 1 debt",
                    function() {
                        expect(debtsOf["moe"].length).toBe(
                            1);
                    });
                it("should now show Larry and Curly have no debt",
                    function() {
                        expect(debtsOf[
                            "larry"]).toBe(undefined);
                        expect(debtsOf[
                            "curly"]).toBe(
                            undefined);
                    });
                describe("4.2.1 Larry pays again 6, Moe not participating",
                    function() {
                        var debtsOf = debts(
                            [new Expense("larry", 6, larryAndMoe),
                                new Expense(
                                    "larry", 6, [
                                        "larry",
                                        "curly"
                                    ])
                            ]);
                        it("should now show Moe ows 1 debt",
                            function() {
                                expect(debtsOf["moe"].length)
                                    .toBe(1);
                            });
                        it("should now show Moe ows Larry 3",
                            function() {
                                var toLarry = _.find(
                                    debtsOf["moe"], {
                                        to: "larry"
                                    });
                                expect(toLarry.amount)
                                    .toBe(3);
                            });
                        it("should now show Curly ows 1 debt",
                            function() {
                                expect(
                                    debtsOf["curly"]
                                    .length).toBe(
                                    1);
                            });
                        it("should now show Curly ows Larry 3",
                            function() {
                               var toLarry = _.find(
                                    debtsOf["curly"], {
                                        to: "larry"
                                    });
                                expect(toLarry.amount)
                                    .toBe(3);
                            });
                        describe("4.2.1.1 Moe pays 6, Larry not participating",
                            function() {
                                var
                                    debtsOf =
                                    debts([new Expense(
                                            "larry",
                                            6, larryAndMoe),
                                        new Expense(
                                            "larry",
                                            6, [
                                                "larry",
                                                "curly"
                                            ]),
                                        new Expense(
                                            "moe",
                                            6, [
                                                "moe",
                                                "curly"
                                            ])
                                    ]);
                                it("should now show Larry and Moe have no debt",
                                    function() {
                                        expect(
                                            debtsOf[
                                                "larry"
                                            ]
                                        ).toBe(
                                            undefined
                                        );
                                        expect(
                                            debtsOf[
                                                "moe"
                                            ]
                                        ).toEqual(
                                            []
                                        );
                                    });
                                it("should now show Curly ows Larry 6",
                                    function() {
                                        var toLarry =
                                            _.find(
                                                debtsOf["curly"],
                                                {
                                                    to: "larry"
                                                }
                                            );
                                        expect(
                                            toLarry
                                            .amount
                                        ).toBe(
                                            6
                                        );
                                    });
                            });
                        describe("4.2.1.1 Curly pays 6, Larry not participating",
                            function() {
                                var
                                    debtsOf =
                                    debts([new Expense(
                                            "larry",
                                            6, larryAndMoe),
                                        new Expense(
                                            "larry",
                                            6, [
                                                "larry",
                                                "curly"
                                            ]),
                                        new Expense(
                                            "curly",
                                            6, [
                                                "moe",
                                                "curly"
                                            ])
                                    ]);
                                it("should now show Larry and Curly have no debt",
                                    function() {
                                        expect(
                                            debtsOf[
                                                "larry"
                                            ]
                                        ).toBe( undefined);
                                        expect(
                                            debtsOf[
                                                "curly"
                                            ]
                                        ).toEqual(
                                            []
                                        );
                                    });
                                it("should now show Moe ows Larry 6",
                                    function() {
                                        var toLarry =
                                            _.find(
                                                debtsOf["moe"], {
                                                    to: "larry"
                                                }
                                            );
                                        expect(
                                            toLarry.amount
                                        ).toBe(
                                            6
                                        );
                                    });
                            });
                    });
            });
    });
});