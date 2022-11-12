import {ExchangeAnalyzer, ExchangeTrader} from "../index";
import {TradeBot} from "../../TradeBot";
import {D_PortfolioPosition, D_Currency, D_Operation, D_Security, D_Order, D_CurrencyBalance} from "@prisma/client";
import {Order} from "../../../example/types/Order";
import {OperationType, OrderStatus} from "../../utils";
import {AbstractTranslator} from "../../abstract/AbstractTranslator";
import {AbstractExchangeClient} from "../../abstract/AbstractExchangeClient";
import {extractOrderType} from "../../utils/extractTypes";

export class ExchangeWatcher<ExchangeClient extends AbstractExchangeClient<any, any, any, any, any, any, any>>{
    private readonly tradebot: TradeBot<ExchangeClient>
    private get translator(): AbstractTranslator<any, any, any, any, any, any, any> {
        return this.exchangeClient.translator
    }
    private get analyzer(): ExchangeAnalyzer<ExchangeClient> { return this.tradebot.analyzer }
    private get trader(): ExchangeTrader<ExchangeClient> { return this.tradebot.trader }
    private get exchangeClient(): ExchangeClient { return this.tradebot.exchangeClient }

    constructor(tradebot: TradeBot<ExchangeClient>) {
        this.tradebot = tradebot
    }

    async getPortfolio(): Promise<D_PortfolioPosition[]> {
        const { exchangeClient, translator } = this
        const portfolio = await exchangeClient.getPortfolio()
        return translator.portfolio(portfolio)
    }

    async getCurrenciesBalance(): Promise<D_CurrencyBalance[]> {
        const { exchangeClient, translator } = this
        const currencies = await exchangeClient.getCurrenciesBalance()
        return await Promise.all(currencies.map(c => translator.currencyBalance(c)))
    }

    async getCurrencies(): Promise<D_Currency[]> {
        const { exchangeClient, translator } = this
        const currencies = await exchangeClient.infoModule.getCurrencies()
        return await Promise.all(currencies.map(c => translator.currency(c)))
    }

    async getSecurity(ticker: string): Promise<D_Security>{
        const { exchangeClient, translator } = this
        const security = await exchangeClient.infoModule.getSecurity(ticker, false)
        if (!security) throw new Error(`Security with ticker "${ticker}" was not found`)
        return translator.security(security)
    }

    async getSecurityName(ticker: string): Promise<string> {
        const { exchangeClient } = this
        return await exchangeClient.infoModule.getSecurityName(ticker)
    }

    async getSecurityLastPrice(ticker: string): Promise<number> {
        const { exchangeClient } = this
        return await exchangeClient.infoModule.getSecurityLastPrice(ticker)
    }

    async getSecurityCurrency(ticker: string): Promise<D_Currency> {
        const { exchangeClient, translator } = this
        const currency = await exchangeClient.infoModule.getSecurityCurrency(ticker)
        return translator.currency(currency)
    }

    async getOperations(from: Date = new Date(0), to: Date = new Date()): Promise<D_Operation[]>{
        const { exchangeClient, translator } = this
        const relevantOperations = await exchangeClient.getOperationsAll(from, to)
        return translator.operations(relevantOperations
            .filter(operation => operation.operationType === "Buy" || operation.operationType === "Sell")
        )
    }

    async getOperationsBySecurity(ticker: string, from: Date = new Date(0), to: Date = new Date()): Promise<D_Operation[]>{
        const { exchangeClient, translator } = this
        const relevantOperations = await exchangeClient.getOperationsBySecurity(ticker, from, to)
        return translator.operations(relevantOperations
            .filter(operation => operation.operationType === "Buy" || operation.operationType === "Sell")
        )
    }

    onOrderSent(order: extractOrderType<ExchangeClient>, operation_type: OperationType, run_id: number | null = null): OrderStatus {
        const { translator, analyzer } = this
        const status = translator.orderStatus(order)
        translator.order(order)
            .then(d_order => analyzer.saveOrder({...d_order, status_first: status}, operation_type, run_id))
        return status
    }
}