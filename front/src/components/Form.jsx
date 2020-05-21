import React, {useState} from 'react'

import Axios from 'axios'

const Form = () => {

    const INITIAL_STATE = {
        nome: '',
        email: '',
        password: ''
    }

    const [state, setState] = useState(INITIAL_STATE)

  let  handleChange = (e) => {
       setState({...state, [e.target.name]: e.target.value})
    }

    let handleSubmit = (e) => {
       e.preventDefault()
        Axios.post("http://localhost:7656/postar", state)

            setState(INITIAL_STATE)
  
    }


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Nome :  </label><input type="text" value={state.nome} onChange={handleChange} name="nome"></input><br></br>
            <label>Email :  </label><input type="email" value={state.email} onChange={handleChange} name="email"></input><br></br>
            <label>Senha :  </label><input type="password"  value={state.password} onChange={handleChange}  name="password"></input>

            <br></br>
            <button type="submit">ENTRAR</button>
            </form>
        </div>
    )
}

export default Form