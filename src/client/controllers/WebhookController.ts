// import { Request, Response } from "express";
// import Stripe from "stripe";

// import UserService from "../services/UserService.js";

// const stripe = new Stripe(
//   process.env.STRIPE_SECRET_KEY!
// );

// class WebhookController {

//   async handle(
//     req: Request,
//     res: Response
//   ): Promise<Response> {

//     const sig = req.headers["stripe-signature"];

//     if (!sig) {
//       return res.status(400).send(
//         "Webhook Error: assinatura do Stripe ausente."
//       );
//     }

//     let event: Stripe.Event;

//     try {

//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );

//     } catch (err: unknown) {

//       const message =
//         err instanceof Error
//           ? err.message
//           : "Erro desconhecido";

//       return res
//         .status(400)
//         .send(`Webhook Error: ${message}`);
//     }

//     if (event.type === "checkout.session.completed") {

//       const session =
//         event.data.object as Stripe.Checkout.Session;

//       const userId =
//         session.client_reference_id;

//       if (!userId) {
//         return res.status(400).json({
//           error: "Usuário não identificado no checkout."
//         });
//       }

//       await UserService.virarPro(userId);

//       console.log(
//         `[SUCESSO] Usuário ${userId} atualizado via Webhook.`
//       );
//     }

//     return res.status(200).json({
//       received: true
//     });
//   }
// }

// export default new WebhookController();