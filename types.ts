export interface TrelloList {
  id: string;
  name: string;
  pos: number;
  closed: boolean;
  idBoard: string;
  subscribed: boolean;
}

interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string;
}

export interface TrelloCard {
  id: string;
  idShort: string;
  name: string;
  url: string;
  labels: TrelloLabel[];
  cover: { color: string | null };
  [key: string]: unknown;
}

export interface ProcessedTicket {
  number: string;
  labels: string[];
  estimate?: number;
  postEstimate?: number;
}
