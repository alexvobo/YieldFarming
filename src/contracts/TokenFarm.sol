pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{ 
    string public name = "Token Farm";
    address public owner;

    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    constructor (DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. Stake (Deposit)
    function stakeTokens(uint _amount) public {
    require(_amount > 0, "amount cannot be 0");
     //transfer dai to tokenfarm
     daiToken.transferFrom(msg.sender,address(this), _amount);
    //update staking balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
    // add user to stakers if they havent already staked
    if (!hasStaked[msg.sender]){
        stakers.push(msg.sender);  
    }
    //update staking statuses
    hasStaked[msg.sender] = true;
     isStaking[msg.sender] = true;
    }

    //2. Unstake (Withdraw)

 function unStakeTokens(uint _amount) public {
     uint balance = stakingBalance[msg.sender];
    //verify if we can unstake this amount
    require (_amount > 0, "amount cannot be 0");
     require(balance > 0, "balance must be greater than 0");
     require(_amount <= balance, "amount cannot be greater than the balance"); 

    //transfer dai to investor
    daiToken.transfer(msg.sender,_amount);
    //update staking balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender] - _amount;
    
    //remove user from stakers if the balance is 0, set staking status to false
    if (stakingBalance[msg.sender] == 0){
        isStaking[msg.sender] = false;
    } 
        
 }
    //3. Issuing Tokens (Called by owner)
    function issueToken() public {
        //ensure that the only person that can call issueToken is the contract owner
        require(msg.sender == owner, "caller must be the owner");
        //issue tokens to all stakers
        for (uint i = 0; i < stakers.length; i++){
            address recipient = stakers[i];
            uint recip_balance = stakingBalance[recipient];
            if (recip_balance > 0){
                dappToken.transfer(recipient, recip_balance);
            }
           
        }
    }
}