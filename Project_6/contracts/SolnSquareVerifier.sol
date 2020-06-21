// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./ERC721Mintable.sol";

contract SolnSquareVerifier is CustomERC721Token {
    // Verifier contract
    Verifier verifier;

    // Tuple to hold a token index and token owner's address for a solution
    struct Solution {
        uint256 tokenId;
        address tokenOwner;
    }

    Solution[] public solutions;

    // Unique solutions mapping
    mapping (bytes32 => bool) private _submittedSolns;

    event Submitted(address indexed from);

    constructor (address verifierContract) public {
        verifier = Verifier(verifierContract);
    }

    /**
     * @dev Private function to add `Solution` to `solutions` array
     *
     */
    function _addSolution(uint256 i, address owner) private {
        solutions.push(
            Solution({
                tokenId: i,
                tokenOwner: owner
            })
        );

        emit Submitted(owner);
    }

    /**
     * @dev Function to mint NFTs for verified and unique solutions
     *
     */
    function mintVerified
    (
        uint256 tokenId,
        address tokenOwner,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    )
    public returns (bool)
    {
        bytes32 key = keccak256(
            abi.encodePacked(a, b, c, input)
        );

        require(!_submittedSolns[key], "SolnSquareVerifier: Solution not unique");

        bool verified = verifier.verifyTx(a, b, c, input);

        if(verified) {
            _addSolution(tokenId, tokenOwner);

            _submittedSolns[key] = true;

            bool minted = mint(tokenOwner, tokenId);
            
            return minted;
        }
        
        return false;
    }
}

abstract contract Verifier {
    function verifyTx
    (
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    )
    public virtual returns (bool r);
}