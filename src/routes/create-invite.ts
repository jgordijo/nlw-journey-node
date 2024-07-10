import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { dayjs } from '../lib/dayjs';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors/not-found-error';
import { ClientError } from '../errors/client-error';
import { getMailClient } from '../lib/mail';
import { env } from '../env';
import nodemailer from 'nodemailer';

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        email: z.string().email(),
      })
    },
  }, async (request) => {
    const { tripId } = request.params;
    const { email } = request.body;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    const participant = await prisma.participant.create({
      data: {
        email,
        trip_id: tripId,
      }
    });

    const formattedStartDate = dayjs(trip.starts_at).format('LL');
    const formattedEndDate = dayjs(trip.ends_at).format('LL');

    const mail = await getMailClient();

    const confirmationLink = `${env.API_BASE_URL}/participant/${participant.id}/confirm`;

    const message = await mail.sendMail({
      from: {
        name: 'Trip Planner',
        address: 'oi@planner.com',
      },
      to: participant.email,
      subject: 'Trip Confirmation',
      html: `
         <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você recebeu um convite para uma viagem a <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua viagem, clique no link abaixo:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}">Confirmar viagem</a>
          </p>
          <p></p>
          <p>Caso você não saiba do que se trata esse e-mail, apenas ignore-o.</p>
        </div>
        `.trim()
    });

    console.log(nodemailer.getTestMessageUrl(message))

    return { participant_id: participant.id };
  });
}