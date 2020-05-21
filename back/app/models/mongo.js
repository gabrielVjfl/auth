const mongoose = require('mongoose')

const schema = mongoose.Schema

let bcrypt = require('bcryptjs')


const table = new schema({

    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        // set: value => crypto.createHash('md5').update(value).digest('hex'),
      select: false 
    },
    passwordResetToken:  {
       type: String,
       select: false,
    },
    // Quarda a data de expiração
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    data: {
        type: Date,
        default: Date.now()
    }
    

    // data publicação => type: data, default: date.now
})
// export const UserModel = mongoose.model("autenticacao", table)

  table.pre('save', async function(next) {
        
       const hash = await bcrypt.hash(this.password, 10)
       this.password = hash

       next()
 })


mongoose.model("autenticacaos3", table)

// export default table

