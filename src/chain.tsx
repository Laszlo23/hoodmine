import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setFieldSeed } from "./world.ts";

export const CHAIN_ID = 4663;
export const CHAIN_HEX = "0x1237";
export const RPC = "https://rpc.mainnet.chain.robinhood.com";
export const EXPLORER = "https://robinhoodchain.blockscout.com";

export interface ChainLive {
  ready: boolean;
  live: boolean;
  block: number | null;
  anchor: number | null;
}

const ChainContext = createContext<ChainLive>({
  ready: false,
  live: false,
  block: null,
  anchor: null,
});

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

function provider(): EthereumProvider | null {
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
}

async function rpc(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await response.json()) as { result?: unknown; error?: { message?: string } };
  if (json.error) throw new Error(json.error.message ?? "Robinhood Chain rejected the call");
  return json.result;
}

function seedFrom(hash: string) {
  return Number.parseInt(hash.slice(2, 10), 16) || 1;
}

export function ChainProvider({ children }: { children: ReactNode }) {
  const [chain, setChain] = useState<ChainLive>({
    ready: false,
    live: false,
    block: null,
    anchor: null,
  });

  useEffect(() => {
    let stop = false;
    let settled = false;
    const localSeed = () => {
      if (settled || stop) return;
      settled = true;
      setFieldSeed(Number(new Date().toISOString().slice(0, 10).replaceAll("-", "")) || 1);
      setChain((current) => ({ ...current, ready: true, live: false }));
    };
    const boot = async () => {
      const hex = (await rpc("eth_blockNumber", [])) as string;
      const latest = Number.parseInt(hex, 16);
      if (!stop && !settled) setChain((current) => ({ ...current, block: latest }));
      const anchor = Math.floor(latest / 1_000_000) * 1_000_000;
      const block = (await rpc("eth_getBlockByNumber", [`0x${anchor.toString(16)}`, false])) as {
        hash?: string;
      };
      if (!block.hash) throw new Error("Anchor block has no hash");
      if (settled || stop) return;
      settled = true;
      setFieldSeed(seedFrom(block.hash));
      setChain({ ready: true, live: true, block: latest, anchor });
    };
    const fail = window.setTimeout(localSeed, 2800);
    boot()
      .then(() => window.clearTimeout(fail))
      .catch(() => {
        window.clearTimeout(fail);
        localSeed();
      });
    return () => {
      stop = true;
      window.clearTimeout(fail);
    };
  }, []);

  useEffect(() => {
    if (!chain.ready || !chain.live) return;
    const id = window.setInterval(() => {
      rpc("eth_blockNumber", [])
        .then((hex) => {
          setChain((current) => ({ ...current, block: Number.parseInt(String(hex), 16) }));
        })
        .catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(id);
  }, [chain.ready, chain.live]);

  return <ChainContext value={chain}>{children}</ChainContext>;
}

export function useChain() {
  return useContext(ChainContext);
}

function toHex(text: string) {
  const bytes = new TextEncoder().encode(text);
  return `0x${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function sealFind(x: number, y: number, title: string) {
  const eth = provider();
  if (!eth) throw new Error("Open this in a wallet browser to seal the find.");
  const chainParams = {
    chainId: CHAIN_HEX,
    chainName: "Robinhood Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: [RPC],
    blockExplorerUrls: [EXPLORER],
  };
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_HEX }] });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) throw error;
    await eth.request({ method: "wallet_addEthereumChain", params: [chainParams] });
  }
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  const from = accounts[0];
  if (!from) throw new Error("No account on Robinhood Chain.");
  const hash = (await eth.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: from,
        value: "0x0",
        data: toHex(`HOOD//MINE ${x},${y} ${title}`),
      },
    ],
  })) as string;
  return hash;
}

export function txUrl(hash: string) {
  return `${EXPLORER}/tx/${hash}`;
}

export function blockUrl(block: number) {
  return `${EXPLORER}/block/${block}`;
}
