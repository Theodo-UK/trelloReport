import axios from "axios";
import type { TrelloCard, TrelloList } from "./types";

const authParams = {
  params: {
    key: process.env.API_KEY,
    token: process.env.TOKEN,
  },
};

export const round = (number: number) => Math.round(number * 100) / 100;

export const add = (num1: number | undefined, num2: number | undefined) => {
  return round((num1 || 0) + (num2 || 0));
};

export const getBoardLists = async (): Promise<{ data: TrelloList[] }> =>
  await axios.get("https://api.trello.com/1/boards/5b0d3699d6403ba794097666/lists", authParams);

export const getListTickets = async (lists: { data: TrelloList[] }, listDescription: string) => {
  const list = lists.data.find((list) => list.name.includes(listDescription));
  const trelloCards: { data: TrelloCard[] } = await axios.get(
    `https://api.trello.com/1/lists/${list?.id}/cards`,
    authParams
  );
  return trelloCards.data
    .filter((ticket) => !ticket.cover.color)
    .map((ticket) => ({
      number: ticket.idShort,
      labels: ticket.labels.map((label) => label.name),
      estimate: Number(ticket.name.match(/\((\d+\.*\d*)\)/)?.[1]) || undefined,
      postEstimate: Number(ticket.name.match(/\[(\d+\.*\d*)\]/)?.[1]) || undefined,
    }));
};
