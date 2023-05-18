const IlluvinatiCouncil = artifacts.require('IlluvinatiCouncil');

const {
	BN, // Big Number support
	constants, // Common constants, like the zero address and largest integers
	expectEvent, // Assertions for emitted events
	expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

contract('IlluvinatiCouncil', accounts => {
	const tokenIdOne = new BN(1);
	const tokenIdTwo = new BN(2);
	const tokenIdThree = new BN(3);
	const tokenIdFour = new BN(4);
	const [ownerAddress, receiver, arb1Address, arb2Address, arb3Address, arb4Address] = accounts;
	describe('Minting', () => {
		let illuvinatiCouncil;
		beforeEach(async () => {
			illuvinatiCouncil = await IlluvinatiCouncil.new('Illuvinati Council', 'ILV-NFT', {
				from: ownerAddress,
			});
		});
		it('should enable super owner to mint a token to themselves', async () => {
			const tx = await illuvinatiCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: ownerAddress,
				tokenId: tokenIdOne,
			});
		});
		it('should enable super owner to mint a token to a second address', async () => {
			const tx = await illuvinatiCouncil.mint(receiver, tokenIdOne, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: tokenIdOne,
			});
		});
		it('should not enable super owner to mint an already existing token', async () => {
			await illuvinatiCouncil.mint(receiver, tokenIdOne, {
				from: ownerAddress,
			});
			await expectRevert(
				illuvinatiCouncil.mint(receiver, tokenIdOne, {
					from: ownerAddress,
				}),
				'Destination address already owns a token.'
			);
		});
		it('should prevent non super owner to mint to themselves', async () => {
			await expectRevert(
				illuvinatiCouncil.mint(receiver, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to mint to another address', async () => {
			await expectRevert(
				illuvinatiCouncil.mint(arb1Address, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent minting with tokenId as 0', async () => {
			await expectRevert(
				illuvinatiCouncil.mint(receiver, new BN(0), {
					from: ownerAddress,
				}),
				'Token ID must be greater than 0'
			);
		});
		it('should allow minting with tokenId as string', async () => {
			const tx = await illuvinatiCouncil.mint(receiver, '1234', {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: '1234',
			});
		});
		it('should allow minting with tokenId as a large number', async () => {
			const tx = await illuvinatiCouncil.mint(receiver, 1234, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: '1234',
			});
		});
		it('should allow batched minting', async () => {
			const tx = await illuvinatiCouncil.mintBatch(
				[receiver, arb1Address, arb2Address], [tokenIdOne, tokenIdTwo, tokenIdThree], {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: '1',
			});
			expectEvent(tx, 'Mint', {
				to: arb1Address,
				tokenId: '2',
			});
			expectEvent(tx, 'Mint', {
				to: arb2Address,
				tokenId: '3',
			});
		});
		it('should prevent allowing batched minting on input missmatch', async () => {
			await expectRevert(
				illuvinatiCouncil.mintBatch([receiver, arb1Address], [tokenIdOne, tokenIdTwo, tokenIdThree], {
					from: ownerAddress,
				}),
				'Input lengths do not match'
			);
		});
		it('should prevent minting to zero address', async () => {
			await expectRevert(
				illuvinatiCouncil.mint(constants.ZERO_ADDRESS, new BN('1234124'), {
					from: ownerAddress,
				}),
				'Method called with the zero address'
			);
		});
		it('should prevent minting an existing token to an address which does not own a token', async () => {
			const tx = await illuvinatiCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			await expectRevert(
				illuvinatiCouncil.mint(arb2Address, tokenIdOne, {
					from: ownerAddress,
				}),
				'ERC721: token already minted'
			);
		});
	});

	describe('Minting with token uri', () => {
		let illuvinatiCouncil;
		const uri = 'www.google.com';
		beforeEach(async () => {
			illuvinatiCouncil = await IlluvinatiCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
		});
		it('should enable super owner to mint a token to themselves', async () => {
			const tx = await illuvinatiCouncil.mintWithTokenURI(ownerAddress, tokenIdOne, uri, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: ownerAddress,
				tokenId: tokenIdOne,
			});
			expectEvent(tx, 'TokenURISet', {
				tokenId: tokenIdOne,
				tokenURI: uri,
			});
		});
		it('should enable super owner to mint a token to a second address', async () => {
			const tx = await illuvinatiCouncil.mintWithTokenURI(receiver, tokenIdOne, uri, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: tokenIdOne,
			});
			expectEvent(tx, 'TokenURISet', {
				tokenId: tokenIdOne,
				tokenURI: uri,
			});
		});
		it('should not enable super owner to mint an already existing token', async () => {
			await illuvinatiCouncil.mintWithTokenURI(receiver, tokenIdOne, uri, {
				from: ownerAddress,
			});
			await expectRevert(
				illuvinatiCouncil.mintWithTokenURI(receiver, tokenIdOne, uri, {
					from: ownerAddress,
				}),
				'Destination address already owns a token.'
			);
		});
		it('should prevent non super owner to mint to themselves', async () => {
			await expectRevert(
				illuvinatiCouncil.mintWithTokenURI(receiver, tokenIdOne, uri, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to mint to another address', async () => {
			await expectRevert(
				illuvinatiCouncil.mintWithTokenURI(arb1Address, tokenIdOne, uri, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent minting with tokenId as 0', async () => {
			await expectRevert(
				illuvinatiCouncil.mintWithTokenURI(receiver, new BN(0), uri, {
					from: ownerAddress,
				}),
				'Token ID must be greater than 0'
			);
		});
		it('should allow minting with tokenId as string', async () => {
			const tx = await illuvinatiCouncil.mintWithTokenURI(receiver, '1234', uri, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: '1234',
			});
		});
		it('should allow minting with tokenId as a large number', async () => {
			const tx = await illuvinatiCouncil.mintWithTokenURI(receiver, 1234, uri, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Mint', {
				to: receiver,
				tokenId: '1234',
			});
		});
		it('should prevent minting to zero address', async () => {
			await expectRevert(
				illuvinatiCouncil.mintWithTokenURI(constants.ZERO_ADDRESS, new BN('1234124'), uri, {
					from: ownerAddress,
				}),
				'Method called with the zero address'
			);
		});
		it('should prevent minting with empty uri', async () => {
			await expectRevert(
				illuvinatiCouncil.mintWithTokenURI(ownerAddress, tokenIdOne, '', {
					from: ownerAddress,
				}),
				'URI must be supplied'
			);
		});
		it('should prevent minting an existing token to an address which does not own a token', async () => {
			const tx = await illuvinatiCouncil.mintWithTokenURI(ownerAddress, tokenIdOne, uri, {
				from: ownerAddress,
			});
			await expectRevert(
				illuvinatiCouncil.mintWithTokenURI(arb2Address, tokenIdOne, uri, {
					from: ownerAddress,
				}),
				'ERC721: token already minted'
			);
		});
	});

	describe('Transferring', () => {
		let illuvinatiCouncil;
		beforeEach(async () => {
			illuvinatiCouncil = await IlluvinatiCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
			await illuvinatiCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			await illuvinatiCouncil.mint(receiver, tokenIdTwo, {
				from: ownerAddress,
			});
		});
		it('should enable super owner to transfer token they own', async () => {
			const tx = await illuvinatiCouncil.transferFrom(ownerAddress, arb1Address, tokenIdOne, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Transfer', {
				from: ownerAddress,
				to: arb1Address,
				tokenId: tokenIdOne,
			});
		});
		it('should enable super owner to transfer token someone else owns', async () => {
			const tx = await illuvinatiCouncil.transferFrom(receiver, arb1Address, tokenIdTwo, {
				from: ownerAddress,
			});
			expectEvent(tx, 'Transfer', {
				from: receiver,
				to: arb1Address,
				tokenId: tokenIdTwo,
			});
		});
		it('should prevent super owner to transfer token that is not assigned to "from" address', async () => {
			await expectRevert(
				illuvinatiCouncil.transferFrom(ownerAddress, arb1Address, tokenIdTwo, {
					from: ownerAddress,
				}),
				'From address does not own token'
			);
		});
		it('should prevent non super owner to transfer token they own', async () => {
			await expectRevert(
				illuvinatiCouncil.transferFrom(receiver, arb1Address, tokenIdTwo, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to transfer token someone else owns', async () => {
			await expectRevert(
				illuvinatiCouncil.transferFrom(ownerAddress, arb1Address, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to transfer token someone else owns by inputing their address as from', async () => {
			await expectRevert(
				illuvinatiCouncil.transferFrom(receiver, arb1Address, tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent transfer to user who already owns a token', async () => {
			await illuvinatiCouncil.mint(arb1Address, tokenIdThree, {
				from: ownerAddress,
			});
			await expectRevert(
				illuvinatiCouncil.transferFrom(arb1Address, receiver, tokenIdThree, {
					from: ownerAddress,
				}),
				'Destination address already owns a token.'
			);
		});
		it('should prevent transferring to zero address', async () => {
			await expectRevert(
				illuvinatiCouncil.transferFrom(receiver, constants.ZERO_ADDRESS, tokenIdTwo, {
					from: ownerAddress,
				}),
				'Method called with the zero address'
			);
		});
		it('should prevent transferring from the zero address', async () => {
			await expectRevert(
				illuvinatiCouncil.transferFrom(constants.ZERO_ADDRESS, receiver, new BN(5), {
					from: ownerAddress,
				}),
				'Method called with the zero address'
			);
		});
		it('should allow batched transfers', async () => {
			await illuvinatiCouncil.mint(arb1Address, tokenIdThree, {
				from: ownerAddress,
			});
			await illuvinatiCouncil.mint(arb2Address, tokenIdFour, {
				from: ownerAddress,
			});
			const tx = await illuvinatiCouncil.transferFromBatch(
				[arb1Address, arb2Address],
				[arb3Address, arb4Address],
				[tokenIdThree, tokenIdFour], {
				from: ownerAddress,
			});
			expectEvent(tx, 'Transfer', {
				from: arb1Address,
				to: arb3Address,
				tokenId: tokenIdThree,
			});
			expectEvent(tx, 'Transfer', {
				from: arb2Address,
				to: arb4Address,
				tokenId: tokenIdFour,
			});
		});
		it('should prevent allowing batched transfers on input missmatch', async () => {
			await expectRevert(
				illuvinatiCouncil.transferFromBatch([arb1Address, arb2Address], [arb3Address], [tokenIdThree, tokenIdFour], {
					from: ownerAddress,
				}),
				'Input lengths do not match'
			);
		});
	});

	describe('Burning', () => {
		let illuvinatiCouncil;
		beforeEach(async () => {
			illuvinatiCouncil = await IlluvinatiCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
			await illuvinatiCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			await illuvinatiCouncil.mint(receiver, tokenIdTwo, {
				from: ownerAddress,
			});
		});
		it('should enable super owner to burn token they own', async () => {
			const previousOwner = await illuvinatiCouncil.ownerOf.call(tokenIdOne);
			const tx = await illuvinatiCouncil.burn(tokenIdOne, { from: ownerAddress });
			expectEvent(tx, 'Burn', {
				tokenId: tokenIdOne,
			});
			assert(await illuvinatiCouncil.tokenOwned.call(previousOwner), constants.ZERO_BYTES32);
			assert(await illuvinatiCouncil.ownerOf.call(tokenIdOne), constants.ZERO_ADDRESS);
		});
		it('should enable super owner to burn token someone else owns', async () => {
			const tx = await illuvinatiCouncil.burn(tokenIdTwo, { from: ownerAddress });
			expectEvent(tx, 'Burn', {
				tokenId: tokenIdTwo,
			});
		});
		it('should prevent non super owner to burn a token they own', async () => {
			await expectRevert(
				illuvinatiCouncil.burn(tokenIdTwo, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent non super owner to burn a token someone else owns', async () => {
			await expectRevert(
				illuvinatiCouncil.burn(tokenIdOne, {
					from: receiver,
				}),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent burning a token that does not exist', async () => {
			await expectRevert(
				illuvinatiCouncil.burn(new BN(3), {
					from: ownerAddress,
				}),
				'ERC721: token does not exist'
			);
		});
		it('should delete metadata when burning a token', async () => {
			const uri = 'www.google.com';
			await illuvinatiCouncil.setTokenURI(tokenIdOne, uri, {
				from: ownerAddress,
			});
			await illuvinatiCouncil.burn(tokenIdOne, { from: ownerAddress });
			await expectRevert(illuvinatiCouncil.tokenURI(tokenIdOne), 'ERC721: token does not exist');
		});
	});

	describe('Token features', () => {
		let illuvinatiCouncil;
		beforeEach(async () => {
			illuvinatiCouncil = await IlluvinatiCouncil.new('Spartan Council', 'SC', {
				from: ownerAddress,
			});
			await illuvinatiCouncil.mint(ownerAddress, tokenIdOne, {
				from: ownerAddress,
			});
			await illuvinatiCouncil.mint(receiver, tokenIdTwo, {
				from: ownerAddress,
			});
		});
		it('should return the correct total supply', async () => {
			assert(await illuvinatiCouncil.totalSupply.call(), new BN(2));
			await illuvinatiCouncil.burn(tokenIdOne, { from: ownerAddress });
			assert(await illuvinatiCouncil.totalSupply.call(), new BN(1));
		});
		it('should allow owner setting metadata', async () => {
			const uri = 'www.google.com';
			const tx = await illuvinatiCouncil.setTokenURI(tokenIdOne, uri, {
				from: ownerAddress,
			});
			expectEvent(tx, 'TokenURISet', {
				tokenId: tokenIdOne,
				tokenURI: uri,
			});
			assert(await illuvinatiCouncil.tokenURI(tokenIdOne), uri);
		});
		it('should prevent owner setting metadata', async () => {
			const uri = 'www.google.com';
			await expectRevert(
				illuvinatiCouncil.setTokenURI(tokenIdTwo, uri, { from: receiver }),
				'Ownable: caller is not the owner.'
			);
		});
		it('should prevent setting metadata on non-existing token', async () => {
			const uri = 'www.google.com';
			await expectRevert(
				illuvinatiCouncil.setTokenURI(new BN(100), uri, { from: ownerAddress }),
				'ERC721: token does not exist'
			);
		});
		it('should return the correct balances', async () => {
			assert(await illuvinatiCouncil.balanceOf.call(arb1Address), new BN(0));
			assert(await illuvinatiCouncil.balanceOf.call(receiver), new BN(1));
		});
		it('should return the correct owner', async () => {
			assert(await illuvinatiCouncil.ownerOf.call(tokenIdOne), ownerAddress);
			assert(await illuvinatiCouncil.ownerOf.call(tokenIdTwo), receiver);
		});
		it('should prevent calling on zero address', async () => {
			await expectRevert(
				illuvinatiCouncil.balanceOf.call(constants.ZERO_ADDRESS),
				'Method called with the zero address'
			);
		});
	});
});
