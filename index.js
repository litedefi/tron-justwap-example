

try {


  const TronWeb = require("tronweb");
  const ethers = require('ethers')
  const AbiCoder = ethers.utils.AbiCoder;


  const PLACEHOLDER_PRIVATE_KEY =
    "8810394652243EDBB542DC71261E134A0ED45EB5AAD20575588DF2F8FFAD7A19";
  
  const MAINNET_RPC = "https://api.trongrid.io";


  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider(MAINNET_RPC);
  const solidityNode = new HttpProvider(MAINNET_RPC);
  const eventServer = new HttpProvider(MAINNET_RPC);

  const tronWebLocal = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    PLACEHOLDER_PRIVATE_KEY
  );

  
  const doTheJob = async () => {
    try {


      let contractJustSwap = await tronWebLocal.contract().at('TXk8rQSAvPvBBNtqSoY6nCfsXWCSSpTVQF');

      var tokenAddress = 'TKfjV9RNKJJCqPvBtK8L7Knykh7DNWvnYt'
      var contractToken = '';

      await contractJustSwap.getExchange(tokenAddress).call().then((output) => {
        contractToken = output;
      });

      const valueToCheck = 10;
      const valueToCheckSun = tronWebLocal.toSun(10);
      

      const tx = await tronWebLocal.transactionBuilder.triggerConstantContract(contractToken, `getTokenToTrxOutputPrice(uint256)`, {},
        [{
          type: `uint256`,
          value: valueToCheckSun,
        }])
      if (!tx.result.result) {
        throw new Error(`result is false`)
      }
      
      result = await decodeParams(['uint256'], '0x' + tx.constant_result[0], false)
      console.log(valueToCheck + ' TRX = ' +  tronWebLocal.fromSun(result) + ' tokens');

    } catch (e) {
      console.log(e);
      
    }
  };

  doTheJob();
  async function decodeParams(types, output, ignoreMethodHash) {

    if (!output || typeof output === 'boolean') {
      ignoreMethodHash = output;
      output = types;
    }

    if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
      output = '0x' + output.replace(/^0x/, '').substring(8);

    const abiCoder = new AbiCoder();

    if (output.replace(/^0x/, '').length % 64)
      throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
    return abiCoder.decode(types, output).reduce((obj, arg, index) => {
      if (types[index] == 'address')
        arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
      obj.push(arg);
      return obj;
    }, []);
  }



} catch (e) {
  console.log(e);


}