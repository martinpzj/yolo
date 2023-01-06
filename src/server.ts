import express from 'express'
import winston from 'winston'
import * as expressWinston from 'express-winston'
import morgan from 'morgan'
import logger from './utils'

const app = express()
const port = 7777

// Using expressWinston package, this logs all http requests to the server but not sure
// if this is what I want if to use a logger all throughout the app
// app.use(
//   expressWinston.logger({
//     transports: [new winston.transports.Console()],
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.json()
//     ),
//     meta: true, // optional: control whether you want to log the meta data about the request (default to true)
//     msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
//     expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
//     colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
//     ignoreRoute: function (req, res) {
//       return false
//     } // optional: allows to skip some log messages based on request and/or response
//   })
// )

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.http(message.trim())
    }
  }
)

app.use(morganMiddleware)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/test', (req, res) => {
  logger.info('TESTING LOGGER')
  res.json({ hello: 'world' })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
