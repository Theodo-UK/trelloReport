import axios from "axios";
import "dotenv/config";
import { add, getBoardLists, getListTickets } from "./utils";

const sprint = Number(process.argv[2]);

const printData = async () => {
  const lists = await getBoardLists();

  const readyForTrTickets = await getListTickets(lists, "Ready for TR");
  const readyForDevTickets = await getListTickets(lists, "Ready for dev");
  const doingTickets = await getListTickets(lists, "Doing");
  const crTickets = await getListTickets(lists, "Code Review");
  const deployingTickets = await getListTickets(lists, "Deploying");
  const frTickets = await getListTickets(lists, "Functional Review");
  const tvTickets = await getListTickets(lists, `To Validate #${sprint}`);
  const doneTickets = await getListTickets(lists, `Done #${sprint}`);

  const pointsInDone = doneTickets.reduce((result, ticket) => add(result, ticket.postEstimate), 0);
  const pointsInTv = tvTickets.reduce((result, ticket) => add(result, ticket.postEstimate), 0);
  const ticketsInStock = [...doingTickets, ...crTickets, ...deployingTickets, ...frTickets].map(
    (ticket) => ticket.number
  );
  const ticketsInReadyForTR = readyForTrTickets.length;
  const pointsInReadyForDev = readyForDevTickets
    .filter((ticket) => !ticket.labels.includes("process"))
    .reduce((result, ticket) => add(result, ticket.estimate), 0);

  console.table({
    "points in 'Done'": pointsInDone,
    "points in 'To Validate'": pointsInTv,
    "tickets in stock": ticketsInStock.join(", ") || "-",
    "tickets in 'Ready for TR'": ticketsInReadyForTR,
    "points in 'Ready for TR'": pointsInReadyForDev,
  });
};

printData();
