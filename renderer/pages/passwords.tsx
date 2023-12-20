import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Passwords() {
  const [passwords, setPasswords] = React.useState([]);
  React.useEffect(() => {
    window.ipc.on('passwords', (passwords: []) => {
      setPasswords(passwords)
    });

    window.ipc.send('get-passwords', localStorage.getItem('currentUser'));
  }, []);


  return (
    <React.Fragment>
      <Head>
        <title>Pass Man</title>
      </Head>
      <div>
        <p>
          ⚡ Passwords ⚡
          <Link href="/home">
            <a>Go to home page</a>
          </Link>
        </p>
      </div>
    </React.Fragment>
  )
}
