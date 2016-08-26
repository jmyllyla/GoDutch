function Expense(payer, amount, participants, description) {
    this.payer = payer;
    this.amount = amount;
    this.description = description ? description : "";
    this.participants = participants;
}

function pluckGroups(expenses) {
    return _.pluck(expenses, "participants");
}

function allParticipants(expenses) {
    return _.uniq(_.flatten(pluckGroups(expenses)));
}

function equalCollections(a,b){
    if (a.length !== b.length)
        return false;
    return _.every(a, function(
                   item) {
                        return _.contains(b,
                            item);
                    }) && _.every(b, function(
                        item) {
                        return _.contains(a,
                            item);
                    })
}

function findGroups(expenses) {
    var expenseParticipants = pluckGroups(expenses);
    var allParticipatingPersons = allParticipants(expenses);
    return _.sortBy(_.reduce(_.union([allParticipatingPersons],
            expenseParticipants),
        function(memo, participants) {
            if (!_.some(memo, function(storedGroup) {
                    return equalCollections(storedGroup, participants);
                })) {
                memo.push(participants);
            }
            return memo;
        }, []), 'length');
}

function paymentsByParticipant(expenses) {
    return _.reduce(expenses,
        function(memo, expense) {
            var sum = memo[expense.payer] ? memo[expense.payer] : 0;
            memo[expense.payer] = sum + expense.amount;
            return memo;
        }, {});
}

function filterByParticipants(expenses, participants) {
    return _.filter(expenses, function(expense) {
        return equalCollections(expense.participants, participants);
    });
}

function calculateCreditorsDebtors(credits, debts, participants, expenses) {
    var payments = paymentsByParticipant(expenses);
    var totalCost = _.reduce(expenses, function(memo, expense) {
        return memo + expense.amount;
    }, 0);
    _.each(participants, function(participant) {
        var paymentTotal = payments[participant] ? payments[participant] :
            0;
        if (paymentTotal < totalCost / participants.length) {
            debts.push({
                debtor: participant,
                amount: totalCost / participants.length -
                    paymentTotal
            });
        } else if (paymentTotal > totalCost / participants.length) {
            credits.push({
                creditor: participant,
                amount: paymentTotal - totalCost / participants
                    .length
            });
        }
    });
}

function assign(debt, credit) {
    var assignableDebt = credit.amount > debt.amount ? debt.amount : credit.amount;
    credit.amount = credit.amount - assignableDebt;
    debt.amount = debt.amount - assignableDebt;
    return assignableDebt;
}

function assignDebtorToCreditor(optimizedDebts, debt, credit) {
    if (!optimizedDebts[debt.debtor]) {
        optimizedDebts[debt.debtor] = [];
    }
    var assignedDebt = assign(debt, credit);
    if (assignedDebt !== 0) {
        optimizedDebts[debt.debtor].push({
            to: credit.creditor,
            amount: assignedDebt,
            from: debt.debtor
        });
    }
}

function assignDebts( credits, debts) {
    var results = {};

    debts = _.sortBy(debts, 'amount').reverse();
    _.each(debts, function(debt) {
        var own = _.where(credits, {
            creditor: debt.debtor
        });
        _.each(own, function(credit) {
            assign(debt, credit);
        });
        });
    debts = _.sortBy(debts, 'amount').reverse();
    _.each(debts, function(debt) {
        var match = _.findWhere(credits, {
            amount: debt.amount
        });
        if (match) {
            assignDebtorToCreditor(results, debt, match);
        } else {
            credits = _.sortBy(credits, 'amount').reverse();
            _.each(credits, function(credit) {
                assignDebtorToCreditor(results, debt, credit);
            });
        }
    });

    return results;
}

function join(all, pot, key) {
    _.each(pot, function(item) {
        var queryObject = {};
        queryObject[key] = item[key];
        var existing = _.find(all, queryObject);
        if (existing) {
            existing.amount = existing.amount + item.amount;
        } else
            all.push(item);
    });
}

function debts(expenses) {
    var credits = [], debts = [];
    //Find out sub pots
    var pots = findGroups(expenses);
    //Iterate over them (filter and feed to below)
    _.each(pots, function(participants) {
        var listOfExpensesInPot = filterByParticipants(expenses,
            participants);
        var potCredits = [], potDebts = [];
        calculateCreditorsDebtors(potCredits, potDebts, participants,
            listOfExpensesInPot);
        //Join the debts and credits from pot to common
        join(credits, potCredits, 'creditor');
        join(debts, potDebts, 'debtor');
    });
    //Assign debts

    return assignDebts(credits, debts);
    //return results;
}