// SPDX-License-Identifier: Proprietary
// Copyright (c) 2026 Cosmic Souls of Sovereignty Inc. All rights reserved.
// This software is the property of Cosmic Souls of Sovereignty Inc.
/*
  ███████╗██╗   ██╗██╗
  ██╔════╝██║   ██║██║
  █████╗  ██║   ██║██║
  ██╔══╝  ╚██╗ ██╔╝██║
  ███████╗ ╚████╔╝ ███████╗
  ╚══════╝  ╚═══╝  ╚══════╝
  [ EVL Watermark - Integrity Verified ]
*/
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IERC1363Receiver
 * @dev Interface for any contract that wants to support transferAndCall or transferFromAndCall.
 */
interface IERC1363Receiver {
    function onTransferReceived(
        address operator,
        address from,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4);
}

/**
 * @title IERC1363Spender
 * @dev Interface for any contract that wants to support approveAndCall.
 */
interface IERC1363Spender {
    function onApprovalReceived(
        address owner,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4);
}

/**
 * @title LightCoin
 * @dev Enhanced ERC-20 token representing the vibrational energy of the Light matrix.
 * Implements EIP-2612 Permits, ERC-1363 Transfer & Call (incompatibility protection),
 * an active Address Poisoning Dust Shield, and a smart token recovery rescue system.
 */
contract LightCoin is ERC20, ERC20Burnable, Ownable {
    // Decimals is 18 by default in ERC20.sol

    // Token icon image URL pointing to the official app thumbnail
    string private _tokenImageURI = "https://genesis.sophiaserpent.org/app_thumbnail.jpg";

    // Faucet amount: 100 LIGHT tokens (with 18 decimals)
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;

    // Faucet cooldown: 24 hours
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    // Mapping to track the last time an address claimed from the faucet
    mapping(address => uint256) public lastClaimTime;

    // Mapping of authorized minters (e.g. the GenesisResonance NFT contract to reward creators)
    mapping(address => bool) public authorizedMinters;

    // --- LIGHT-Guard Security: Address Poisoning / Phishing Shield ---
    // Users can toggle their shield. When active, incoming dust transfers (< 0.0001 tokens)
    // from unknown senders (who the user has never sent tokens to or received from) are rejected.
    mapping(address => bool) public dustShieldEnabled;
    
    // Matrix tracking interactions to determine if a sender is trusted by a recipient.
    // hasInteracted[user][sender] = true if 'user' has initiated interaction or whitelisted 'sender'.
    mapping(address => mapping(address => bool)) public hasInteracted;

    // --- EIP-2612 Permit Variables ---
    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );
    mapping(address => uint256) private _nonces;

    // --- Events ---
    event FaucetClaimed(address indexed claimant, uint256 amount);
    event MinterStatusUpdated(address indexed minter, bool authorized);
    event TokenImageURIUpdated(string newURI);
    event DustShieldToggled(address indexed user, bool enabled);
    event InteractionRecorded(address indexed user, address indexed contact);
    event TokensRescued(address indexed token, address indexed recipient, uint256 amount);

    constructor(uint256 initialSupply) ERC20("Light Resonance Coin", "LIGHT") Ownable(msg.sender) {
        // Mint initial supply to the deployer (e.g. 1,000,000,000 tokens)
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    /**
     * @notice Mint tokens to a specific address. Restricted to authorized minters or the owner.
     * Useful to reward users when they perform on-chain actions like minting a Resonance NFT.
     */
    function mint(address to, uint256 amount) public {
        require(msg.sender == owner() || authorizedMinters[msg.sender], "LightCoin: Unauthorized caller");
        _mint(to, amount);
    }

    /**
     * @notice Claim daily LIGHT tokens from the vibrational faucet.
     */
    function claimFaucet() public {
        require(block.timestamp >= lastClaimTime[msg.sender] + FAUCET_COOLDOWN, "LightCoin: Faucet cooldown active");

        lastClaimTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);

        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @notice Update the token image URI.
     */
    function setTokenImageURI(string memory newURI) public onlyOwner {
        _tokenImageURI = newURI;
        emit TokenImageURIUpdated(newURI);
    }

    /**
     * @notice Returns the token image URI (app thumbnail) for wallets and DApps.
     */
    function tokenImageURI() public view returns (string memory) {
        return _tokenImageURI;
    }

    /**
     * @notice Authorize or revoke an address (like the GenesisResonance contract) to mint tokens.
     */
    function setMinter(address minter, bool authorized) public onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterStatusUpdated(minter, authorized);
    }

    // --- LIGHT-Guard: Dust Shield Config & Overrides ---

    /**
     * @notice Toggles the phishing/poisoning shield for the caller's address.
     */
    function toggleDustShield(bool enabled) public {
        dustShieldEnabled[msg.sender] = enabled;
        emit DustShieldToggled(msg.sender, enabled);
    }

    /**
     * @notice Manually whitelist/record an interaction with a trusted address.
     */
    function trustAddress(address contact) public {
        hasInteracted[msg.sender][contact] = true;
        emit InteractionRecorded(msg.sender, contact);
    }

    /**
     * @dev Hook that is called before any transfer of tokens.
     * Implements the Address Poisoning Dust Shield filter.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        super._update(from, to, value);

        // Record interaction upon normal outgoing transfers (user explicitly initiates a transfer)
        if (from != address(0) && to != address(0)) {
            hasInteracted[from][to] = true;
            hasInteracted[to][from] = true;
        }

        // Apply Dust Shield rules
        if (to != address(0) && dustShieldEnabled[to]) {
            // Dust threshold: 0.0001 LIGHT (10^14 wei)
            if (value < 10**14) {
                require(
                    from == address(0) || hasInteracted[to][from] || from == owner() || authorizedMinters[from],
                    "LIGHT-Guard: Blocked potential address poisoning dust transfer"
                );
            }
        }
    }

    // --- EIP-2612 Permit Implementation ---

    /**
     * @notice Returns the current nonce for `owner`. This value must be included when signature is generated.
     */
    function nonces(address owner) public view returns (uint256) {
        return _nonces[owner];
    }

    /**
     * @notice Returns the EIP-712 Domain Separator.
     */
    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name())),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /**
     * @notice Sets approval using a signed transaction payload.
     * Allows gasless approvals where user signs data and spender pays gas.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual {
        require(block.timestamp <= deadline, "LightCoin: expired deadline");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, owner, spender, value, _nonces[owner]++, deadline)
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), structHash));

        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0) && signer == owner, "LightCoin: invalid signature");

        _approve(owner, spender, value);
    }

    // --- ERC-1363 Payable Token Functions ---
    // Protects users by throwing reverts if they transfer tokens directly to 
    // smart contracts that are not configured to handle ERC-20 tokens.

    function transferAndCall(address to, uint256 value) public returns (bool) {
        return transferAndCall(to, value, "");
    }

    function transferAndCall(address to, uint256 value, bytes memory data) public returns (bool) {
        transfer(to, value);
        require(_checkOnTransferReceived(msg.sender, to, value, data), "LightCoin: transfer to non ERC1363Receiver");
        return true;
    }

    function transferFromAndCall(address from, address to, uint256 value) public returns (bool) {
        return transferFromAndCall(from, to, value, "");
    }

    function transferFromAndCall(address from, address to, uint256 value, bytes memory data) public returns (bool) {
        transferFrom(from, to, value);
        require(_checkOnTransferReceived(from, to, value, data), "LightCoin: transferFrom to non ERC1363Receiver");
        return true;
    }

    function approveAndCall(address spender, uint256 value) public returns (bool) {
        return approveAndCall(spender, value, "");
    }

    function approveAndCall(address spender, uint256 value, bytes memory data) public returns (bool) {
        approve(spender, value);
        require(_checkOnApprovalReceived(spender, value, data), "LightCoin: approve to non ERC1363Spender");
        return true;
    }

    /**
     * @dev Internal function to check if the target contract supports ERC1363Receiver callbacks.
     */
    function _checkOnTransferReceived(address from, address to, uint256 value, bytes memory data) internal returns (bool) {
        if (to.code.length == 0) {
            return true; // regular EOA, no callback needed
        }
        
        try IERC1363Receiver(to).onTransferReceived(msg.sender, from, value, data) returns (bytes4 retval) {
            return retval == IERC1363Receiver.onTransferReceived.selector;
        } catch {
            return false;
        }
    }

    /**
     * @dev Internal function to check if the target contract supports ERC1363Spender callbacks.
     */
    function _checkOnApprovalReceived(address spender, uint256 value, bytes memory data) internal returns (bool) {
        if (spender.code.length == 0) {
            return true; // regular EOA, no callback needed
        }

        try IERC1363Spender(spender).onApprovalReceived(msg.sender, value, data) returns (bytes4 retval) {
            return retval == IERC1363Spender.onApprovalReceived.selector;
        } catch {
            return false;
        }
    }

    // --- Smart Rescue System ---

    /**
     * @notice Recues stuck tokens sent accidentally to the LightCoin contract address.
     * Handles native, external ERC-20, or accidentally deposited LIGHT tokens.
     */
    function rescueTokens(address tokenAddress, address recipient, uint256 amount) public onlyOwner {
        require(recipient != address(0), "LightCoin: Cannot rescue to zero address");
        
        if (tokenAddress == address(this)) {
            // Rescue LIGHT tokens owned by the contract
            uint256 bal = balanceOf(address(this));
            require(amount <= bal, "LightCoin: Insufficient contract balance");
            _transfer(address(this), recipient, amount);
        } else if (tokenAddress == address(0)) {
            // Rescue native Ether
            uint256 ethBal = address(this).balance;
            require(amount <= ethBal, "LightCoin: Insufficient native Ether balance");
            (bool success, ) = payable(recipient).call{value: amount}("");
            require(success, "LightCoin: Ether recovery transfer failed");
        } else {
            // Rescue external ERC-20 tokens
            uint256 extBal = IERC20(tokenAddress).balanceOf(address(this));
            require(amount <= extBal, "LightCoin: Insufficient external token balance");
            SafeTransfer(tokenAddress, recipient, amount);
        }

        emit TokensRescued(tokenAddress, recipient, amount);
    }

    /**
     * @dev Safe external token transfer helper.
     */
    function SafeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "LightCoin: External transfer failed");
    }

    // Allow receiving ether (for rescue balance testing or accidental transfers)
    receive() external payable {}
}
