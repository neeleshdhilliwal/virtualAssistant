import React, { useContext, useState } from 'react'
import bg from "../assets/try.jpg"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"; 
import { FaEnvelope, FaLock } from "react-icons/fa"; 
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const { serverUrl, userData, setUserData } = useContext(userDataContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email, password
      }, { withCredentials: true })
      setUserData(result.data)
      setLoading(false)
      navigate("/")
    } catch (error) {
      console.log(error)
      setUserData(null)
      setLoading(false)
      setErr(error.response.data.message)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{ backgroundImage: `url(${bg})` }} >
      <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleSignIn}>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Sign In to <span className='text-blue-400'>Virtual Assistant</span></h1>

        {/* Email Input with Icon */}
        <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative flex items-center hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] transition duration-300'>
          <FaEnvelope className='absolute left-[20px] text-white w-[20px] h-[20px]' />
          <input type="email" placeholder='Email' className='w-full h-full outline-none bg-transparent text-white placeholder-gray-300 px-[50px] rounded-full text-[18px]' required onChange={(e) => setEmail(e.target.value)} value={email} />
        </div>

        {/* Password Input with Icon + Eye Toggle */}
        <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative flex items-center hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] transition duration-300'>
          <FaLock className='absolute left-[20px] text-white w-[20px] h-[20px]' />
          <input type={showPassword ? "text" : "password"} placeholder='Password' className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[50px] py-[10px]' required onChange={(e) => setPassword(e.target.value)} value={password} />
          {!showPassword && <IoEyeOutline className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer' onClick={() => setShowPassword(true)} />}
          {showPassword && <IoEyeOffOutline className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer' onClick={() => setShowPassword(false)} />}
        </div>

        {err.length > 0 && <p className='text-red-500 text-[17px]'>
          *{err}
        </p>}
        <button className='w-full h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] transition duration-300' disabled={loading}>{loading ? "Loading..." : "Sign In"}</button>

        <p className='text-white text-[18px] cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] transition duration-300' onClick={() => navigate("/signup")}>Want to create a new account ? <span className='text-blue-400'>Sign Up</span></p>
      </form>
    </div>
  )
}

export default SignIn
