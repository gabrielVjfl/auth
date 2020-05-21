const port = 7656

let express = require("express")

const app = express()

const bodyParser = require('body-parser')

const mongoose = require('mongoose')

const cors = require('cors')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const authConfig  = require('../config/auth.json')

const router = require('../app/Auth/projecController')

const nodemailer = require('nodemailer')

require('../app/models/mongo')

const crypto = require('crypto')

const hbs = require('nodemailer-express-handlebars')

// const mailer = require('../emails/nodemailer')

function gerarTokens(params = {}) {

    return jwt.sign(params,  authConfig.secret, {
        expiresIn: 86400, // inspira em 1 dia
    
    })
    
}



// No mongo tras o model
const novoUsuario = mongoose.model("autenticacaos3")



app.use(cors())

app.use('/project', router) // usa o router


app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: false
}))



mongoose.Promise = global.Promise

mongoose.connect('mongodb+srv://gabrielVjfl:60818181@cluster0-lqnvw.gcp.mongodb.net/PROJETOMONGO2', {useNewUrlParser: true})
.then((suc) => {
    console.log(suc)

}).catch((err) => {
    console.log(err)
})



app.get('/suc', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})
app.use(express.static(__dirname))

app.get('/err', (req,res) => {
    res.sendfile(__dirname + '/index2.html')
})



/////////////  CADASTRO!!!!!!!!!!!!!!!!!!!!  ///////////////////////////////////
app.post('/register', async (req,res) => {

    const {email} = req.body

    try {

        if(await  novoUsuario.findOne({email})) {
            return res.send("Email já cadastrado no sistema!, Tente novamente!")
              
        }
         
    const user =  await novoUsuario.create(req.body)

    novoUsuario.password = undefined // Para não pegar a senha

   return  res.send({user, token: gerarTokens({id: user.id})})
    
    // res.render("/paginaSucesso")

    } catch(err) {
      res.status(400).send('Ocorreu um erro tente novamente')
      console.log(err)

    }
})

app.get('/pegar', (req,res) => {
    novoUsuario.find().then((suc) => {
        console.log(suc)
        res.send(suc)

    }).catch((err) => {
        console.log(err)
    })
})


// Pega só os emails e não pega o id
app.get('/emails' , (req,res) => {
    novoUsuario.find({}, { _id: 0, email: 1}).then((suc) => {
        console.log(suc)
        res.send(suc)

    }).catch((err) => {

        console.log(err)
    })
})

//app.get("/postagens2", (req,res) => {
 //   novoUsuario.find().sort({data: 'desc'}).then((suc) => {
 //       console.log(suc)
 //   }).catch((err) => {
  //      console.log(err)
  //  })
// })

///////////////////// AUTENTICAÇÃO LOGIN /////////////////////////////////////////

app.post('/authenticate', async (req,res) => {
    
const {email, password} = req.body



const user = await novoUsuario.findOne({email}).select('+password')


      if(!user) {
        return res.status(400).send('O Usuário não esta cadastrado no sistema!')
         //ou res.render ou redirect
   }


   if( !await bcrypt.compare(password, user.password))
   return res.status(400).send("Senha Invalida")

        user.password = undefined // remove o password

            res.send({user, token: gerarTokens({id: user.id})})
})


// ESQUECI A SENHA

app.post('/forgetPassword', async(req,res) => {
        const {email} = req.body

        try {
           const user = await novoUsuario.findOne({email})

           if(!user) {
               res.status(401).send('Esse email não está cadastrado no sistema')
           }

// Gera um token aleatorio de 20 caracteres hexadecimal
           const token = crypto.randomBytes(20).toString('hex')
// Tempo e data de espiração
           const now = new Date()
           now.setHours(now.getHours() + 1)

           await novoUsuario.findByIdAndUpdate(user.id, {
                '$set' :  {
                    passwordResetToken: token, // Novo Token
                    passwordResetExpires:  now, // momento da expiração
                }
           }, {new: true, useFindAndModify: false}
           )
           console.log(token, now)
        
           var transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "6336e6331246df",
              pass: "ac7170085e0177"
            }
          })
         transport.use("compile", hbs({
              viewEngine:{
               partialsDir:"views",
                  defaultLayout:""
              },
          viewPath:"views",
            extName:".hbs"
      }))
        
        
        var mailOptions = {
            from: 'gabvoes.1000@gmail.com',
            to: email,
            subject: 'SEJA BEM VINDO!!',
             template: "forget_password",
          context: {token}
           
        }
            
        
        
        transport.sendMail(mailOptions, function(err, res) {
            if (err) {
                console.log('Mail not sent', err);
            } else {
                console.log('Mail sent!!!!!!!');
            }
        })
        
        
        


        
            res.send() // ok


     }  catch (err) {
         console.log(err)
           return  res.status(400).send({error: "Ouve um erro interno"})
        }
})



app.post('/resetPassword', async(req,res) => {
    const {email, token, password} = req.body

    try {

const user = await novoUsuario.findOne({email}).select('+passwordResetToken passwordResetExpires')

    if(!user) 
        return res.status(400).send({error: 'O Usuario não se encontra no sistema'})
    
   if(token !==  user.passwordResetToken) 
     return res.status(401).send({error: 'Token invalido!'})

// Ver a data , se a data for maior  do q a expirada
     const novaData = new Date()

      if(novaData > user.passwordResetExpires) 
         return res.status(400).send({erro: 'Token inspirado! gere um novo'})

         user.password = password

          await user.save()

          res.send()

    } catch(err) {
              res.status(400).send({erro: "Erro interno"})
              console.log(err)
    }
})


app.listen(port, () => {
    console.log('Rondando na porta', port)
})