import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Verify = () => {
    const [status, setstatus] = useState("Verifying...")
    const {token} = useParams()
    const navigate = useNavigate()

    useEffect(()=>{
        const verifyEmail = async () => {
            try {
                const res = await axios.post('http://localhost:3000/user/verify', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if(res.data.success){
                    setstatus('✅ Email verified succesfully')
                    setTimeout(() => {
                        navigate('/login')
                    }, 2000);
                } else {
                    setstatus("❌ Invalid or Expire token.")
                }
            } catch (error) {
                console.log(error)
                setstatus("❌ Verification Failed. Please try again.")
            }
        }

        verifyEmail()
    },[token, navigate])
  return (
    <div className='relative w-full h-screen bg-green-100 overflow-hidden'>
        <div className='min-h-screen flex items-center justify-center'>
            <div className='bg-white p-6 rounded-xl shadow-md text-center w-[90%] max-w-md'>
                <h2 className='text-xl font-semibold text-gray-800'>{status}</h2>
            </div>
        </div>
    </div>
  )
}

export default Verify
