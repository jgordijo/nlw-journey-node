
import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { getMailClient } from '../lib/mail';
import nodemailer from 'nodemailer';
import { dayjs } from '../lib/dayjs';
import { ClientError } from '../errors/client-error';

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        destination: z.string(),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
      })
    },
  }, async (request) => {
    const { destination, starts_at, ends_at } = request.body;
    const { tripId } = request.params;

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new ClientError('Start date must be in the future');
    }

    if (dayjs(ends_at).isBefore(starts_at)) {
      throw new ClientError('End date must be after start date');
    }

    await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        destination,
        starts_at,
        ends_at,
      }
    });

    return { trip_id: tripId };
  });
}