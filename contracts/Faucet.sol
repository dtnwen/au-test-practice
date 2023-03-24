// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";

contract Faucet {
  address payable public owner;

  constructor() payable {
    owner = payable(msg.sender);
  }

  function withdraw(uint _amount) public {
    require(_amount <= 0.1 ether);
    (bool s, ) = payable(msg.sender).call{ value: _amount }("");
    require(s, "Failed to withdraw");
  }

  function withdrawAll() ownerOnly public {
    (bool s, ) = owner.call{ value: address(this).balance }("");
    require(s, "Only owner can withdraw all");
  }

  function selfDestruction() ownerOnly public {
    selfdestruct(owner);
  }

  modifier ownerOnly {
    require(msg.sender == owner);
    _;
  }

}