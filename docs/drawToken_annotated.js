function drawToken(canvas,seed){

    // Environment
    const c = canvas.getContext('2d')
    c.clearRect(0, 0, canvas.width, canvas.height)
    // 
    // START 
    //
    
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


 	