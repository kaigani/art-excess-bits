    function randomHex(length){
        let hex = ''
        for(let i=0;i<length;i++){
            hex += parseInt(Math.random()*16).toString(16)
        }
        return hex 
    }

    function bin2hex(bin){
        //return parseInt(bin, 2).toString(16).padStart(64,'0')
        
        let parts = bin.match(/.{1,4}/g) // Replace n with the size of the substring
        let hex = parts.map( b=>parseInt(b, 2).toString(16)).join('')

        return hex

        //parseInt(bin.substr(-4*(i+1),4),2).toString(16)
    }

    function hexToBigInt(hex){
        let v = BigInt(0)
        for(let i=0;i<hex.length;i++){
            v *= 16n
            v += BigInt(parseInt(hex.substr(i,1),16))
        }
        return v
    }

    function spriteToFrame(sprite,scale){

        //sprite = '77777777777777777777ffff7777777777777777777777777777777777777000'
        //sprite = '60061008100823c4399c33cc37ec3ffc23c401800990058815a81db809900ff0'
        //sprite = '00000ffc100220012001380701e001e000c000c000001f3e1122152a10021f3e' // 4 layers
        //sprite = '0c301008100820043bdc318c37ec3ffc23c4099011a015a81db809900ff00000'
        //console.log(`SPRITE:${sprite}`)

        // layers
        let layers = spriteToLayers(sprite)
        // definitions
        //let scale = 1 // CANNOT SCALE BELOW 1 or IT WILL BORK
        //let graph = spriteToGraph(spr,scale)
        let frame = layers.map(o=>spriteToGraph(o,scale))
    
        return frame
    }
    

    // sprite in HEX
    function peek(sprite,x,y){
        /*
        return  x >= 0 && x < 16 && y >= 0 && y < 16 &&
                (parseInt(sprite.substr(-4*(y+1),4),16) & 1 << x) > 0
        */
       let bit = y*16+x
       let bigNum = hexToBigInt(sprite)

       return   x >= 0 && x < 16 && y >= 0 && y < 16 && // keep within bounds
                (bigNum & 1n << BigInt(bit)) > 0n
    }

    function poke(sprite,x,y){
        
        let bit = y*16+x
        let bigNum = hexToBigInt(sprite)
        return x >= 0 && x < 16 && y >= 0 && y < 16 ? (bigNum | (1n << BigInt(bit))).toString(16).padStart(64,'0') : sprite
     }
 

    function unset(sprite,x,y){
        let bit = y*16+x
        let mask = BigInt(0) // fill with bits except for the unset bit
        for(let i=0; i<256; i++){
            mask = 255-i === bit ? mask << 1n : (mask << 1n) + 1n // count from the end
        }
        let bigNum = hexToBigInt(sprite)
        return x >= 0 && x < 16 && y >= 0 && y < 16 ? (bigNum & mask).toString(16).padStart(64,'0') : sprite
    }

    function spriteToLayers(sprite){
        let layers = []
        let acc = {
            from:sprite,
            to:'0'
        }
        for(let y=0;y<16;y++){
            for(let x=0;x<16;x++){
                if( peek(acc.from,x,y) ){
                    extractShape(acc,x,y)
                    layers.push(acc.to)
                    acc.to = '0'
                }
            }
        }
        return layers
    }

    function extractShape(acc,x,y){
        if(peek(acc.from,x,y)){
            acc.to = poke(acc.to,x,y)
            acc.from = unset(acc.from,x,y)

            // extract from surrounding pixels touching this one
            extractShape(acc,x-1,y)
            extractShape(acc,x-1,y-1)
            extractShape(acc,x,y-1)
            extractShape(acc,x+1,y-1)
            extractShape(acc,x+1,y)
            extractShape(acc,x+1,y+1)
            extractShape(acc,x,y+1)
            extractShape(acc,x-1,y+1)
        }
    }

    function spriteToGraph(sprite,scale){

        let origin = {x:0,y:0}
        let pen = {x:0,y:0}
        
        let done = false
        let mode = 'seek'
        let graph = []
        while(!done){
            //console.log(`MODE:${mode}\t O:${origin.x},${origin.y}\tPen:${pen.x},${pen.y}`)
            
            switch(mode){

                case 'seek':
                    if(peek(sprite,origin.x,origin.y)){
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p1'
                        
                    }else{
                        origin.x++
                        pen.x += scale
                        if(origin.x === 16){
                            origin.x = 0
                            origin.y++
                            pen.x = 0
                            pen.y += scale
                        }
                        if(origin.y === 16){
                            done = true
                        }
                    }
                break

                case 'p1':
                    
                    if(peek(sprite,origin.x,origin.y-1)){
                        // above
                        origin.y--
                        pen.y -= scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point

                       // console.log('move up, pen up')

                    }else if(peek(sprite,origin.x+1,origin.y-1)){
                        // above, right
                        origin.x++
                        origin.y--
                        pen.x += scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p4'

                        //console.log('move up/right, pen right')

                    }else if(peek(sprite,origin.x+1,origin.y)){
                        // right
                        origin.x++
                        pen.x += scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point

                        //console.log('move right, pen right')

                    }else{
                        // nothing
                        pen.x += scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p2'

                        //console.log('no move, pen right')
                    }
                break

                case 'p2':

                    if(peek(sprite,origin.x+1,origin.y+1)){
                        // below, right
                        origin.x++
                        origin.y++
                        pen.y += scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p1'

                        //console.log('move down/right, pen down')

                    }else if(peek(sprite,origin.x,origin.y+1)){
                        // below
                        origin.y++
                        pen.y += scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point

                        //console.log('move down, pen down')

                    }else{
                        // nothing
                        pen.y += scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p3'

                        //console.log('no move, pen down')
                    }
                break

                case 'p3':
                    if(peek(sprite,origin.x-1,origin.y+1)){
                        // below, left
                        origin.x--
                        origin.y++
                        pen.x -= scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p2'

                        //console.log('move down/left, pen left')

                    }else if(peek(sprite,origin.x-1,origin.y)){
                        // left
                        origin.x--
                        pen.x -= scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point

                        //console.log('move left, pen left')

                    }else{
                        // nothing
                        pen.x -= scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p4'

                        //console.log('no move, pen left')
                    }
                break

                case 'p4':
                default:
                    if(peek(sprite,origin.x-1,origin.y-1)){
                        // above, left
                        origin.x--
                        origin.y--
                        pen.y -= scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p3'

                        //console.log('move up/left, pen up')

                    }else if(peek(sprite,origin.x,origin.y-1)){
                        // above
                        origin.y--
                        pen.y -= scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point

                        //console.log('move up, pen up')
                        
                    }else{
                        // nothing
                        pen.y -= scale
                        graph.push({x:pen.x,y:pen.y}) // log draw point
                        mode = 'p1'

                        //console.log('no move, pen up')
                    }
                break
            }

            // check close condition
            done = mode === 'seek' || graph.length === 1 ? done : graph[0].x === pen.x && graph[0].y === pen.y
        }
        return graph
    }
    //console.log(graph)

    // draw frame - which consists of layers of graphs to draw
    function drawFrame(canvas,frame,x,y,color){
        frame.map(graph=>drawGraph(canvas,graph,x,y,color))
    }
    // drawGraph
    function drawGraph(canvas,graph,x,y,color){
        const c = canvas.getContext('2d')
        c.lineWidth = 1
        c.fillStyle = '#111'
        //c.fillRect(x,y,16*scale,16*scale)
        c.fillStyle = color
        c.strokeStyle = color
        c.beginPath()
        c.moveTo(x+graph[0].x,y+graph[0].y)
        graph.map( (o,i)=>{
            if(i === 0){
                c.moveTo(x+o.x,y+o.y)
            }else{
                c.lineTo(x+o.x,y+o.y)
            }
        })
        //c.closePath()
        //c.stroke()
        c.fill()
    }





 	
