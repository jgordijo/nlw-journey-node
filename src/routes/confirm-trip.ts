import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { getMailClient } from '../lib/mail';
import nodemailer from 'nodemailer';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');
dayjs.extend(localizedFormat);

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trip', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
  }, async (request) => {
    const { tripId } = request.params;
    
    return tripId;
  });
}