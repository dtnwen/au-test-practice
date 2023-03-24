const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Faucet function test', function() {
    async function deployContractAndSetVariables() {
        const oneEther = ethers.utils.parseEther("1");
        
        const Faucet = await ethers.getContractFactory('Faucet');

        const faucet = await Faucet.deploy({value: oneEther });

        const faucet_balance = await ethers.provider.getBalance(faucet.address)

        const [ owner, otherAccount] = await ethers.getSigners();

        const smallAmmount = ethers.utils.parseEther("0.01")

        console.log('Signer 1 address: ', owner.address);
        return { faucet, owner, oneEther, otherAccount, faucet_balance, smallAmmount };
    }

    it('0. Should deploy and set owner correctly', async function () {
        const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

        expect(await faucet.owner()).to.equal(owner.address);
    })

    it('0.1 Should set contract balance to 1 ether', async function () {
        const { faucet, oneEther } = await loadFixture(deployContractAndSetVariables);

        expect(await ethers.provider.getBalance(faucet.address)).to.equal(oneEther)
    })

    it('1.1 Should not allow withdraw', async function () {
        const { faucet, oneEther } = await loadFixture(deployContractAndSetVariables);

        await expect(faucet.withdraw(oneEther)).to.be.reverted;
    })

    it('1.2 Should allow non-owner to withdraw', async function () {
        const { faucet, otherAccount, smallAmmount } = await loadFixture(deployContractAndSetVariables);

        await expect(faucet.connect(otherAccount).withdraw(smallAmmount)).to.changeEtherBalance(otherAccount, smallAmmount);
    })

    it('2.1 Does not allow to withdraw all', async function () {
        const { faucet, otherAccount } = await loadFixture(deployContractAndSetVariables);

        await expect(faucet.connect(otherAccount).withdrawAll()).to.be.reverted;
    })

    it('2.2. Allow the owner to withdrawAll', async function () {
        const { faucet, owner, faucet_balance } = await loadFixture(deployContractAndSetVariables);
        
        await expect(faucet.withdrawAll()).to.changeEtherBalance(owner, faucet_balance);
    })

    it('3.1 Should destroy the contract', async function () {
        const { faucet } = await loadFixture(deployContractAndSetVariables);
        await faucet.selfDestruction();
        expect(await ethers.provider.getCode(faucet.address)).to.equal('0x');
    })

    it('3.2 Should transfer all balance of contract to owner', async function () {
        const { faucet, owner, faucet_balance } = await loadFixture(deployContractAndSetVariables);
        await expect(faucet.selfDestruction()).to.changeEtherBalance(owner, faucet_balance);
    })

    it('3.3 Should not be call by non-owner', async function () {
        const { faucet, otherAccount } = await loadFixture(deployContractAndSetVariables);

        await expect(faucet.connect(otherAccount).selfDestruction()).to.be.reverted;
    })
})