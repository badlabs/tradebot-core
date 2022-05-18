import fs from 'fs'
import { config } from '../../config';
import {createRollingFileLogger, Logger} from "simple-node-logger";
import { TradeBot } from 'bot/TradeBot';
import { BotApi } from './BotApi';


export class BotLogger {
  private readonly botApi: BotApi
  private readonly logger: Logger
  private _lastLogs: string[]

  private createLogsDirIfNotExist(){
    if (!fs.existsSync(config.logs.directory)) fs.mkdirSync(config.logs.directory)
  }

  constructor(tradeBot: TradeBot){
    this.createLogsDirIfNotExist()
    this.botApi = tradeBot.api
    this.logger = createRollingFileLogger({
      logDirectory:config.logs.directory,
      fileNamePattern:'trade-bot-<DATE>.log'
    })
    this._lastLogs = []
  }

  updateLastLogs(message: string){
    this._lastLogs.push(message)
    if (this._lastLogs.length > 30){
      this._lastLogs.shift()
    }
  }

  getLastLogs(): string{
    return this._lastLogs.join('\r\n')
  }

  log(message: string){
    this.logger.info(message)
    const messageWithTime = new Date().toLocaleString()+ ' ' + message
    console.log(messageWithTime)
    this.botApi?.webSocketServer.emit('log', messageWithTime)
    this.updateLastLogs(messageWithTime)
  }
}