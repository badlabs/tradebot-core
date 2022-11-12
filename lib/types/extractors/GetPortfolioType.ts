import {AbstractExchangeClient} from "../../abstract";
import {SubjectAreaTemplate} from "../SubjectArea";

export type GetPortfolioType<T> =
    T extends AbstractExchangeClient<
            any, SubjectAreaTemplate<any, any, any, any, infer PortfolioType>> ? PortfolioType :
        T extends SubjectAreaTemplate<any, any, any, any, infer PortfolioType> ? PortfolioType : never