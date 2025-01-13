//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Storage {
    uint256 public storedNumber;

    constructor(uint256 _initialNumber) {
        storedNumber = _initialNumber;
    }

    function setNumber(uint256 _newNumber) public {
        storedNumber = _newNumber;
    }
}