import Bitrue from "@assets/images/exchanges/Bitrue.png";
import Bittrex from "@assets/images/exchanges/Bittrex.png";
import Bybit from "@assets/images/exchanges/Bybit.png";
import CakeDeFi from "@assets/images/exchanges/CakeDeFi.png";
import DFX from "@assets/images/exchanges/DFX.png";
import EasyCrypto from "@assets/images/exchanges/EasyCrypto.png";
import Gateio from "@assets/images/exchanges/Gateio.png";
import Huobi from "@assets/images/exchanges/Huobi.png";
import Kucoin from "@assets/images/exchanges/Kucoin.png";
import Latoken from "@assets/images/exchanges/Latoken.png";
import Swyftx from "@assets/images/exchanges/Swyftx.png";
import Transak from "@assets/images/exchanges/Transak.png";

export interface ExchangeProps {
    image: string;
    name: string;
    url: string;
}

export const exchanges: ExchangeProps[] = [
    {
      name: "Kucoin",
      image: Kucoin,
      url: "https://www.kucoin.com/trade/DFI-BTC",
    },
    {
      name: "Huobi",
      image: Huobi,
      url: "https://www.huobi.com/en-us/exchange/dfi_usdt",
    },
    {
      name: "Gate.io",
      image: Gateio,
      url: "https://www.gate.io/trade/DFI_USDT",
    },
    {
      name: "Bittrex",
      image: Bittrex,
      url: "https://global.bittrex.com/Market/Index?MarketName=BTC-DFI",
    },
    {
      name: "Bitrue",
      image: Bitrue,
      url: "https://www.bitrue.com/trade/dfi_btc",
    },
    {
      name: "Latoken",
      image: Latoken,
      url: "https://latoken.com/exchange/DFI_BTC",
    },
    {
      name: "DFX",
      image: DFX,
      url: "https://dfx.swiss/en/",
    },
    {
      name: "Transak",
      image: Transak,
      url: "https://global.transak.com/",
    },
    {
      name: "EasyCrypto (Australia)",
      image: EasyCrypto,
      url: "https://easycrypto.com/au/buy-sell/dfi-defichain",
    },
    {
      name: "EasyCrypto (New Zealand)",
      image: EasyCrypto,
      url: "https://easycrypto.com/nz/buy-sell/dfi-defichain",
    },
    {
      name: "Bybit",
      image: Bybit,
      url: "https://www.bybit.com/en-US/trade/spot/DFI/USDT",
    },
    {
      name: "Swyftx",
      image: Swyftx,
      url: "https://swyftx.com/au/buy/defichain/",
    },
    {
      name: "Cake DeFi",
      image: CakeDeFi,
      url: "https://cakedefi.com/",
    },
];