import { MerkleAirdrop } from "../scripts/merkle";

(async function getMerkleRoot() {
    const merkle = new MerkleAirdrop('./merkle.csv');
    await merkle.initialize();
    const root = merkle.getMerkleRoot();
    console.log({ root });
    return root;
})();