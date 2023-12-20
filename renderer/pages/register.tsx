import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  Button,
  TextField,
  Input,
  InputLabel,
  InputAdornment,
  IconButton,
  FormControl
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

export default function RegisterPage() {
  const [user, setUser] = React.useState('')
  const [userStatus, setUserStatus] = React.useState('')
  const [pass, setPass] = React.useState('')
  const [passStatus, setPassStatus] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter()

  const userChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUser(e.target.value)
    if (user.length < 4 || user.length > 20) {
      setUserStatus('Invalid Length')
      return
    }
    if (!/[0-9a-z]/gi.test(user)) {
      setUserStatus('Invalid Chars')
      return
    }
    setUserStatus('valid')
  }
  const passChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPass(e.target.value)
    if (pass.length < 5 || pass.length > 20) {
      setPassStatus('Invalid Length');
      return;
    }
    if (!/[0-9a-z!@#$%^&*()]/gi.test(pass)) {
      setPassStatus('Invalid Chars');
      return;
    }
    setPassStatus('valid')
  }
  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (userStatus !== 'valid' || passStatus !== 'valid') return

    const newUser = { user, pass }
    window.ipc.send('add-user', newUser)
    router.push('/home')
  }

  return (
    <React.Fragment>
      <Head>
        <title>Password Manager</title>
      </Head>
      <div>
        <p>
          ⚡ Password Manager ⚡ -
          <Link href="/next">
            <a>Go to next page</a>
          </Link>
        </p>
        <Image src="/images/logo.png" alt="Logo image" width="256px" height="256px" />
        <hr />
        <h2>Register</h2>
        <form onSubmit={onSubmit}>
          <TextField
            label="Username"
            id="standard-start-adornment"
            sx={{ m: 1, width: '25ch' }}
            variant="standard"
            onChange={userChange}
          />
          <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
            <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
            <Input
              id="standard-adornment-password"
              type={showPassword ? 'text' : 'password'}
              onChange={passChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Button variant="outlined" size="large" type="submit">
            REGISTER
          </Button>
        </form>
      </div>
    </React.Fragment>
  )
}
