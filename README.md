# MultiSig Smart Contract

A multi-signature contract is a smart contract designed so that multiple signatures from different addresses are needed for a transaction to be executed. This project's base concept is a part of Alchemy University's Ethereum Developer bootcamp curriculum.

## Implementation Overview:

![](multi_sig_display.png)

In the above case, the smart contract requires 2-of-3 keys signatures in order to approve and send a transaction to the Ethereum network.

With this setup, it doesn’t matter whether one individual loses their key, as there will be other individuals that can approve transactions, kick out the compromised key and re-add the compromised user under a new address.

Splitting responsibility of ownership of an address and its funds between multiple people means the multi-sig wallet is secure against a single key being the single point of failure. Even if there is a malicious party in the multi-sig contract, they would need to corrupt a majority of the holders to compromise the wallet entirely.

### Nested mapping of confirmations:

![](./multi_sig_mapping.png)

Nested `confirmations` mapping which maps the transaction Id (uint) to an owner (address) to whether or not they have confirmed the transaction (bool). In short, a transaction Id maps to a mapping of address to booleans. In the above example, the first transaction (Id 0) maps to two addresses, one of which has confirmed the transaction. The second transaction (Id 1) maps to two addresses where both have confirmed the transaction.

### `addTransaction` function:

![](./multi_sig_trxId.png)

The transaction IDs are zero-based. In the first `addTransaction`, the transaction with Id 0 is added and the `transactionCount` becomes 1.
In the next `addTransaction`, the transaction with Id 1 is added and the `transactionCount` becomes 2 and so on.

## Use cases

A multi-signature contract acts as a "wallet" as it can hold and transfer funds. It can be used as a primary wallet for an organization. This organization will have all of its funds pooled and then vote on where to spend those funds. They may direct all payments from external users/organizations to their multi-sig address.
It is called "multi-sig" because it typically needs greater than one signatures to approve any wallet activity such as transferring funds out. Since multi-sigs are powered by multiple keys, they avoid a single point of failure, which makes it significantly harder for funds to be compromised. This design provides a higher degree of security against lost or compromised keys.

Here are a few use cases that can be powered by a multi-signature smart contract wallet:

- Families: Inheritance, Wills, Approved Expenditure of House Expenses
- Businesses/Startups: Business Expenses, Treasury Management, Embezzlement Protection
- Teams/Organizations: Team Jerseys, Travel Expenses

## Unit tests using hardhat and ethers

There are 18 unit tests so far written using hardhat and ethers libraries:

![](./multi_sig_tests.png)
