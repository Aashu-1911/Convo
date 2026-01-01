import React from 'react'
import {useState} from 'react';

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    fullName:"",
    email:"",
    password:""
  });

  const handleSignup = (e) =>{
    e.preventDefault()
  }

  return <div>
    
  </div>
}

export default SignupPage
