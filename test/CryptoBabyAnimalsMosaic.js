const { expect } = require("chai");
const { ethers } = require("hardhat");

// 1. fixturesを使うための関数import
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CryptoBabyAnimalsMosaic test", function () {

  // 2. セットアップ処理の内容を記載。デプロイやウォレット取得を行う
  async function deployNftFixture() {
    const contractFactory = await ethers.getContractFactory("CryptoBabyAnimalsMosaic");

    const [owner, signer, tool, cbaOwner, signer2] = await ethers.getSigners();

    const contract = await contractFactory.deploy();
    await contract.deployed();

    // 3. itから呼ばれた際に、返却する変数たちを定義
    return { contractFactory, contract, owner, signer, tool, cbaOwner, signer2};
  }

  it("正常系", async function () {
    // 4. loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
    const { contractFactory, contract, owner, signer, tool, cbaOwner, signer2 } = await loadFixture(deployNftFixture);

    // console.log("address of owner:",owner.address);
    // console.log("address of signer:",signer.address);
    // console.log("address of tool:",tool.address);
    // console.log("address of cbaOwner:",cbaOwner.address);
    // console.log("address of signer2:",signer2.address);

    // 名前の取得
    expect(await contract.name()).equal("Crypto Baby Animals Mosaic");

    // toolUserの設定
    await contract.setToolUser(tool.address);

    // メッセージハッシュの作成
    hashbytes = makeMassageBytes(1, "ipfs://1234567890/", cbaOwner.address)

    // toolユーザで署名
    let signature = await tool.signMessage(hashbytes);

    // ミント
    await contract.mintCBAMosaic(1, "ipfs://1234567890/", cbaOwner.address, signature);

    // tokenId=10のチェック
    expect(await contract.ownerOf(10)).equal(cbaOwner.address);
    expect(await contract.tokenURI(10)).equal("ipfs://1234567890/10.json");

    // tokenId=11のチェック
    expect(await contract.ownerOf(11)).equal(owner.address);
    expect(await contract.tokenURI(11)).equal("ipfs://1234567890/11.json");

    // tokenId=11のチェック
    expect(await contract.ownerOf(12)).equal(contract.address);
    expect(await contract.tokenURI(12)).equal("ipfs://1234567890/12.json");

  });
});


function makeMassageBytes(_tokenId,
  _baseUri,
  _cbaOwner) {
  let msg = String(_tokenId) + "|" +
    String(_baseUri) + "|" +
    String(_cbaOwner).toLocaleLowerCase();

    console.log("msg:",msg);

  return ethers.utils.arrayify(
    ethers.utils.id(msg));
}