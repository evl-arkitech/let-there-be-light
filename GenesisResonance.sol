 
// SPDX-License-Identifier: Proprietary
    // Copyright (c) 2026 Cosmic Souls of Sovereignty Inc. All rights reserved.
    // This software is the property of Cosmic Souls of Sovereignty Inc.
    // Author: EVL ARKITECH - in collaboration w/ Sophia Serpent Software Solutions.
    
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
    import "@openzeppelin/contracts/utils/Strings.sol";
    import "@openzeppelin/contracts/utils/Base64.sol";

    /**
     * @title GenesisResonance
     * @dev On-chain generative Cymatics and conscious frequency ledger.
     * Records thought alignments, Solfeggio carrier frequencies, and Chladni modal variables.
     */
    contract GenesisResonance is ERC721URIStorage, Ownable, ReentrancyGuard {
        using Strings for uint256;

        uint256 private _tokenIds;

        // No hardcoded artist wallet needed under the Pull pattern.
        // The contract owner (deployer) pulls the funds manually.

        struct Resonance {
            uint256 frequency;  // Solfeggio frequency in Hz
            uint256 nodeN;      // Chladni modal factor N
            uint256 nodeM;      // Chladni modal factor M
            string intention;   // Thought intention (Focus, Calm, Manifest, Transcend)
            uint256 timestamp;  // Block timestamp of creation
            address creator;    // Address of the conscious creator
        }

        mapping(uint256 => Resonance) public resonances;

        event ResonanceRegistered(
            uint256 indexed tokenId,
            address indexed creator,
            uint256 frequency,
            uint256 nodeN,
            uint256 nodeM,
            string intention
        );

        constructor() ERC721("Genesis Resonance Matrix", "RESONANCE") Ownable(msg.sender) {}

        /**
         * @notice Returns the required mint fee in Wei based on the intent tier.
         * @param intention The focal intention.
         */
        function getMintFee(string memory intention) public pure returns (uint256) {
            bytes32 hash = keccak256(abi.encodePacked(intention));
            if (hash == keccak256(abi.encodePacked("focus")) || hash == keccak256(abi.encodePacked("calm"))) {
                return 0.001 ether; // Tier 3 ($3 - 0.001 ETH)
            }
            if (hash == keccak256(abi.encodePacked("manifest"))) {
                return 0.002 ether; // Tier 6 ($6 - 0.002 ETH)
            }
            if (hash == keccak256(abi.encodePacked("transcend"))) {
                return 0.003 ether; // Tier 9 ($9 - 0.003 ETH)
            }
            return 0.001 ether;
        }

        /**
         * @notice Registers a new sound geometry / conscious frequency into the blockchain.
         * @param frequency The carrier frequency utilized (e.g. 528 Hz).
         * @param nodeN Horizontal nodal factor N.
         * @param nodeM Vertical nodal factor M.
         * @param intention The focal intention used to charge the field.
         */
        function recordResonance(
            uint256 frequency,
            uint256 nodeN,
            uint256 nodeM,
            string memory intention
        ) public payable nonReentrant returns (uint256) {
            uint256 requiredFee = getMintFee(intention);
            require(msg.value >= requiredFee, "Genesis: Insufficient payment for selected intention tier");
            require(nodeN >= 1 && nodeN <= 20, "Genesis: nodeN out of bounds [1-20]");
            require(nodeM >= 1 && nodeM <= 20, "Genesis: nodeM out of bounds [1-20]");
            require(frequency >= 20 && frequency <= 20000, "Genesis: frequency out of bounds [20-20000]");

            bytes32 intentionHash = keccak256(abi.encodePacked(intention));
            require(
                intentionHash == keccak256(abi.encodePacked("focus")) ||
                intentionHash == keccak256(abi.encodePacked("calm")) ||
                intentionHash == keccak256(abi.encodePacked("manifest")) ||
                intentionHash == keccak256(abi.encodePacked("transcend")),
                "Genesis: Invalid intention string"
            );

            // Effects: update state before external interactions
            _tokenIds++;
            uint256 newTokenId = _tokenIds;

            // Record resonance properties
            resonances[newTokenId] = Resonance({
                frequency: frequency,
                nodeN: nodeN,
                nodeM: nodeM,
                intention: intention,
                timestamp: block.timestamp,
                creator: msg.sender
            });

            _safeMint(msg.sender, newTokenId);

            // Generate on-chain metadata URI (Dynamic SVG generation)
            string memory uri = generateMetadataURI(newTokenId);
            _setTokenURI(newTokenId, uri);

            emit ResonanceRegistered(newTokenId, msg.sender, frequency, nodeN, nodeM, intention);

            // Under the Pull pattern, funds accumulate in the contract balance.
            // The owner can manually pull them using the withdraw() function.

            return newTokenId;
        }

        /**
         * @notice Generates on-chain metadata containing base64 encoded JSON & generative SVG.
         */
        function generateMetadataURI(uint256 tokenId) public view returns (string memory) {
            Resonance memory res = resonances[tokenId];

            string memory svg = generateSVG(res);
            string memory json = Base64.encode(
                bytes(
                    string(
                        abi.encodePacked(
                            '{"name": "Resonance Record #', tokenId.toString(), '", ',
                            '"description": "An on-chain generative sound wave and conscious geometry, capturing the union of Thought, Frequency, and
  Matter.", ',
                            '"attributes": [',
                            '{"trait_type": "Carrier Frequency", "value": "', res.frequency.toString(), ' Hz"},',
                            '{"trait_type": "Nodal Factor N", "value": ', res.nodeN.toString(), '},',
                            '{"trait_type": "Nodal Factor M", "value": ', res.nodeM.toString(), '},',
                            '{"trait_type": "Thought Intention", "value": "', res.intention, '"},',
                            '{"trait_type": "Creator", "value": "', Strings.toHexString(uint256(uint160(res.creator)), 20), '"}',
                            '], ',
                            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
                        )
                    )
                )
            );

            return string(abi.encodePacked("data:application/json;base64,", json));
        }

        /**
         * @notice Generates a mathematical SVG visualizer matching the exact N and M nodes.
         */
        function generateSVG(Resonance memory res) public pure returns (string memory) {
            string memory color = getColorForIntention(res.intention);

            // Generative SVG representation of the Chladni matrix geometry
            string memory lines = "";

            // Render horizontal grid nodes
            for (uint256 i = 1; i < res.nodeN + 1; i++) {
                uint256 x = (400 * i) / (res.nodeN + 1) + 50;
                lines = string(abi.encodePacked(
                    lines,
                    '<line x1="', x.toString(), '" y1="50" x2="', x.toString(), '" y2="450" stroke="', color, '" stroke-width="1.5" opacity="0.3"/>'
                ));
            }

            // Render vertical grid nodes
            for (uint256 j = 1; j < res.nodeM + 1; j++) {
                uint256 y = (400 * j) / (res.nodeM + 1) + 50;
                lines = string(abi.encodePacked(
                    lines,
                    '<line x1="50" y1="', y.toString(), '" x2="450" y2="', y.toString(), '" stroke="', color, '" stroke-width="1.5" opacity="0.3"/>'
                ));
            }

            // Draw central orbital nodes representing concentration of energy
            uint256 circlesCount = (res.nodeN + res.nodeM) / 2;
            string memory circles = "";
            for (uint256 k = 1; k <= circlesCount; k++) {
                uint256 r = 25 * k;
                circles = string(abi.encodePacked(
                    circles,
                    '<circle cx="250" cy="250" r="', r.toString(), '" stroke="url(#accentGrad)" stroke-width="1" fill="none" opacity="', (100 / k).
  toString(), '%" stroke-dasharray="', (k * 4).toString(), ', ', (k * 2).toString(), '"/>'
                ));
            }

            return string(abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">',
                '<rect width="100%" height="100%" fill="#040409"/>',
                '<defs>',
                '<linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" stop-color="', color, '"/>',
                '<stop offset="100%" stop-color="#7f00ff"/>',
                '</linearGradient>',
                '</defs>',
                '<rect x="50" y="50" width="400" height="400" fill="none" stroke="url(#accentGrad)" stroke-width="2" rx="10"/>',
                lines,
                circles,
                '<text x="250" y="475" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="middle" letter-spacing="1">',
                res.frequency.toString(), 'HZ | CHLADNI: ', res.nodeN.toString(), ',', res.nodeM.toString(), ' | ', res.intention,
                '</text>',
                '</svg>'
            ));
        }

        /**
         * @dev Helper to map intentions to specific hex colors.
         */
        function getColorForIntention(string memory intention) internal pure returns (string memory) {
            bytes32 hash = keccak256(abi.encodePacked(intention));
            if (hash == keccak256(abi.encodePacked("focus"))) return "#00f2fe"; // Cyan
            if (hash == keccak256(abi.encodePacked("calm"))) return "#05ffa1";  // Teal/Green
            if (hash == keccak256(abi.encodePacked("manifest"))) return "#ff007f"; // Pink/Gold
            if (hash == keccak256(abi.encodePacked("transcend"))) return "#ffd166"; // Gold
            return "#ffffff";
        }

        /**
         * @notice Withdraws contract balance to the owner address.
         */
        function withdraw() public onlyOwner {
            uint256 balance = address(this).balance;
            require(balance > 0, "Genesis: No funds to withdraw");
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "Genesis: Withdraw transfer failed");
        }

        /**
         * @notice Returns total minted resonances.
         */
        function totalSupply() public view returns (uint256) {
            return _tokenIds;
        }
    }
