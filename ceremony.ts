import "dotenv/config";
import { add, getBoardLists, getListTickets, round } from "./utils";

const sprint = Number(process.argv[2]);

const isEpicOrProcessLabel = (labelName: string) => !!labelName.match(/(^process$)|(^\d{3})/);

const printData = async () => {
  const lists = await getBoardLists();
  const doneTickets = await getListTickets(lists, `Done #${sprint}`);
  const tvTickets = await getListTickets(lists, `To Validate #${sprint}`);
  const allTickets = [...doneTickets, ...tvTickets];

  const ogEstimatePoints = allTickets.reduce((tot, ticket) => add(tot, ticket.estimate), 0);

  const postEstimatePoints = allTickets.reduce((tot, ticket) => add(tot, ticket.postEstimate), 0);

  const pointsByEpicOrProcess = allTickets.reduce((result, ticket) => {
    ticket.labels.forEach((label) => {
      if (isEpicOrProcessLabel(label)) {
        result[label] = add(result[label], ticket.postEstimate);
      }
    });
    return result;
  }, {} as Record<string, number>);

  const ticketsWithoutEstimates = allTickets
    .filter((ticket) => !ticket.estimate || !ticket.postEstimate)
    .map((ticket) => ticket.number);

  const ticketsWithWrongLabels = allTickets
    .filter((ticket) => ticket.labels.filter((label) => isEpicOrProcessLabel(label)).length !== 1)
    .map((ticket) => ticket.number);

  const bugTickets = allTickets
    .filter((ticket) => ticket.labels.some((label) => ["prod bug", "bug"].includes(label)))
    .map((ticket) => ticket.number);

  const processPercentage = round((pointsByEpicOrProcess.process / postEstimatePoints) * 100);

  console.table({
    "sprint OG points": ogEstimatePoints,
    "sprint post estimate points": postEstimatePoints,
    "process percentage": processPercentage,
    "tickets without estimates": ticketsWithoutEstimates.join(", ") || "-",
    "tickets with wrong labels": ticketsWithWrongLabels.join(", ") || "-",
    "bug tickets": bugTickets.join(", "),
  });
  console.table(pointsByEpicOrProcess);
};

printData();
