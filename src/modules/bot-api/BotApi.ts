import { Express } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { TradeBot } from '../../TradeBot'
import { createWebSocketServer } from './ws'
import { initExpress } from './json-rpc'
import { config } from '../../config'
import {HandleError} from "../../utils";

export class BotApi {
  private readonly _tradeBot: TradeBot
  private _restServer: Express
  private _webSocketServer: Server
  private _httpServer: http.Server

  constructor(tradeBot: TradeBot){
    this._tradeBot = tradeBot
    this.configureServers()
  }

  @HandleError()
  private async configureServers(){
    this._restServer = initExpress(this._tradeBot)
    const { httpServer, webSocketServer } = createWebSocketServer({
      tradeBot: this._tradeBot,
      expressApp: this._restServer
    })
    this._httpServer = httpServer
    this._webSocketServer = webSocketServer
    this._httpServer.listen(config.api.port, () => {
      console.info(`[i] TradeBot is online on: `)
      console.info(`  [i] REST API - http://${config.api.host}:${config.api.port}/`)
      console.info(`  [i] WebSocket - ws://${config.api.host}:${config.api.port}/`)
    })
  }

  public get webSocketServer(): Server { return this._webSocketServer }
  public get httpServer(): http.Server { return this._httpServer }
}
