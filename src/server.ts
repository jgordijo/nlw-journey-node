import cors from '@fastify/cors';
import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { confirmParticipant } from './routes/confirm-participant';
import { confirmTrip } from './routes/confirm-trip';
import { createTrip } from "./routes/create-trip";
import { createActivity } from './routes/create-activity';
import { getActivities } from './routes/get-activities';
import { createLink } from './routes/create-link';
import { getLinks } from './routes/get-links';
import { errorHandler } from './error-handler';
import { getTripDetails } from './routes/get-trip';
import { getParticipant } from './routes/get-participant';
import { updateTrip } from './routes/update-trip';
import { getTripParticipants } from './routes/get-trip-participants';
import { env } from './env';

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setErrorHandler(errorHandler);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getTripDetails);
app.register(getParticipant);
app.register(updateTrip);
app.register(getTripParticipants);


app.listen({ port: env.PORT }).then(() => {
  console.log("Server is running on port 3333");
});
