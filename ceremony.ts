import "dotenv/config";
import { add, getBoardLists, getListTickets, round } from "./utils";

const sprint = Number(process.argv[2]);

const isEpicOrProcessLabel = (labelName: string) => !!labelName.match(/(^process$)|(^\d{3})/);

const printData = async () => {
  const lists = await getBoardLists();
  const doneTickets = await getListTickets(lists, `Done #${sprint}`);

  const totalSprintPoints = doneTickets.reduce(
    (result, ticket) => {
      result.estimate = add(result.estimate, ticket.estimate);
      result.postEstimate = add(result.postEstimate, ticket.postEstimate);
      return result;
    },
    { estimate: 0, postEstimate: 0 }
  );

  const pointsByEpicOrProcess = doneTickets.reduce((result, ticket) => {
    ticket.labels.forEach((label) => {
      if (isEpicOrProcessLabel(label)) {
        result[label] = add(result[label], ticket.postEstimate);
      }
    });
    return result;
  }, {} as Record<string, number>);

  const ticketsWithoutEstimates = doneTickets
    .filter((ticket) => !ticket.estimate || !ticket.postEstimate)
    .map((ticket) => ticket.number);

  const ticketsWithWrongLabels = doneTickets
    .filter((ticket) => ticket.labels.filter((label) => isEpicOrProcessLabel(label)).length !== 1)
    .map((ticket) => ticket.number);

  const bugTickets = doneTickets
    .filter((ticket) => ticket.labels.some((label) => ["prod bug", "bug"].includes(label)))
    .map((ticket) => ticket.number);

  const processPercentage = round(pointsByEpicOrProcess.process / totalSprintPoints.postEstimate);

  console.table({
    "sprint points": totalSprintPoints.estimate,
    "sprint post estimate": totalSprintPoints.postEstimate,
    "process percentage": processPercentage,
    "tickets without estimates": ticketsWithoutEstimates.join(", ") || "-",
    "tickets with wrong labels": ticketsWithWrongLabels.join(", ") || "-",
    "bug tickets": bugTickets.join(", "),
  });
  console.table(pointsByEpicOrProcess);
};

printData();
