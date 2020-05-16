const path = require('path')
const fs  = require('fs')

exports.objGenerator = (fileName)=>{
    const jsonPath = path.join(process.cwd(), fileName)
    const json = fs.readFileSync(jsonPath)
    const obj = JSON.parse(json)
    return obj;
}