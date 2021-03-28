const cargo = new window.cargoJs.Cargo({
    network: 'production'
    //network: 'development'
})
  
//const COLLECTION_ADDRESS = "0x75d6aad399b6e28692689c6029d146463a887ad4" // full 1024+ set - not a Cargo contract
//const SELLER = "0x79CC59F415039F1f91e6deE5Db40E7bb4Ab2608b"

const COLLECTION_ADDRESS = "0xe851732ef755bea13be73da12bbaada5f8c37b84" // PRODUCTION: EXCESS BITS
const SELLER = "0xC5e38233Cc0D7CFf9340e6139367aBA498EC9b18"

let saleID = '' // overwrite when found

let currentHash = "0xb643c024ce1faf6bd6b6982ce9fe06f46cc1482a270eb8388932cb0a73fbca4a" // #0/1024
let currentToken = -1

function updateHash(hash){
    hash = hash || currentHash
    if(hash.toLowerCase() === 'random'){
      hash = getRandomHash()
    }
    // validate hash
    // e.g. "0xb643c024ce1faf6bd6b6982ce9fe06f46cc1482a270eb8388932cb0a73fbca4a"
    if(hash && hash.length === 66 && hash.substr(2).split('').reduce((prev,curr)=>{ return prev && !isNaN(parseInt(curr,16)) },true) ){
        currentHash = hash
    }

    currentToken = hashList.indexOf(currentHash)

    document.getElementById('kai_token_id').innerText = currentToken !== -1 ? currentToken : '???'
    document.getElementById('kai_buy_btn').style.display = 'none' 
    document.getElementById('kai_sold_badge').style.display = 'none' 
    document.getElementById('kai_hash').innerText = currentHash.toUpperCase()

    drawToken_27(document.getElementById('canvas_1'),currentHash)
    drawToken_XS(document.getElementById('canvas_2'),currentHash)

    if(currentToken > -1){ 
        currentToken = currentToken > 0 ? currentToken : 1024 // fix ID wrap
        cargo.api.getTokenDetails(COLLECTION_ADDRESS, currentToken).then(response => {
            // Do something with response
            console.log('GET TOKEN BY ID',currentToken,response)
            if(response.data.resaleItem && response.data.resaleItem.seller === SELLER){
              console.log('FOR SALE: ',response.data.resaleItem._id)
              console.log('BY',response.data.resaleItem.seller)
              document.getElementById('kai_buy_btn').style.display = 'inline'

              saleID = response.data.resaleItem._id
            }else{
              console.log('NOT FOR SALE')
              document.getElementById('kai_sold_badge').style.display = 'inline'
            }
          })
    }
}

function getRandomHash(){
  let hash = '0x'
  for(let i=0;i<64;i++){
    hash += parseInt(Math.random()*16).toString(16)
  }
  return hash
}
function randomize(){
  updateHash(getRandomHash())
}

function buy(){
    this.lock = this.hasOwnProperty('lock') ? this.lock : false

    if(!this.lock){
      this.lock = true
      console.log('BUY - but debounced!')
      cargo.api.purchase(saleID).then(txHash => {
          // Transaction submitted
          console.log('Transacted.')
          document.getElementById('kai_buy_btn').style.display = 'none' // assume it's bought
          document.getElementById('kai_sold_badge').style.display = 'inline'
          this.lock = false
        }).catch(error=>{ 
          console.log(error)
          this.lock = false
        })
    }
}