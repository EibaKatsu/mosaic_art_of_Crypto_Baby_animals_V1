const { expect } = require("chai");
const { ethers } = require("hardhat");

// 1. fixturesを使うための関数import
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CryptoBabyAnimalsMosaic test", function () {

  // 2. セットアップ処理の内容を記載。デプロイやウォレット取得を行う
  async function deployNftFixture() {
    const contractFactory = await ethers.getContractFactory("CryptoBabyAnimalsMosaic");

    const [owner, signer, tool, cbaOwner, signer2] = await ethers.getSigners();

    const contract = await contractFactory.deploy("ipfs://1234567890/");
    await contract.deployed();

    // 3. itから呼ばれた際に、返却する変数たちを定義
    return { contractFactory, contract, owner, signer, tool, cbaOwner, signer2};
  }

  it("正常系", async function () {
    // 4. loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
    const { contractFactory, contract, owner, signer, tool, cbaOwner, signer2 } = await loadFixture(deployNftFixture);

    // 名前の取得
    expect(await contract.name()).equal("Crypto Baby Animals Mosaic");

    // toolUserの設定
    await contract.setToolUser(tool.address);

    // approvedの設定
    await contract.setApproved(signer2.address);

    // メッセージハッシュの作成
    hashbytes = makeMassageBytes(1, signer.address)

    // toolユーザで署名
    let signature = await tool.signMessage(hashbytes);

    // pauseの設定
    await contract.pause(false);

    // tokenIdが存在するか
    expect(await contract.isExists(10)).equal(false);
    expect(await contract.isExists(11)).equal(false);
    expect(await contract.isExists(12)).equal(false);

    // ミント
    await contract.connect(signer).mintCBAMosaic(1, signature);

    // tokenId=10のチェック
    expect(await contract.ownerOf(10)).equal(signer.address);
    expect(await contract.tokenURI(10)).equal("ipfs://1234567890/10.json");
    expect(await contract.getApproved(10)).equal(signer2.address);

    // tokenId=11のチェック
    expect(await contract.ownerOf(11)).equal(signer.address);
    expect(await contract.tokenURI(11)).equal("ipfs://1234567890/11.json");
    expect(await contract.getApproved(11)).equal(signer2.address);

    // tokenId=11のチェック
    expect(await contract.ownerOf(12)).equal(contract.address);
    expect(await contract.tokenURI(12)).equal("ipfs://1234567890/12.json");
    expect(await contract.getApproved(12)).equal(signer2.address);

    expect(await contract.isExists(10)).equal(true);
    expect(await contract.isExists(11)).equal(true);
    expect(await contract.isExists(12)).equal(true);

    // tokenURIの変更
    await contract.setBaseURI("ipfs://2345678901/");

    // tokenURIが変更されたことのチェック
    expect(await contract.tokenURI(10)).equal("ipfs://2345678901/10.json");
    expect(await contract.tokenURI(11)).equal("ipfs://2345678901/11.json");
    expect(await contract.tokenURI(12)).equal("ipfs://2345678901/12.json");

  }
  );

  it("正常系 - 投げ銭あり", async function () {
    // 4. loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
    const { contractFactory, contract, owner, signer, tool, cbaOwner, signer2 } = await loadFixture(deployNftFixture);

    // 名前の取得
    expect(await contract.name()).equal("Crypto Baby Animals Mosaic");

    // toolUserの設定
    await contract.setToolUser(tool.address);

    // メッセージハッシュの作成
    hashbytes = makeMassageBytes(1, signer.address)

    // toolユーザで署名
    let signature = await tool.signMessage(hashbytes);

    // pauseの設定
    await contract.pause(false);
    // console.log("cont-msg:", await contract.connect(signer).testMakeMessage(1, "ipfs://1234567890/", cbaOwner.address, signer.address));
    // ミント
    await contract.connect(signer).mintCBAMosaic(1, signature, { value: ethers.utils.parseEther("1") });

    // tokenId=10のチェック
    expect(await contract.ownerOf(10)).equal(signer.address);
    expect(await contract.tokenURI(10)).equal("ipfs://1234567890/10.json");

    // tokenId=11のチェック
    expect(await contract.ownerOf(11)).equal(signer.address);
    expect(await contract.tokenURI(11)).equal("ipfs://1234567890/11.json");

    // tokenId=11のチェック
    expect(await contract.ownerOf(12)).equal(contract.address);
    expect(await contract.tokenURI(12)).equal("ipfs://1234567890/12.json");

    // 送金
    console.log("contract.balance:",await contract.testBalance());
    console.log("owner.balance:",await owner.getBalance());
    await contract.connect(owner).withdraw();
    console.log("contract.balance:",await contract.testBalance());
    console.log("owner.balance:",await owner.getBalance());
    
    // expect(owner.balance).equal(ethers.utils.parseEther("1"));

  }
  );

  it("異常系 - 1000以上のtokenId指定", async function () {
    // 4. loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
    const { contractFactory, contract, owner, signer, tool, cbaOwner, signer2 } = await loadFixture(deployNftFixture);

    // 名前の取得
    expect(await contract.name()).equal("Crypto Baby Animals Mosaic");

    // toolUserの設定
    await contract.setToolUser(tool.address);

    // メッセージハッシュの作成
    hashbytes = makeMassageBytes(1000, signer.address)

    // toolユーザで署名
    let signature = await tool.signMessage(hashbytes);

    // pauseの設定
    await contract.pause(false);
    // console.log("cont-msg:", await contract.connect(signer).testMakeMessage(1, "ipfs://1234567890/", cbaOwner.address, signer.address));
    // ミント
    await expect( contract.connect(signer).mintCBAMosaic(1000, signature, { value: ethers.utils.parseEther("1") }))
    .to.be.revertedWith('CBAs are only 999');

  }
  );

  it("異常系 - コントラクト停止中", async function () {
    // 4. loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
    const { contractFactory, contract, owner, signer, tool, cbaOwner, signer2 } = await loadFixture(deployNftFixture);

    // 名前の取得
    expect(await contract.name()).equal("Crypto Baby Animals Mosaic");

    // toolUserの設定
    await contract.setToolUser(tool.address);

    // メッセージハッシュの作成
    hashbytes = makeMassageBytes(1, signer.address)

    // toolユーザで署名
    let signature = await tool.signMessage(hashbytes);

    // pauseの設定
    await contract.pause(true);

    // ミント
    await expect(contract.connect(signer).mintCBAMosaic(1, signature))
    .to.be.revertedWith('the contract is paused');
  }
  );

  it("異常系 - 別のユーザでミント", async function () {
    // 4. loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
    const { contractFactory, contract, owner, signer, tool, cbaOwner, signer2 } = await loadFixture(deployNftFixture);

    // 名前の取得
    expect(await contract.name()).equal("Crypto Baby Animals Mosaic");

    // toolUserの設定
    await contract.setToolUser(tool.address);

    // メッセージハッシュの作成
    hashbytes = makeMassageBytes(1, signer.address)

    // toolユーザで署名
    let signature = await tool.signMessage(hashbytes);

    // pauseの設定
    await contract.pause(false);

    // ミント
    await expect(contract.connect(signer2).mintCBAMosaic(1, signature))
    .to.be.revertedWith('signature is incorrect');
  }
  );

  it("異常系 - 同じtokenIdでミント", async function () {
    // 4. loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
    const { contractFactory, contract, owner, signer, tool, cbaOwner, signer2 } = await loadFixture(deployNftFixture);

    // 名前の取得
    expect(await contract.name()).equal("Crypto Baby Animals Mosaic");

    // toolUserの設定
    await contract.setToolUser(tool.address);

    // メッセージハッシュの作成
    hashbytes = makeMassageBytes(1, signer.address)

    // toolユーザで署名
    let signature = await tool.signMessage(hashbytes);

    // pauseの設定
    await contract.pause(false);

    // ミント
    await contract.connect(signer).mintCBAMosaic(1, signature);

    // ミント2回目
    await expect(contract.connect(signer).mintCBAMosaic(1,  signature))
    .to.be.revertedWith('the tokenId is minted');

  }
  );

})

function makeMassageBytes(
  _tokenId,
  _sender) {
  let msg = String(_tokenId) + "|" +
    String(_sender).toLowerCase();

    // console.log("msg:",msg);

  return ethers.utils.arrayify(
    ethers.utils.id(msg));
}