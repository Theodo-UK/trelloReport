import axios from "axios";
import "dotenv/config";

interface Ticket {
  number: string;
  labels: string[];
  estimate?: number;
  postEstimate?: number;
}

const authParams = {
  params: {
    key: process.env.API_KEY,
    token: process.env.TOKEN,
  },
};
const commonUrl = "https://api.trello.com/1";
const sprint = Number(process.argv[2]);

const isEpicOrProcessLabel = (labelName: string) => !!labelName.match(/(^process$)|(^\d{3})/);

const printData = async () => {
  const lists = await axios.get(`${commonUrl}/boards/5b0d3699d6403ba794097666/lists`, authParams);
  const doneColumn = lists.data.find((list: any) => list.name.includes(`Done #${sprint}`));
  const doneTickets = await axios.get(`${commonUrl}/lists/${doneColumn.id}/cards`, authParams);

  const processedTickets: Ticket[] = doneTickets.data.map((ticket: any) => ({
    number: ticket.idShort,
    labels: ticket.labels.map((label: any) => label.name),
    estimate: Number(ticket.name.match(/\((\d+\.*\d*)\)/)?.[1]) || undefined,
    postEstimate: Number(ticket.name.match(/\[(\d+\.*\d*)\]/)?.[1]) || undefined,
  }));

  const totalSprintPoints = processedTickets.reduce(
    (result, ticket) => {
      result.estimate = result.estimate + (ticket.estimate || 0);
      result.postEstimate = result.postEstimate + (ticket.postEstimate || 0);
      return result;
    },
    { estimate: 0, postEstimate: 0 }
  );

  const pointsByEpicOrProcess = processedTickets.reduce((result, ticket) => {
    ticket.labels.forEach((label) => {
      if (isEpicOrProcessLabel(label)) {
        result[label] = (result[label] || 0) + (ticket.postEstimate || 0);
      }
    });
    return result;
  }, {} as Record<string, number>);

  const ticketsWithoutEstimates = processedTickets
    .filter((ticket) => !ticket.estimate || !ticket.postEstimate)
    .map(({ number }) => number);

  const ticketsWithWrongLabels = processedTickets
    .filter((ticket) => ticket.labels.filter((label) => isEpicOrProcessLabel(label)).length !== 1)
    .map(({ number }) => number);

  const bugTickets = processedTickets
    .filter((ticket) => ticket.labels.some((label) => ["prod bug", "bug"].includes(label)))
    .map(({ number }) => number);

  const processPercentage = Math.round(
    (pointsByEpicOrProcess.process / totalSprintPoints.postEstimate) * 100
  );

  console.log("SPRINT POINTS: ", totalSprintPoints.estimate);
  console.log("SPRINT POST ESTIMATE POINTS: ", totalSprintPoints.postEstimate);
  console.log("PROCESS PERCENTAGE: ", processPercentage + "%");
  console.log("TICKETS WITHOUT ESTIMATES: ", ticketsWithoutEstimates);
  console.log("TICKETS WITH WRONG LABELS: ", ticketsWithWrongLabels);
  console.log("POINTS BY EPIC", pointsByEpicOrProcess);
  console.log("BUG TICKETS: ", bugTickets);
};

printData();
