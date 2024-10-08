import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture,  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { generateMerkleRoot, generateMerkleProof } from "../scripts/index";


describe("MerkleAirdrop", function () {

  describe('MerkleAirdrop', function () {
    async function deployTokenFixture() {
        const nkToken = await ethers.getContractFactory("NKToken");
        const token = await nkToken.deploy();
        return { token };
    }

    async function deployMerkleAirdrop() {
        const { token } = await loadFixture(deployTokenFixture);
        const signers = await ethers.getSigners();
        const [owner, user1] = signers;
    
    
        const merkleRoot = await generateMerkleRoot();
        const BAYC_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
        const Airdrop = await ethers.getContractFactory("MerkleAirdrop");
        const airdrop = await Airdrop.deploy(merkleRoot, token, BAYC_ADDRESS);
        const rewardAmount = ethers.parseEther("1000.0");
        
        await token.transfer(await airdrop.getAddress(), rewardAmount);

        return { token, airdrop, merkleRoot, owner, user1, BAYC_ADDRESS };
    }

  it("Should deploy with the correct parameters", async function () {
    const { token, airdrop, merkleRoot, BAYC_ADDRESS } = await loadFixture(deployMerkleAirdrop);
    expect(await airdrop.tokenAddress()).to.equal( token.target);
    expect(await airdrop.bayc()).to.equal(BAYC_ADDRESS);
    expect(await airdrop.root()).to.equal(merkleRoot);
  });


    it('Should allow eligible user to claim airdrop', async function () {
    const { airdrop, token  } = await loadFixture(deployMerkleAirdrop);

    const TOKEN_HOLDER = "0xaAa2DA255DF9Ee74C7075bCB6D81f97940908A5D";
    const BAYC_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";

    const amount = ethers.parseEther("100.0").toString();
    const proof = await generateMerkleProof(TOKEN_HOLDER, amount);

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const BAYC_Contract = await ethers.getContractAt("IERC721", BAYC_ADDRESS, impersonatedSigner);        

    console.log("BAYC Wallet Balance: "+ await BAYC_Contract.balanceOf(TOKEN_HOLDER));
    // await airdrop.connect(owner).claim(proof,  amount);
    await airdrop.connect(impersonatedSigner).claim(proof, amount);
    console.log("Token transfer completed");

    expect(await token.balanceOf(TOKEN_HOLDER)).to.equal(amount);
  });

  it("Should not allow ineligible user to claim airdrop", async function () {
    const { airdrop, user1, token  } = await loadFixture(deployMerkleAirdrop);
    const TOKEN_HOLDER = "0xaAa2DA255DF9Ee74C7075bCB6D81f97940908A5D";
    const amount = ethers.parseEther("100.0").toString();
    const proof = await generateMerkleProof(TOKEN_HOLDER, amount);

    await expect(airdrop.connect(user1).claim(proof, amount )).to.be.revertedWith("Must own a BAYC NFT");
    });

    it("Should not allow double claiming", async function () {
      const { airdrop } = await loadFixture(deployMerkleAirdrop);
      const TOKEN_HOLDER = "0xaAa2DA255DF9Ee74C7075bCB6D81f97940908A5D";
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);
      const amount = ethers.parseEther("100.0").toString();
      const proof = await generateMerkleProof(TOKEN_HOLDER, amount);

      await airdrop.connect(impersonatedSigner).claim(proof, amount);
      await expect(airdrop.connect(impersonatedSigner).claim(proof, amount)).to.be.revertedWith("Airdrop already claimed");
    });



});
});











  // it("Should not allow double claiming", async function () {
  //   const leaf = keccak256(addr1.address + "100");
  //   const proof = merkleTree.getHexProof(leaf);

  //   await airdrop.connect(addr1).claim(ethers.parseEther("100"), proof);

  //   await expect(airdrop.connect(addr1).claim(ethers.parseEther("100"), proof)).to.be.revertedWith("Airdrop already claimed");
  // });