// Draw 27-Bit Digital
function drawToken_27(canvas,hash){

    // Environment
    const c = canvas.getContext('2d')
    c.clearRect(0, 0, canvas.width, canvas.height)
    // 
    // START 
    //

    const seed = parseInt(hash.substr(-7),16)
    
    const colorSeed = seed & 0xfff // first 12 bits
    const segmentMask = (seed & 0x7f000) >> 12 // next 7 bits, shifted 12 bits
    let rarity = ((seed >> 19) & 0xff) === 1 ? 5 : ((seed >> 19) & 0xf) === 1 ? 3 : 4 

    rarity = 5

    // outer image is the largest square that fits within the canvas
    let size = Math.min(canvas.width,canvas.height)
    //console.log(size)
    //c.fillStyle = '#C4CDD5'
    //c.fillRect(0,0,size,size)

    // canvas offset
    offset = 0

    // PATTERN & scaling
    let scale = Math.pow(2,rarity)

    // relative scale factor of the artwork
    factor = size / 2048.0 
    
    // DRAW 
    // Pattern - Background pattern
    drawPattern(colorSeed,offset,offset,scale*factor,size)

    // 7segment - 7-segment display
    // mask is the bitmap pattern for which of the 7 segments should appear as 'on'
    // for bits in the order: 6,5,4,3,2,1,0
    //   0
    // 1   2
    //   3 
    // 4   5
    //   6

    draw7Segment(segmentMask,factor,offset)

    

    function drawPattern(bitmap,dx,dy,scale,size){

        for(x=dx;x<dx+size;x+=scale*2){
            for(y=dy;y<dy+size;y+=scale*2){
                
                for(var i=0;i<4;i++){

                    let byte = bitmap >> (3*i)
                    let r = (byte & 4) ? 'F' : '0'
                    let g = (byte & 2) ? 'F' : '0'
                    let b = (byte & 1) ? 'F' : '0'

                    c.fillStyle = `#${r}${g}${b}`

                    let xOffset = (i%2)*scale
                    let yOffset = parseInt(i/2)*scale
                    
                    c.fillRect(x+xOffset,y+yOffset,scale,scale)
                }
            }
        }
    }

    function draw7Segment(mask,factor,offset){
        const scale = 32*factor

        // SPRITE
        // 
        // 1 segment of the 7-segment display
        // a 18x7 pixel sprite 
        //
        // it looks like this:
        // 
        // 000111111111111000 = 32760
        // 001111111111111100 = 65532
        // 011111111111111110 = 131070
        // 111111111111111111 = 262143
        // 011111111111111110 = 131070
        // 001111111111111100 = 65532
        // 000111111111111000 = 32760
        //

        const sprite = [32760,65532,131070,262143,131070,65532,32760]

        // COMPOSITE SPRITE
        // 
        // A translation matrix for positioning the segment:
        //
        //   0
        // 1   2
        //   3 
        // 4   5
        //   6
        //

        const segments = [
            [1,0,0,1,4,0],
            [0,1,-1,0,7,4],
            [0,1,-1,0,26,4],
            [1,0,0,1,4,19],
            [0,1,-1,0,7,23],
            [0,1,-1,0,26,23],
            [1,0,0,1,4,38],
        ]

        // pixel offset within the overall composite sprite
        const dx = 19
        const dy = 9

        // the same sprite is rotated and translated according to the segments matrix above
        
        segments.map((translation,i)=>{
            // iterate through the bits of the mask
            let bit = Math.pow(2,i)
            // if the mask bit & test bit are non-zero, draw the segment
            mask & bit && draw(sprite, translation, dx, dy, scale, offset)
        }) 

        c.resetTransform()
        
        function draw(sprite,translation,dx,dy,scale,offset){

            // transformations to scale and move the sprites according to the translation map
            c.setTransform(1,0,0,1,dx*scale+offset,dy*scale+offset)
            c.transform(...translation.map(o=>scale*o))
            

            // Iterate through the bits of each line of the sprite
            sprite.map((bits,dy)=>{
                for(dx=0;bits>0;dx++){
                    // If the last bit is set, draw a pixel square
                    if(bits & 1){
                        c.fillStyle = `#FFF`       
                        c.fillRect(dx,dy,1,1)
                    }
                    // Shift the bits down by 1
                    bits = bits >> 1
                }
            })
        }
    }  
} 	


// Draw Excess Bits
function drawToken_XS(canvas,hash){

    // Environment
    const c = canvas.getContext('2d')

    // 
    // START 
    //
    
    let seed = hexToBigInt(hash.substr(2),16)
    
    //const segmentMask = (seed & 0x7f000) >> 12 // next 7 bits, shifted 12 bits
    //const rarity = ((seed >> 19) & 0xff) === 1 ? 5 : ((seed >> 19) & 0xf) === 1 ? 3 : 4 

    // skip the first 27 bits - used for 27-Bit Digital
    seed >>= 27n

    // GET SEEDS
    let colorSeed = parseInt(seed & 0xfffn) // first 12 bits
    seed >>= 12n
    let colorSeed2 = parseInt(seed & 0x7n) // 3 bits
    seed >>= 3n
    let colorOrder = parseInt(seed & 1n)
    seed >>= 1n
    let rarity = parseInt(seed & 0xffn) === 1 ? 5 : parseInt(seed & 0xfn) === 1 ? 3 : 4 // 5 rarest, 3 rare, 4 common
    seed >>= 8n
    let mode = parseInt(seed & 0xffn) === 1 ? 3 : parseInt(seed & 0xfn) < 3 ? 2 : 1 // 3 - warp/radial, 2 - diagonal, 1 - vertical
    let hOrientation = parseInt(seed & 1n)
    seed >>= 1n
    let xRand = parseFloat(seed & 0xffffn) / 0xffff
    seed >>= 16n
    let yRand = parseFloat(seed & 0xffffn) / 0xffff
    seed >>= 16n

    // 57 bits ^^ & 64 bits used below
    // total 121 bits (with the initial 27 = 158)


    //colorSeed = parseInt(Math.random()*0xfff)
	//let colorSeed2 = parseInt(Math.random()*0xfff)

    
    //colorOrder = 0
    let colorFrom = colorOrder ? colorSeed : parseInt(parseInt(colorSeed2).toString(2).padStart(3,'0').repeat(4),2)
    let colorTo = colorOrder ? parseInt(parseInt(colorSeed2).toString(2).padStart(3,'0').repeat(4),2) : colorSeed

    // outer image is the largest square that fits within the canvas
    let size = Math.min(canvas.width,canvas.height)
    c.fillStyle = '#C4CDD5'
    c.fillRect(0,0,size,size)

    // rendered artwork must be a power of 2
    //let innerSize = Math.pow(2,parseInt(Math.log2(size)))

    // canvas offset
    //offset = Math.floor((size-innerSize)/2)

    // PATTERN & scaling
    let patternScale = Math.pow(2,rarity)
    let scale = Math.pow(2,4)

    // relative scale factor of the artwork
    factor = size / 2048.0 //innerSize / 2048.0 

    // pixel size
    let pixelScale = scale*factor
    let pixelSide = size/pixelScale // innerSize/pixelScale
    
    // DRAW 
    // Pattern - Background pattern depending on mode
    switch(mode){
        case 1:
            drawPattern(colorFrom,colorTo,patternScale*factor,size) //innerSize)
        break
        case 2:
            drawPattern2(colorFrom,colorTo,patternScale*factor,size) //innerSize)
        break
        case 3:
            drawPattern3(colorFrom,colorTo,patternScale*factor,size) //innerSize)
        break
    }
    

    // Frame
    //let sprite = '0000000000000000000000003ffc7ffeffff7ffe3ffc00000000000000000000'
    let sprite_01 = '000000000000000000000000000000000000000000003ffc4002800140023ffc'
    let sprite_02 = '0004000a001100110011001100110011001100110011001100110011000a0004'
    let frame = spriteToFrame(sprite_01,2*pixelScale)
    let frame_02 = spriteToFrame(sprite_02,2*pixelScale)

    //let hOrientation = Math.random() < 0.5 ? true : false

    let xPos = parseInt(xRand*pixelSide)
    let yPos = parseInt(yRand*pixelSide)
    let runSeed = seed

    // black
    for(let i=0;i<32;i++){
        let next = parseInt(runSeed & 3n)
        runSeed >>= 2n // 64 more seeds
        hOrientation = !hOrientation

        if(hOrientation){
            //console.log('horiz:',next)
            drawFrame(canvas,frame,(xPos+1)*pixelScale,(yPos+1)*pixelScale,'#000')
            switch(next){
                case 0:
                    xPos += 28
                    yPos +=6
                break

                case 1:
                    xPos += 28
                    yPos -= 28
                break

                case 2:
                    xPos -= 6
                    yPos += 6
                break

                default:
                    xPos -= 6
                    yPos -= 28
            }
        }else{
            //console.log('vert:',next)
            drawFrame(canvas,frame_02,(xPos+1)*pixelScale,(yPos+1)*pixelScale,'#000')
            switch(next){
                case 0:
                    xPos += 6
                    yPos -= 6
                break

                case 1:
                    xPos -= 28
                    yPos -= 6
                break

                case 2:
                    xPos += 6
                    yPos += 28
                break

                default:
                    xPos -= 28
                    yPos += 28
            }
        }
    }

    xPos = parseInt(xRand*pixelSide)
    yPos = parseInt(yRand*pixelSide)
    runSeed = seed

    // white
    for(let i=0;i<32;i++){
        let next = parseInt(runSeed & 3n)
        runSeed >>= 2n // 64 more seeds
        hOrientation = !hOrientation

        if(hOrientation){
            //console.log('horiz:',next)
            drawFrame(canvas,frame,(xPos*pixelScale),(yPos*pixelScale),'#fff')
            switch(next){
                case 0:
                    xPos += 28
                    yPos +=6
                break

                case 1:
                    xPos += 28
                    yPos -= 28
                break

                case 2:
                    xPos -= 6
                    yPos += 6
                break

                default:
                    xPos -= 6
                    yPos -= 28
            }
        }else{
            //console.log('vert:',next)
            drawFrame(canvas,frame_02,(xPos*pixelScale),(yPos*pixelScale),'#fff')
            switch(next){
                case 0:
                    xPos += 6
                    yPos -= 6
                break

                case 1:
                    xPos -= 28
                    yPos -= 6
                break

                case 2:
                    xPos += 6
                    yPos += 28
                break

                default:
                    xPos -= 28
                    yPos += 28
            }
        }
    }
    //drawFrame(canvas,frame,pixelScale,pixelScale,'#000')
    //drawFrame(canvas,frame,(35*pixelScale),pixelScale,'#000')
    //drawFrame(canvas,frame_02,(29*pixelScale),(7*pixelScale),'#000')
    //drawFrame(canvas,frame,offset,offset,'#fff')
    //drawFrame(canvas,frame,(34*pixelScale),offset,'#fff')
    //drawFrame(canvas,frame_02,(28*pixelScale),(6*pixelScale),'#fff')

    function drawPattern(c1,c2,scale,size){

        for(x=0;x<size;x+=scale*2){
            for(y=0;y<size;y+=scale*2){
                
                for(var i=0;i<4;i++){

                    let color = c1
                    if(y > (size/5) && i === 0) color = c2
                    if(y > (2*size/5) && i === 1) color = c2
                    if(y > (3*size/5) && i === 2) color = c2
                    if(y > (4*size/5) && i === 3) color = c2

                    let byte = color >> (3*i)
                    let r = (byte & 4) ? 'F' : '0'
                    let g = (byte & 2) ? 'F' : '0'
                    let b = (byte & 1) ? 'F' : '0'

                    c.fillStyle = `#${r}${g}${b}`

                    let xOffset = (i%2)*scale
                    let yOffset = parseInt(i/2)*scale
                    
                    c.fillRect(x+xOffset,y+yOffset,scale,scale)
                }
            }
        }
    } 

    // diagonal
    function drawPattern2(c1,c2,scale,size){

        for(x=0;x<size;x+=scale*2){
            for(y=0;y<size;y+=scale*2){
                
                for(var i=0;i<4;i++){

                    let color = c1
                    if(x+y > (2*size/5) && i === 0) color = c2
                    if(x+y > (4*size/5) && i === 1) color = c2
                    if(x+y > (6*size/5) && i === 2) color = c2
                    if(x+y > (8*size/5) && i === 3) color = c2

                    let byte = color >> (3*i)
                    let r = (byte & 4) ? 'F' : '0'
                    let g = (byte & 2) ? 'F' : '0'
                    let b = (byte & 1) ? 'F' : '0'

                    c.fillStyle = `#${r}${g}${b}`

                    let xOffset = (i%2)*scale
                    let yOffset = parseInt(i/2)*scale
                    
                    c.fillRect(x+xOffset,y+yOffset,scale,scale)
                }
            }
        }
    }
    
    // rounded
    function drawPattern3(c1,c2,scale,size){

        for(x=0;x<size;x+=scale*2){
            for(y=0;y<size;y+=scale*2){
                
                for(var i=0;i<4;i++){

                    let color = c1
                    if(x*y > Math.pow(size/5,2) && i === 0) color = c2
                    if(x*y > Math.pow(2*size/5,2) && i === 1) color = c2
                    if(x*y > Math.pow(3*size/5,2) && i === 2) color = c2
                    if(x*y > Math.pow(4*size/5,2) && i === 3) color = c2

                    let byte = color >> (3*i)
                    let r = (byte & 4) ? 'F' : '0'
                    let g = (byte & 2) ? 'F' : '0'
                    let b = (byte & 1) ? 'F' : '0'

                    c.fillStyle = `#${r}${g}${b}`

                    let xOffset = (i%2)*scale
                    let yOffset = parseInt(i/2)*scale
                    
                    c.fillRect(x+xOffset,y+yOffset,scale,scale)
                }
            }
        }
    }
} 