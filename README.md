## Project Outline

I have decided to try to build a dual-dex arbitrage bot, that trades discrepencies on price on single pairs using the FlashSwap functionality from UniswapV2.

## Example

**If Eth is 4000 on uniswap and 3900 on Sushiswap the bot should:**

withdraw USDC from Uniswap --> buy Eth on Sushiswap --> sell on Uniswap --> then pay back the amount + the swap fee.

The trade should not execute if after all fees and gas taken into account the trade is not in profit.

---

## Lesson 7: Inheritance and Interfaces in Solidity

**Objective:** This lesson dives deep into the concepts of inheritance and interfaces in Solidity, crucial for structuring complex and efficient smart contracts. Understanding these concepts will empower you to design and develop more modular, reusable, and upgradable decentralized applications (dApps).

## Part 1: Inheritance in Solidity

-   **Concept of Inheritance**:
    -   Inheritance allows a contract to acquire properties and methods of another contract. It's a fundamental principle of object-oriented programming applied within Solidity to promote code reuse and simplify maintenance.
-   **Implementing Inheritance**:
    -   Solidity supports single and multiple inheritances. Use the `is` keyword for deriving a contract from one or more parent contracts. Highlight how inherited functions can be overridden with new implementations.
-   **Visibility and Function Modifiers**:
    -   Discuss the impact of inheritance on function visibility (`public`, `private`, `internal`, `external`) and how modifiers (`virtual`, `override`) are used in the context of inherited contracts.
-   **Example of Inheritance**:

```solidity
contract Base {
    function greet() public pure virtual returns (string memory) {
        return "Hello, world!";
    }
}

contract Derived is Base {
    function greet() public pure override returns (string memory) {
        return "Hello, Solidity!";
    }
}

```

## Part 2: Interfaces in Solidity

-   **Understanding Interfaces**:
    -   Interfaces define a contract's external interface without implementing any logic. They're essential for creating flexible and interoperable contracts.
-   **Defining and Using Interfaces**:
    -   Show how to declare an interface and how contracts can implement an interface to adhere to a specific API. Interfaces ensure compatibility between different components of a dApp or between different dApps.
-   **Interfaces vs. Inheritance**:
    -   Compare and contrast interfaces with inheritance, discussing when to use each. Interfaces offer a way to enforce a contract to adhere to a certain protocol, while inheritance shares code directly between contracts.
-   **Example Using Interfaces**:

```solidity
interface IGreeter {
    function greet() external returns (string memory);
}

contract Greeter is IGreeter {
    function greet() external pure override returns (string memory) {
        return "Hello, blockchain!";
    }
}

```

## Assignments and Practical Exercises

**Assignment 1:**

Analyze a popular smart contract framework (e.g., OpenZeppelin) to identify how they use inheritance and interfaces to provide reusable contract libraries. Discuss the benefits of their approach.

**Exercise 1:**

Create a contract that inherits from multiple base contracts and also implements an interface. This exercise will help solidify your understanding of how inheritance and interfaces can work together in Solidity.

**Exercise 2:**

Design a simple dApp architecture using both inheritance and interfaces to demonstrate the modular design. For example, a voting system where base contracts provide common functionalities and interfaces ensure interoperability between different components.

This lesson aims to equip you with a deeper understanding of inheritance and interfaces in Solidity, laying the foundation for developing advanced smart contracts that are both modular and interoperable.
