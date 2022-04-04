// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract Timelock is TimelockController {

    // minDelay 5 seconds
    constructor(address[] memory proposers, address[] memory executors) TimelockController(5, proposers, executors) {}
}