const fs = require('fs');
let MFT = [
    'Offset to fixup array',
    'Number of entries in fixup array',
    '$LogFile sequence number',
    'Sequence value',
    'Link count',
    'Offset to first attribute',
    'Flags',
    'Used size of MFT entry',
    'Allocated size of MFT entry',
    'Next attribute identifier'
]
let SECTION = [
    ['Attribute Type Identifier', undefined, 'int'],
    ['Length of Attribute', 4, 'int'],
    ['Non-resident flag', 4, 'short'],
    ['Lenght of name', 1, 'short'],
    ['Offset to name', 1, 'short'],
    ['Flags', 2, 'short'],
    ['Attribute Identifier', 2, 'short'],
    ['Empty1', 2, 'short'],
    {
    resident: [
     ['Size of content', undefined, 'int'],
     ['Offset to content', 4, 'short']
     ],
     non_resident: [
    ['Starting Virtual Cluster Number of the runlist', undefined, 'short'],
    ['Ending Virtual Cluster Number of the runlist', 8, 'short'],
    ['Offset to the runlist', 8, 'short'],
    ['Compression unit size', 2, 'short'],
    ['unused', 2, 'short'],
    ['Allocated size of the attribute content', 4, 'short'],
    ['Actual size of attribute content', 8, 'short'],
    ['Initialized size of the attribute content', 8, 'short'],
    ]
    },
    ['Empty1', 2, 'short']
]

class mft {
    output() {
        this.data = fs.readFileSync(__dirname + '/MFT.bin').slice(4)
        this.offset = 0
        this.header = {}

        let bytes = this.getBytes(this.data); bytes[8].bytes++
        console.log("----------------------------------------");
        MFT.forEach((name, i) => { let buffer = bytes[i]; this.header[name] = this.getData(buffer.offset, buffer.bytes); })
        Object.keys(this.header).reduce((name, key) => {
        console.log(key +': ' + this.header[key] )}, 11)
        console.log("----------------------------------------");
        this.attributes = this.getAttribytes(this.header['Offset to first attribute'])

    }
    getAttribytes(length) {
        let attributes = []
        let identifier
        while (this.data.length) {
                identifier = this.getData(length - this.offset, 4)
                length = this.getData(2, 2) - 2 + this.offset
                if (isNaN(length) || length - this.offset <= 0) break
                attributes.push(this.getAttribyte(identifier, length - this.offset))
                console.log("----------------------------------------");
        }
        return attributes;
    }
    getAttribyte(identifier, length) {
        let getType = str => ({ 'short': 1, 'int': 2, 'long': 4 }[str])
        let attribute = {}

        attribute[SECTION[0][0]] = identifier
        attribute[SECTION[1][0]] = length

        SECTION.slice(2, 8).forEach(([name, offset, type]) => attribute[name] = this.getData(offset, getType(type)))
        Object.keys(attribute).reduce((name, offset, type) => {console.log(offset +': ' + attribute[offset] )
    }, 11)


        return attribute
    }
    getData(offset, bytes) {
        this.offset += offset
        let data = this.data.slice(0, offset)
        this.data = this.data.slice(offset)
        return parseInt(data.slice(-bytes).reverse().toString('hex'), 16)
    }
    getBytes(mft) {
        let res = []
        let bytes = 0, offset = 0
        for (let i = 0; i < mft.length; i++) {
            offset++
            if (mft[i] != 0) bytes++
            else {
                if (bytes != 0) {
                    res.push({ offset: offset - 1, bytes })
                    bytes = 0
                    offset = 1
                }
            }
        }
        return res
    }
    toString = () => ({ header: this.header, attribytes: this.attributes })
}

let test= new mft();
test.output();