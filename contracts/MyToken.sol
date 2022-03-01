pragma solidity 0.6.1;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "./ERC20Mintable.sol";

contract MyToken is ERC20Mintable, ERC20Detailed {
    constructor() ERC20Detailed("Tài mà Token", "TAIMA", 0) public {
        // _mint(msg.sender, initialSupply);
    }
}