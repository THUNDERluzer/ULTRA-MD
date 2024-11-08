
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import dotenv from 'dotenv';
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk'
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import pino from 'pino';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js'
import { Boom } from '@hapi/boom'
const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion, 
    MessageRetryMap,
    makeCacheableSignalKeyStore, 
    jidNormalizedUser,
    PHONENUMBER_MCC
   } = await import('@whiskeysockets/baileys')
import moment from 'moment-timezone'
import NodeCache from 'node-cache'
import readline from 'readline'
import fs from 'fs'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; global.__require = function require(dir = import.meta.url) { return createRequire(dir) } 

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
// global.Fn = function functionCallBack(fn, ...args) { return fn.call(global.conn, ...args) }
global.timestamp = {
  start: new Date
}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

//global.opts['db'] = "mongodb+srv://dbdyluxbot:password@cluster0.xwbxda5.mongodb.net/?retryWrites=true&w=majority"

global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ?
      (opts['mongodbv2'] ? new mongoDBV2(opts['db']) : new mongoDB(opts['db'])) :
      new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)


global.DATABASE = global.db 
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(async function () {
    if (!global.db.READ) {
      clearInterval(this)
      resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
    }
  }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = chain(global.db.data)
}
loadDatabase()

//-- SESSION
global.authFile = `session`
const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion();
let phoneNumber = global.botNumber

const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion
if (!fs.existsSync(`./${authFile}/creds.json`) && !methodCodeQR && !methodCode) {
while (true) {
opcion = await question("\n\n✳️ Enter the connection method\n🔺 1 : for QR\n🔺 2 : for CÓDE\n\n\n")
if (opcion === '1' || opcion === '2') {
break
} else {
console.log("\n\n🔴 Enter only one option \n\n 1 o 2\n\n" )
}}
opcion = opcion
}

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : false,
  mobile: MethodMobile, 
  //browser: ['Chrome (Linux)', '', ''],
  browser: [ "Ubuntu", "Chrome", "20.0.04" ], 
  auth: {
  creds: state.creds,
  keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true, 
  generateHighQualityLinkPreview: true, 
  getMessage: async (clave) => {
  let jid = jidNormalizedUser(clave.remoteJid)
  let msg = await store.loadMessage(jid, clave.id)
  return msg?.message || ""
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,   
  version
  }

//--
global.conn = makeWASocket(connectionOptions)

if (opcion === '2' || methodCode) {
  if (!conn.authState.creds.registered) {  
  if (MethodMobile) throw new Error('⚠️ An Error Occurred')
  
  let addNumber
  if (!!phoneNumber) {
  addNumber = phoneNumber.replace(/[^0-9]/g, '')
	  const PHONENUMBER_MCC = {
    '93': 'Afghanistan',
    '355': 'Albania',
    '213': 'Algeria',
    '376': 'Andorra',
    '244': 'Angola',
    '1': 'Antigua and Barbuda',
    '54': 'Argentina',
    '374': 'Armenia',
    '297': 'Aruba',
    '61': 'Australia',
    '43': 'Austria',
    '994': 'Azerbaijan',
    '1': 'Bahamas',
    '973': 'Bahrain',
    '880': 'Bangladesh',
    '1': 'Barbados',
    '375': 'Belarus',
    '32': 'Belgium',
    '501': 'Belize',
    '229': 'Benin',
    '1': 'Bermuda',
    '975': 'Bhutan',
    '591': 'Bolivia',
    '387': 'Bosnia and Herzegovina',
    '267': 'Botswana',
    '55': 'Brazil',
    '673': 'Brunei',
    '359': 'Bulgaria',
    '226': 'Burkina Faso',
    '257': 'Burundi',
    '855': 'Cambodia',
    '237': 'Cameroon',
    '1': 'Canada',
    '238': 'Cape Verde',
    '345': 'Cayman Islands',
    '61': 'Central African Republic',
    '236': 'Chad',
    '56': 'Chile',
    '86': 'China',
    '61': 'Christmas Island',
    '57': 'Colombia',
    '269': 'Comoros',
    '682': 'Cook Islands',
    '506': 'Costa Rica',
    '225': 'Ivory Coast',
    '385': 'Croatia',
    '53': 'Cuba',
    '357': 'Cyprus',
    '420': 'Czech Republic',
    '45': 'Denmark',
    '253': 'Djibouti',
    '1': 'Dominica',
    '1809': 'Dominican Republic',
    '593': 'Ecuador',
    '20': 'Egypt',
    '503': 'El Salvador',
    '240': 'Equatorial Guinea',
    '291': 'Eritrea',
    '372': 'Estonia',
    '251': 'Ethiopia',
    '679': 'Fiji',
    '358': 'Finland',
    '33': 'France',
    '241': 'Gabon',
    '220': 'Gambia',
    '995': 'Georgia',
    '49': 'Germany',
    '233': 'Ghana',
    '350': 'Gibraltar',
    '30': 'Greece',
    '299': 'Greenland',
    '1': 'Grenada',
    '590': 'Guadeloupe',
    '1': 'Guam',
    '502': 'Guatemala',
    '224': 'Guinea',
    '245': 'Guinea-Bissau',
    '592': 'Guyana',
    '509': 'Haiti',
    '504': 'Honduras',
    '36': 'Hungary',
    '354': 'Iceland',
    '91': 'India',
    '62': 'Indonesia',
    '964': 'Iraq',
    '98': 'Iran',
    '354': 'Iceland',
    '39': 'Italy',
    '972': 'Israel',
    '1': 'Jamaica',
    '81': 'Japan',
    '962': 'Jordan',
    '7': 'Kazakhstan',
    '254': 'Kenya',
    '686': 'Kiribati',
    '965': 'Kuwait',
    '996': 'Kyrgyzstan',
    '856': 'Laos',
    '371': 'Latvia',
    '961': 'Lebanon',
    '266': 'Lesotho',
    '231': 'Liberia',
    '218': 'Libya',
    '423': 'Liechtenstein',
    '370': 'Lithuania',
    '352': 'Luxembourg',
    '853': 'Macau',
    '389': 'Macedonia',
    '261': 'Madagascar',
    '265': 'Malawi',
    '60': 'Malaysia',
    '960': 'Maldives',
    '223': 'Mali',
    '356': 'Malta',
    '692': 'Marshall Islands',
    '596': 'Martinique',
    '222': 'Mauritania',
    '230': 'Mauritius',
    '262': 'Mayotte',
    '52': 'Mexico',
    '691': 'Micronesia',
    '373': 'Moldova',
    '377': 'Monaco',
    '976': 'Mongolia',
    '382': 'Montenegro',
    '1': 'Montserrat',
    '212': 'Morocco',
    '258': 'Mozambique',
    '95': 'Myanmar',
    '264': 'Namibia',
    '674': 'Nauru',
    '977': 'Nepal',
    '31': 'Netherlands',
    '687': 'New Caledonia',
    '64': 'New Zealand',
    '505': 'Nicaragua',
    '227': 'Niger',
    '234': 'Nigeria',
    '683': 'Niue',
    '850': 'North Korea',
    '47': 'Norway',
    '968': 'Oman',
    '92': 'Pakistan',
    '680': 'Palau',
    '507': 'Panama',
    '675': 'Papua New Guinea',
    '595': 'Paraguay',
    '51': 'Peru',
    '63': 'Philippines',
    '48': 'Poland',
    '351': 'Portugal',
    '1': 'Puerto Rico',
    '974': 'Qatar',
    '40': 'Romania',
    '7': 'Russia',
    '250': 'Rwanda',
    '590': 'Saint Barthélemy',
    '1': 'Saint Helena',
    '758': 'Saint Kitts and Nevis',
    '590': 'Saint Martin',
    '1': 'Saint Vincent and the Grenadines',
    '685': 'Samoa',
    '378': 'San Marino',
    '966': 'Saudi Arabia',
    '221': 'Senegal',
    '381': 'Serbia',
    '248': 'Seychelles',
    '232': 'Sierra Leone',
    '65': 'Singapore',
    '421': 'Slovakia',
    '386': 'Slovenia',
    '677': 'Solomon Islands',
    '252': 'Somalia',
    '27': 'South Africa',
    '82': 'South Korea',
    '34': 'Spain',
    '94': 'Sri Lanka',
    '249': 'Sudan',
    '597': 'Suriname',
    '268': 'Eswatini',
    '46': 'Sweden',
    '41': 'Switzerland',
    '963': 'Syria',
    '886': 'Taiwan',
    '992': 'Tajikistan',
    '255': 'Tanzania',
    '66': 'Thailand',
    '670': 'Timor-Leste',
    '228': 'Togo',
    '676': 'Tonga',
    '1': 'Trinidad and Tobago',
    '216': 'Tunisia',
    '90': 'Turkey',
    '993': 'Turkmenistan',
    '256': 'Uganda',
    '380': 'Ukraine',
    '971': 'United Arab Emirates',
    '44': 'United Kingdom',
    '1': 'United States',
    '598': 'Uruguay',
    '998': 'Uzbekistan',
    '678': 'Vanuatu',
    '58': 'Venezuela',
    '84': 'Vietnam',
    '681': 'Wallis and Futuna',
    '967': 'Yemen',
    '260': 'Zambia',
    '263': 'Zimbabwe',
    // Add more if needed to reach 207
};
  if (!Object.keys(PHONENUMBER_MCC).some(v => addNumber.startsWith(v))) {
  console.log(chalk.bgBlack(chalk.bold.redBright("\n\n✴️ Your number must begin with the country code")))
  process.exit(0)
  }} else {
  while (true) {
  addNumber = await question(chalk.bgBlack(chalk.bold.greenBright("\n\n✳️ Enter Your Number\n\nExample: 94782543893\n\n\n\n")))
  addNumber = addNumber.replace(/[^0-9]/g, '')
  
  if (addNumber.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => addNumber.startsWith(v))) {
  break 
  } else {
  console.log(chalk.bgBlack(chalk.bold.redBright("\n\n✴️ Make sure to add the country code")))
  }}
 
  }
  
  setTimeout(async () => {
  let codeBot = await conn.requestPairingCode(addNumber)
  codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
  console.log(chalk.bold.red(`\n\n🟢   Your Code is:  ${codeBot}\n\n`)) 
  rl.close()
  }, 3000)
  }}
conn.isInit = false

if (!opts['test']) {
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error)
    if (opts['autocleartmp']) try {
      clearTmp()

    } catch (e) { console.error(e) }
  }, 60 * 1000)
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT)

/* Clear */
async function clearTmp() {
  const tmp = [tmpdir(), join(__dirname, './tmp')]
  const filename = []
  tmp.forEach(dirname => readdirSync(dirname).forEach(file => filename.push(join(dirname, file))))

  //---
  return filename.map(file => {
    const stats = statSync(file)
    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 1)) return unlinkSync(file) // 1 minuto
    return false
  })
}

setInterval(async () => {
	await clearTmp()
	//console.log(chalk.cyan(`✅  Auto clear  | Cleaned Temporary Files`))
}, 60000) //1 munto

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update
  if (isNewLogin) conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    console.log(await global.reloadHandler(true).catch(console.error))
    global.timestamp.connect = new Date
  }
  
  if (global.db.data == null) loadDatabase()
}
//-- cu 

process.on('uncaughtException', console.error)
// let strQuot = /(["'])(?:(?=(\\?))\2.)*?\1/

let isInit = true;
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('messages.update', conn.pollUpdate)
    conn.ev.off('group-participants.update', conn.participantsUpdate)
    conn.ev.off('groups.update', conn.groupsUpdate)
    conn.ev.off('message.delete', conn.onDelete)
    conn.ev.off('presence.update', conn.presenceUpdate)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }

  conn.welcome = ` Hello @user!\n\n🎉 *WELCOME* to the group @group!\n\n📜 Please read the *DESCRIPTION* @desc.`
  conn.bye = `👋GOODBYE @user \n\nSee you later!`
  conn.spromote = `*@user* has been promoted to an admin!`
  conn.sdemote = `*@user* is no longer an admin.`
  conn.sDesc = `The group description has been updated to:\n@desc`
  conn.sSubject = `The group title has been changed to:\n@group`
  conn.sIcon = `The group icon has been updated!`
  conn.sRevoke = ` The group link has been changed to:\n@revoke`
  conn.sAnnounceOn = `The group is now *CLOSED*!\nOnly admins can send messages.`
  conn.sAnnounceOff = `The group is now *OPEN*!\nAll participants can send messages.`
  conn.sRestrictOn = `Edit Group Info has been restricted to admins only!`
  conn.sRestrictOff = `Edit Group Info is now available to all participants!`

  conn.handler = handler.handler.bind(global.conn)
  conn.pollUpdate = handler.pollUpdate.bind(global.conn)
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
  conn.onDelete = handler.deleteUpdate.bind(global.conn)
  conn.presenceUpdate = handler.presenceUpdate.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)

  const currentDateTime = new Date()
  const messageDateTime = new Date(conn.ev)
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats)
      .filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats)
      .map(v => v[0])
  } else {
    const chats = Object.entries(conn.chats)
      .filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats)
      .map(v => v[0])
  }

  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('messages.update', conn.pollUpdate)
  conn.ev.on('group-participants.update', conn.participantsUpdate)
  conn.ev.on('groups.update', conn.groupsUpdate)
  conn.ev.on('message.delete', conn.onDelete)
  conn.ev.on('presence.update', conn.presenceUpdate)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
	  }

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = filename => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
  for (let filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      let file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then(_ => console.log(Object.keys(global.plugins))).catch(console.error)

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    let dir = global.__filename(join(pluginFolder, filename), true)
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`🌟 Plugin Updated - '${filename}'`)
      else {
        conn.logger.warn(`🗑️ Plugin Removed - '${filename}'`)
        return delete global.plugins[filename]
      }
    } else conn.logger.info(`✨ New plugin - '${filename}'`)
    let err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true
    })
    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
    else try {
      const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)
    } finally {
      global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
    }
  }
}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

// Quick Test
async function _quickTest() {
  let test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version'])
  ].map(p => {
    return Promise.race([
      new Promise(resolve => {
        p.on('close', code => {
          resolve(code !== 127)
        })
      }),
      new Promise(resolve => {
        p.on('error', _ => resolve(false))
      })
    ])
  }))
  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  console.log(test)
  let s = global.support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find
  }
  // require('./lib/sticker').support = s
  Object.freeze(global.support)

  if (!s.ffmpeg) conn.logger.warn('Please install ffmpeg for sending videos (pkg install ffmpeg)')
  if (s.ffmpeg && !s.ffmpegWebp) conn.logger.warn('Stickers may not animated without libwebp on ffmpeg (--enable-ibwebp while compiling ffmpeg)')
  if (!s.convert && !s.magick && !s.gm) conn.logger.warn('Stickers may not work without imagemagick if libwebp on ffmpeg doesnt isntalled (pkg install imagemagick)')
}

_quickTest()
  .then(() => conn.logger.info('✅ Quick Test Performed Successfully'))
  .catch(console.error)
