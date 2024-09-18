import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import { MerkleAirdrop } from "../scripts/merkle";

async function getMerkleRoot() {
    const merkle =  await new MerkleAirdrop('./merkle.csv');
    merkle.initialize();
    return merkle.getMerkleRoot();
}




const TOKEN_ADDRESS = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';


const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {

  const merkleAirdrop = m.contract("MerkleAirdrop", [TOKEN_ADDRESS]);

  return { merkleAirdrop };
});

export default MerkleAirdropModule;
