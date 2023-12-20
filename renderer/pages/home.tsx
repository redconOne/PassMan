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

export default function HomePage() {
  const [user, setUser] = React.useState('')
  const [userStatus, setUserStatus] = React.useState('')
  const [pass, setPass] = React.useState('')
  const [passStatus, setPassStatus] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter();

  const userChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const current = e.target.value;
    setUser(current)
    if (current.length < 4 || current.length > 20) {
      setUserStatus('Invalid Username Length')
      return
    }
    if (!/[0-9a-z]/gi.test(current)) {
      setUserStatus('Invalid Username Chars')
      return
    }
    setUserStatus('valid')
  }

  const passChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const current = e.target.value;
    setPass(current)
    if (current.length < 4 || current.length > 20) {
      setPassStatus('Invalid Password Length')
      return
    }
    if (!/[0-9a-z!@#$%^&*()]/gi.test(current)) {
      setPassStatus('Invalid Password Chars')
      return
    }
    setPassStatus('valid')
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (userStatus !== 'valid') {
      console.log(userStatus)
      return;
    }
    if (passStatus !== 'valid') {
      console.log(passStatus)
      return
    }

    const currentUser = { username: user, password: pass }
    window.ipc.send('validate-user', currentUser)
    window.ipc.on('validation', (validation) => {
      if (validation) {
        localStorage.setItem('currentUser', user);
        router.push('/passwords')
      } else {
        console.log('invalid username or password')
      }
    })
  }

  return (
    <React.Fragment>
      <Head>
        <title>Password Manager</title>
      </Head>
      <div>
        <p>
          ⚡ Password Manager ⚡
        </p>
        <Image src="/images/logo.png" alt="Logo image" width="256px" height="256px" />
        <hr />
        <h2>LOGIN</h2>
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
            LOGIN
          </Button>
        </form>
        <Link href="/register">
          <a>
            <Button variant="contained" size="medium" type="button">
              New Users Register Here
            </Button>
          </a>
        </Link>
      </div>
    </React.Fragment>
  )
}
