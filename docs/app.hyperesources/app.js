const cargo = new window.cargoJs.Cargo({
    //network: 'production'
    network: 'development'
})
  
const COLLECTION_ADDRESS = "0x75d6aad399b6e28692689c6029d146463a887ad4" // full 1024+ set - not a Cargo contract
const SELLER = "0x79CC59F415039F1f91e6deE5Db40E7bb4Ab2608b"

let saleID = '' // overwrite when found

let currentHash = "0x58b0b45b9cf1a5366738abcc2559d06fb96d733ad989fd60863b5288c9a8d42e"
let currentToken = -1

function updateHash(hash){
    hash = hash || currentHash
    // validate hash
    // e.g. "0x58b0b45b9cf1a5366738abcc2559d06fb96d733ad989fd60863b5288c9a8d42e"
    if(hash && hash.length === 66 && hash.substr(2).split('').reduce((prev,curr)=>{ return prev && !isNaN(parseInt(curr,16)) },true) ){
        currentHash = hash
    }

    currentToken = hashList.indexOf(currentHash)

    document.getElementById('kai_token_id').innerText = currentToken !== -1 ? currentToken : '???'
    document.getElementById('kai_buy_btn').style.display = 'none' 
    document.getElementById('kai_sold_badge').style.display = 'none' 
    document.getElementById('kai_hash').innerText = currentHash

    drawToken_27(document.getElementById('canvas_1'),currentHash)
    drawToken_XS(document.getElementById('canvas_2'),currentHash)

    if(currentToken > -1 && currentToken < 1023){ // skip 1024 - which is token #0
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