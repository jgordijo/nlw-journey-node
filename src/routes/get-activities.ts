import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { dayjs } from '../lib/dayjs';
import { NotFoundError } from '../errors/not-found-error';

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
  }, async (request) => {
    const { tripId } = request.params;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        activities: {
          orderBy: {
            occurs_at: 'asc',
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    const tripDurationInDays = dayjs(trip.ends_at).diff(dayjs(trip.starts_at), 'days');

    const activities = Array.from({ length: tripDurationInDays + 1 }, (_, index) => {
      const date = dayjs(trip.starts_at).add(index, 'day');

      return {
        date,
        activities: trip.activities.filter(activity => dayjs(activity.occurs_at).isSame(date, 'day')),
      };
    });

    return { activities };
  });
}