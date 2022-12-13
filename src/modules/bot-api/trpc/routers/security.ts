import { publicProcedure, router } from '../trpc'
import { z } from 'zod'
import { TradeBot } from "../../../../TradeBot";

export default (tradeBot: TradeBot) => {
    return router({
        getAll: publicProcedure
            .input(z.null())
            .query(async () => {
                return await tradeBot.analyzer.getSecurities()
            }),
        updateAll: publicProcedure
            .input(z.null())
            .mutation(async () => {
                return await tradeBot.analyzer.updateSecurities()
            }),
        getAllFollowed: publicProcedure
            .input(z.null())
            .query(async () => {
                return await tradeBot.analyzer.getFollowedSecurities()
            }),
        updateAllFollowed: publicProcedure
            .input(z.null())
            .mutation(async () => {
                return await tradeBot.analyzer.updateFollowedSecurities()
            }),
        follow: publicProcedure
            .input(z.string())
            .mutation(async ({input}) => {
                return await tradeBot.analyzer.followSecurity(input)
            }),
        unfollow: publicProcedure
            .input(z.string())
            .mutation(async ({input}) => {
                return await tradeBot.analyzer.unfollowSecurity(input)
            })
    })
}