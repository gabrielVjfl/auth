const jwt = require('jsonwebtoken')

const authConfig =  require('../../config/auth.json')

module.exports = (req,res,next) => {

    const authHeader = req.headers.authorization;

    if(!authHeader) 
        return res.status(401).send({error:  'O Token não foi informado!'})
    
// Ver se tem 2 partes
    const parts = authHeader.split(' ')

    if(!parts.length === 2) 
        return res.status(401).send({error: 'Token error'})
    
const [scheme, token] = parts

// Procurar a palavra

if(!/^Bearer$/i.test(scheme)) 
   return res.status(401).send({error: 'Token invalido'})

   jwt.verify(token, authConfig.secret, (err, decoded) => {

       if(err)
          return res.status(401).send({error: 'Token erraso'})

          req.userId = decoded.id

          return next()
   })
  
}