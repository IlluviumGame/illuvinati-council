pragma solidity ^0.5.16;

import "openzeppelin-solidity-2.3.0/contracts/ownership/Ownable.sol";

/**
 * @title Custom NFT contract based off ERC721 but restricted by access control.
 * @dev forked from https://github.com/Synthetixio/spartan-council for
 *      https://snapshot.org/#/ilvgov.eth/proposal/0xa38a535b1d39fd50c004ea76dff7152b3e9bd77825ab8266a7f800ecdcca7030
 */
contract IlluvinatiCouncil is Ownable {
    // Event that is emitted when a new IlluvinatiCouncil token is minted
    event Mint(uint256 indexed tokenId, address to);
    // Event that is emitted when an existing IlluvinatiCouncil token is burned
    event Burn(uint256 indexed tokenId);
    // Event that is emitted when an existing IlluvinatiCouncil token is Transferred
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    // Event that is emitted when an existing IlluvinatiCouncil token's uri is altered
    event TokenURISet(uint256 tokenId, string tokenURI);

    // Array of token ids
    uint256[] public tokens;
    // Map between an owner and their tokens
    mapping(address => uint256) public tokenOwned;
    // Maps a token to the owner address
    mapping(uint256 => address) public ownerOf;
    // Optional mapping for token URIs
    mapping(uint256 => string) private tokenURIs;
    // Token name
    string public name;
    // Token symbol
    string public symbol;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     * @param _name the name of the token
     * @param _symbol the symbol of the token
     */
    constructor(string memory _name, string memory _symbol) public {
        name = _name;
        symbol = _symbol;
    }

    /**
     * @dev Modifier to check that an address is not the "0" address
     * @param to address the address to check
     */
    modifier isValidAddress(address to) {
        require(to != address(0), "Method called with the zero address");
        _;
    }

    /**
     * @dev Function to retrieve whether an address owns a token
     * @param owner address the address to check the balance of
     */
    function balanceOf(address owner) public view isValidAddress(owner) returns (uint256) {
        return tokenOwned[owner] > 0 ? 1 : 0;
    }

    /**
     * @dev Transfer function to assign a token to another address
     * Reverts if the address already owns a token
     * @param from address the address that currently owns the token
     * @param to address the address to assign the token to
     * @param tokenId uint256 ID of the token to transfer
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public isValidAddress(to) isValidAddress(from) onlyOwner {
        require(tokenOwned[to] == 0, "Destination address already owns a token");
        require(ownerOf[tokenId] == from, "From address does not own token");

        tokenOwned[from] = 0;
        tokenOwned[to] = tokenId;

        ownerOf[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev A function for batched transfers
     * @param from an array of addresses that currently own the tokens
     * @param to an array of addresses to assign the tokens to
     * @param tokenId an array of IDs of the tokens to transfer
     */
    function transferFromBatch(address[] memory from, address[] memory to, uint256[] memory tokenId) public onlyOwner {
        require(from.length == to.length && to.length == tokenId.length, "Input lengths do not match");
        for (uint256 i = 0; i < to.length; i++) {
            transferFrom(from[i], to[i], tokenId[i]);
        }
    }

    /**
     * @dev Mint function to mint a new token given a tokenId and assign it to an address
     * Reverts if the tokenId is 0 or the token already exist
     * @param to address the address to assign the token to
     * @param tokenId uint256 ID of the token to mint
     */
    function mint(address to, uint256 tokenId) public onlyOwner isValidAddress(to) {
        _mint(to, tokenId);
    }

    /**
     * @dev A function for batched minting
     * @param to an array of addresses to assign the token to
     * @param tokenId an array of ID of the tokens to mint
     */
    function mintBatch(address[] memory to, uint256[] memory tokenId) public onlyOwner {
        require(to.length == tokenId.length, "Input lengths do not match");
        for (uint256 i = 0; i < to.length; i++) {
            _mint(to[i], tokenId[i]);
        }
    }

    /**
     * @dev Mint function to mint a new token given a tokenId and assign it to an address
     * Reverts if the tokenId is 0 or the token already exist
     * @param to address the address to assign the token to
     * @param tokenId uint256 ID of the token to mint
     */
    function mintWithTokenURI(
        address to,
        uint256 tokenId,
        string memory uri
    ) public onlyOwner isValidAddress(to) {
        require(bytes(uri).length > 0, "URI must be supplied");

        _mint(to, tokenId);

        tokenURIs[tokenId] = uri;
        emit TokenURISet(tokenId, uri);
    }

    function _mint(address to, uint256 tokenId) private {
        require(tokenOwned[to] == 0, "Destination address already owns a token");
        require(ownerOf[tokenId] == address(0), "ERC721: token already minted");
        require(tokenId != 0, "Token ID must be greater than 0");

        tokens.push(tokenId);
        tokenOwned[to] = tokenId;
        ownerOf[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
        emit Mint(tokenId, to);
    }

    /**
     * @dev Burn function to remove a given tokenId
     * Reverts if the token ID does not exist.
     * @param tokenId uint256 ID of the token to burn
     */
    function burn(uint256 tokenId) public onlyOwner {
        address previousOwner = ownerOf[tokenId];
        require(previousOwner != address(0), "ERC721: token does not exist");

        delete tokenOwned[previousOwner];
        delete ownerOf[tokenId];

        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                break;
            }
        }

        tokens.pop();

        if (bytes(tokenURIs[tokenId]).length != 0) {
            delete tokenURIs[tokenId];
        }

        emit Burn(tokenId);
    }

    /**
     * @dev Function to get the total supply of tokens currently available
     */
    function totalSupply() public view returns (uint256) {
        return tokens.length;
    }

    /**
     * @dev Function to get the token URI for a given token.
     * Reverts if the token ID does not exist.
     * @param tokenId uint256 ID of the token to retrieve the uri for
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "ERC721: token does not exist");
        string memory _tokenURI = tokenURIs[tokenId];
        return _tokenURI;
    }

    /**
     * @dev Function to set the token URI for a given token.
     * Reverts if the token ID does not exist.
     * @param tokenId uint256 ID of the token to set its URI
     * @param uri string URI to assign
     */
    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        require(ownerOf[tokenId] != address(0), "ERC721: token does not exist");
        tokenURIs[tokenId] = uri;
        emit TokenURISet(tokenId, uri);
    }
}
