import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import Store from 'electron-store'
import { createWindow } from './helpers'
import crypto from 'crypto';

const isProd = process.env.NODE_ENV === 'production'


if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

interface UserObject {
  user: string
  pass: Buffer
}

interface Password {
  username: string
  password: Buffer
}

interface Platform {
  platform: Password[]
}

interface PasswordList {
  platforms: Platform[]
}

interface UserRecord {
  username: string
  salt: string
  derivedKey: any
  passwordList: PasswordList[]
}

type StoreType = {
  users: UserObject[]
  userRecords: UserRecord[]
}

const userRecordsStore = new Store<StoreType>({ name: 'userRecords' })

const registerUser = async (username: string, pass: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await generateKeyFromPassword(pass, salt, 1000, 32);

  return { username: username.toLowerCase(), salt, derivedKey, passwordList: [] };
}

const generateKeyFromPassword = (password, salt, iterations, keyLength) => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString('hex'));
      }
    });
  });
}

const loginUser = async (passwordAttempt: string, storedUser: UserRecord) => {
  try {
    const enteredKey = await generateKeyFromPassword(passwordAttempt, storedUser.salt, 1000, 32);
    const passwordMatch = enteredKey === storedUser.derivedKey;
    return passwordMatch;
  } catch (error) {
    console.error('Error during login:', error);
    return false;
  }
}

ipcMain.on('get-passwords', (event) => {
  const userRecords = userRecordsStore.get('userRecords' || []);
  let response = [];

  for (const record of userRecords) {
    if (record.username === arg.username.toLowerCase()) {
      response = record.passwordList;
      break;
    }
  }

  event.reply('passwords', response);
})

ipcMain.on('validate-user', async (event, arg) => {
  const userRecords = userRecordsStore.get('userRecords') || []
  let found = false

  for (const record of userRecords) {
    if (record.username === arg.username.toLowerCase()) {
      found = await loginUser(arg.password, record);
      break
    }
  }

  event.reply('validation', found)
})

ipcMain.on('add-user', async (_event, arg) => {
  const userRecords = userRecordsStore.get('userRecords') || [];

  for (const record of userRecords) {
    if (record.username === arg.username.toLowerCase()) {
      _event.sender.send('username-taken');
      return;
    }
  }

  const userRecord = await registerUser(arg.username, arg.password);
  userRecords.push(userRecord);
  userRecordsStore.set('userRecords', userRecords);

  _event.sender.send('user-added-successfully')
})
