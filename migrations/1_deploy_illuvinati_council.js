const IlluvinatiCouncil = artifacts.require('IlluvinatiCouncil');

module.exports = function(deployer) {
	deployer.deploy(IlluvinatiCouncil, 'Illuvium Sub-Council', 'ILV-NFT');
};
